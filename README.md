# newMonday

fleetboard-challenge

## Project structure

```text
fleetboard-challenge/
├── backend/
│   ├── src/
│   │   ├── core/             # HTTP server configuration & global error middleware
│   │   ├── features/
│   │   │   └── devices/
│   │   │       ├── devices.controller.js  # HTTP adapter (Express req/res to Domain mapping)
│   │   │       └── devices.service.js     # Pure Domain Logic (100% testable, no Express refs)
│   │   └── server.js         # Entry point (Maintains FLAKY=1 & 400ms latency requirement)
│   └── tools/
│       └── seed.js           # Test data generator
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/         # API Interceptors & Global Error Handling
    │   │   ├── features/
    │   │   │   └── device-list/
    │   │   │       ├── data-access/       # API Interfaces & strict DTOs
    │   │   │       ├── ui/                # Dumb Components (Semantic <table>, A11y Elements)
    │   │   │       └── device-list.component.ts # Smart Component (State = URL, RxJS sync)
    │   │   └── shared/       # Reusable, accessible UI primitives (Buttons, Spinners)
    │   └── main.ts
    └── proxy.conf.json       # Dev-Server proxy to bypass CORS
```
