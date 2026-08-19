// src/app/features/device-list/device-list.component.ts
import { Component, inject, computed, Signal } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, merge, of, Observable } from 'rxjs';
import {
  switchMap,
  debounceTime,
  catchError,
  map,
  startWith,
  distinctUntilChanged,
} from 'rxjs/operators';
import { DeviceService } from '../../core/api/device.service';
import { DeviceResponse } from '../../core/models/device.model';

interface DeviceState {
  data: DeviceResponse | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css'],
})
export class DeviceListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deviceService = inject(DeviceService);

  private retryTrigger = new Subject<void>();

  // Why: Explicit type assertion ({} as Params) satisfies the strict ToSignalOptions overload.
  readonly queryParams = toSignal(this.route.queryParams, { initialValue: {} as Params });

  // Why: Bridging RxJS and Signals. We build the state observable first to handle
  // the asynchronous switchMap safely, ensuring loading states reset correctly on every URL change.
  private state$: Observable<DeviceState> = merge(
    this.route.queryParams,
    this.retryTrigger.pipe(map(() => this.route.snapshot.queryParams)),
  ).pipe(
    debounceTime(300),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    switchMap((params: Params) => {
      // Why: Sanitizing the Router Params to match our API Service signature strictly.
      const apiParams: Record<string, string | number> = {};
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          apiParams[key] = params[key];
        }
      });

      return this.deviceService.getDevices(apiParams).pipe(
        map((response) => ({ data: response, loading: false, error: null })),
        startWith({ data: null, loading: true, error: null }),
        catchError((err) =>
          of({ data: null, loading: false, error: err.message || 'Failed to fetch' }),
        ),
      );
    }),
  );

  // Why: Providing a strict initialValue guarantees the Signal never returns undefined.
  private deviceState: Signal<DeviceState> = toSignal(this.state$, {
    initialValue: { data: null, loading: true, error: null },
  });

  readonly devices = computed(() => this.deviceState().data?.items ?? []);
  readonly total = computed(() => this.deviceState().data?.total ?? 0);
  readonly loading = computed(() => this.deviceState().loading);
  readonly error = computed(() => this.deviceState().error);

  updateFilter(key: string, value: string | number | null) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onSearch(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.updateFilter('q', input);
  }

  retry() {
    this.retryTrigger.next();
  }
}
