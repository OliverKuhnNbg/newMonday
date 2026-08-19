// Why: Using string literal types instead of generic strings enforces strict compile-time
// safety, preventing silent logic errors when evaluating device states across the application.
export type DeviceStatus = 'online' | 'offline' | 'maintenance';

export interface Device {
  id: string;
  name: string;
  serial: string;
  status: DeviceStatus;
  battery: number;
  lastSeen: string;
  locationId: string;
  // Why: Explicitly required by the API contract to prevent N+1 HTTP requests
  // from the frontend for resolving location references[cite: 2].
  locationName: string;
}

// Why: A generic pagination envelope decouples the pagination logic from the specific
// domain entity. This mirrors the exact response structure required by the API contract[cite: 2].
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

// Why: Exporting a concrete type alias keeps the service signatures clean and domain-specific.
export type DeviceResponse = PaginatedResponse<Device>;
