import { Routes } from '@angular/router';
import { DeviceListComponent } from './features/device-list/device-list.component';

export const routes: Routes = [
  // ARCHITECTURE: Binding the feature component directly to the root path.
  // This guarantees that any query parameters present on initial page load are
  // immediately captured by the component's ActivatedRoute subscription, satisfying
  // the strict "URL as Single Source of Truth" requirement.
  { path: '', component: DeviceListComponent },
  { path: '**', redirectTo: '' },
];
