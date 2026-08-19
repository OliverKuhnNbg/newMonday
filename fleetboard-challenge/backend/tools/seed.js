// Erzeugt die Testdaten für die Challenge.
// Aufruf aus dem Projektwurzelverzeichnis:  node tools/seed.js
const fs = require('fs');

const STATUS = ['online', 'offline', 'maintenance'];
const CITIES = ['Hamburg', 'Leipzig', 'Ulm', 'Kassel', 'Bremen', 'Jena', 'Trier', 'Fulda'];

const locations = Array.from({ length: 40 }, (_, i) => ({
  id: 'loc-' + String(i + 1).padStart(3, '0'),
  name: CITIES[i % CITIES.length] + ' – Halle ' + (Math.floor(i / CITIES.length) + 1),
}));

const devices = Array.from({ length: 25000 }, (_, i) => ({
  id: 'dev-' + String(i + 1).padStart(5, '0'),
  name: 'Sensor ' + String(i + 1).padStart(5, '0'),
  serial: 'SN-' + (100000 + i * 7).toString(36).toUpperCase(),
  locationId: locations[i % locations.length].id,
  status: STATUS[i % 3 === 0 ? (i % 7 === 0 ? 2 : 1) : 0],
  firmware: '1.' + (i % 5) + '.' + (i % 3),
  battery: (i * 37) % 101,
  lastSeen: new Date(Date.UTC(2026, 6, 1 + (i % 45), i % 24, i % 60)).toISOString(),
}));

fs.mkdirSync('./data', { recursive: true });
fs.writeFileSync('./data/locations.json', JSON.stringify(locations));
fs.writeFileSync('./data/devices.json', JSON.stringify(devices));
console.log('seeded', devices.length, 'devices in', locations.length, 'locations');
