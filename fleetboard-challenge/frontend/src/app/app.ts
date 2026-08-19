import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // ARCHITECTURE: The root component acts strictly as a shell.
  // By delegating the view immediately to the RouterOutlet, we enforce that all feature
  // states (like the device list's active filters) are entirely driven by the URL routing tree.
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
