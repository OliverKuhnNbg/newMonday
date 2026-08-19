import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ARCHITECTURE: Providing HttpClient at the application root ensures a singleton instance.
    // This allows for future scalability, such as registering global HTTP interceptors to handle
    // the artificial 15% HTTP 500 failure rate (FLAKY-mode) before it reaches the component level.
    provideHttpClient(),
  ],
};
