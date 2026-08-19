// src/app/core/api/device.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeviceResponse } from '../models/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/devices';

  // Why: Isolates network I/O from UI components. Expects the query logic
  // (filtering, sorting, pagination) to be handled entirely by the backend API.
  getDevices(queryParams: Record<string, string | number>): Observable<DeviceResponse> {
    let params = new HttpParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.append(key, value.toString());
      }
    });

    return this.http.get<DeviceResponse>(this.API_URL, { params });
  }
}
