# newMonday
fleetboard-challenge

## Project structure
```text
fleetboard-challenge/
├── backend/
│   ├── data/                   # JSON test data
│   ├── src/
│   │   ├── services/
│   │   │   └── device-query.service.js  # Pure functions: filtering, sorting, pagination
│   │   ├── routes/
│   │   │   └── device.routes.js         # Express HTTP bindings & 400/404 handling
│   │   └── tests/
│   │       └── device-query.spec.js     # Isolated service tests
│   └── server.js               # Entry point (latencies & FLAKY mode untouched)
└── frontend/
    └── src/app/
        ├── core/
        │   ├── http/           # API services (DeviceApiService)
        │   └── models/         # TypeScript interfaces (Device, PaginatedResponse)
        ├── shared/
        │   └── ui/             # Dumb components (LoadingSpinner, ErrorMessage)
        └── features/
            └── devices/
                ├── data-access/# State management (DeviceStore / Signal-based RxJS bridge)
                ├── ui/         # Dumb components (DeviceTableComponent, DeviceFiltersComponent)
                └── feature/    # Smart container (DeviceListComponent)
```
