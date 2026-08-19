// Architecture: This service is entirely decoupled from the HTTP layer.
// It accepts pure data arrays and query parameters, ensuring 100% testability
// without requiring a running server or mocking Express request objects.

class DeviceQueryService {
  constructor(devices, locations) {
    this.devices = devices;
    this.locationMap = new Map(locations.map((loc) => [loc.id, loc.name]));
  }

  query(params) {
    const {
      q,
      status,
      locationId,
      sort = "name",
      dir = "asc",
      page = 1,
      pageSize = 25,
    } = params;

    // Boundary Validations (400 Bad Request triggers)
    const validSortFields = ["name", "battery", "lastSeen", "status"];
    if (!validSortFields.includes(sort)) {
      throw new Error(`invalid_query: unknown sort field: ${sort}`);
    }

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(pageSize, 10);
    if (pageNum < 1 || sizeNum < 1 || sizeNum > 100) {
      throw new Error(
        "invalid_query: page must be >= 1 and pageSize between 1 and 100",
      );
    }

    let filtered = this.devices;

    // Filter Logic
    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerQ) ||
          d.serial.toLowerCase().includes(lowerQ),
      );
    }

    if (status) {
      // Normalize to array to handle single (?status=online) or multiple (?status=online&status=offline)
      const statuses = Array.isArray(status) ? status : [status];
      filtered = filtered.filter((d) => statuses.includes(d.status));
    }

    if (locationId) {
      filtered = filtered.filter((d) => d.locationId === locationId);
    }

    // Sort Logic
    filtered.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return dir === "asc" ? -1 : 1;
      if (valA > valB) return dir === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination & Mapping
    const total = filtered.length;
    const start = (pageNum - 1) * sizeNum;
    const paginatedItems = filtered.slice(start, start + sizeNum).map((d) => ({
      ...d,
      locationName: this.locationMap.get(d.locationId) || "Unknown",
    }));

    return { items: paginatedItems, page: pageNum, pageSize: sizeNum, total };
  }
}

module.exports = DeviceQueryService;
