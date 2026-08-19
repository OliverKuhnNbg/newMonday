import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, debounceTime, switchMap, catchError, distinctUntilChanged } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ARCHITECTURE: Semantic HTML structure with landmarks for assistive technologies. -->
    <main aria-labelledby="page-title">
      <h1 id="page-title">FleetBoard - Device Management</h1>

      <header class="controls">
        <label for="searchInput">Search Devices:</label>
        <input
          id="searchInput"
          type="text"
          [value]="currentQuery()"
          (input)="updateSearch($event)"
          placeholder="Search by name or serial..."
          autocomplete="off"
        />
      </header>

      <!-- ARCHITECTURE: aria-live region ensures screen readers announce dynamic state changes (loading/error) asynchronously without stealing focus. -->
      <div aria-live="polite" class="sr-only">
        @if (isLoading()) {
          Loading devices...
        }
        @if (error()) {
          An error occurred while loading devices.
        }
      </div>

      @if (error()) {
        <div class="error-banner" role="alert">
          <p>Failed to load data. The server might be unstable.</p>
          <button (click)="retry()">Retry Connection</button>
        </div>
      }

      @if (!error()) {
        <!-- ARCHITECTURE: Semantic table required for WCAG compliance regarding tabular data. -->
        <table aria-label="Device List">
          <thead>
            <tr>
              <th scope="col">
                <!-- ARCHITECTURE: aria-sort provides programmatic sorting context. -->
                <button (click)="updateSort('name')" [attr.aria-sort]="getAriaSort('name')">
                  Name
                </button>
              </th>
              <th scope="col">Location</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody [class.loading-overlay]="isLoading()">
            @for (device of devices(); track device.id) {
              <tr>
                <td>
                  <strong>{{ device.name }}</strong
                  ><br />
                  <small>{{ device.serial }}</small>
                </td>
                <td>{{ device.locationName }}</td>
                <td>
                  <!-- ARCHITECTURE: Never rely solely on color for status indicators (WCAG violation). Text is explicitly rendered. -->
                  <span
                    class="status-indicator"
                    [ngClass]="device.status"
                    aria-hidden="true"
                  ></span>
                  <span class="status-text">{{ device.status }}</span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="empty-state">No devices found matching your criteria.</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="pagination">
          <button
            [disabled]="currentPage() <= 1 || isLoading()"
            (click)="updatePage(currentPage() - 1)"
          >
            Previous
          </button>
          <span aria-live="polite">Page {{ currentPage() }}</span>
          <button
            [disabled]="isLoading() || devices().length < 25"
            (click)="updatePage(currentPage() + 1)"
          >
            Next
          </button>
        </div>
      }
    </main>
  `,
})
export class DeviceListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  devices = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<boolean>(false);

  // Local reflective state synced strictly from the URL.
  currentQuery = signal<string>('');
  currentSort = signal<string>('name');
  currentDir = signal<string>('asc');
  currentPage = signal<number>(1);

  constructor() {
    this.initializeStateSync();
  }

  private initializeStateSync() {
    // ARCHITECTURE: The URL acts as the absolute Single Source of Truth for the component state.
    // This inherently enables deep-linking, resilient page reloads, and sharing filtered views.
    this.route.queryParams
      .pipe(
        map((params) => {
          const query = params['q'] || '';
          const sort = params['sort'] || 'name';
          const dir = params['dir'] || 'asc';
          const page = parseInt(params['page'] || '1', 10);

          this.currentQuery.set(query);
          this.currentSort.set(sort);
          this.currentDir.set(dir);
          this.currentPage.set(page);

          return { q: query, sort, dir, page, pageSize: 25 };
        }),
        // ARCHITECTURE: 300ms debounce prevents API flooding during rapid keystrokes in the search input.
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        // ARCHITECTURE: switchMap is strictly required here to mitigate the artificial 400ms server latency.
        // It guarantees that stale, in-flight HTTP requests are aborted if a new query parameter is emitted,
        // entirely eliminating race conditions where an older response might overwrite a newer one.
        switchMap((params) => this.fetchDevices(params)),
      )
      .subscribe();
  }

  private fetchDevices(params: any): Observable<any> {
    this.isLoading.set(true);
    this.error.set(false);

    return this.http.get<any>('/api/devices', { params }).pipe(
      map((res) => {
        this.devices.set(res.items);
        this.isLoading.set(false);
      }),
      catchError(() => {
        // ARCHITECTURE: Graceful degradation for the FLAKY=1 mode. We swallow the explicit error object to prevent
        // leaking stack traces to the UI, and instead trigger a localized error state signal.
        this.error.set(true);
        this.isLoading.set(false);
        this.devices.set([]);
        return of(null);
      }),
    );
  }

  updateSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    // ARCHITECTURE: We do not mutate local state or trigger HTTP calls directly.
    // We exclusively mutate the URL, which pushes the new state through the RxJS pipeline.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  updateSort(field: string) {
    const newDir = this.currentSort() === field && this.currentDir() === 'asc' ? 'desc' : 'asc';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: field, dir: newDir, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  updatePage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  retry() {
    this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }

  getAriaSort(field: string): 'ascending' | 'descending' | 'none' {
    if (this.currentSort() !== field) return 'none';
    return this.currentDir() === 'asc' ? 'ascending' : 'descending';
  }
}
