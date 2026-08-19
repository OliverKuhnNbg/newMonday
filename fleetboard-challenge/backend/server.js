// FleetBoard API – Ausgangszustand.
// Dieser Code ist bewusst so, wie er ist. Du darfst ihn beliebig umbauen.
//
//   npm init -y && npm i express
//   node tools/seed.js
//   node server.js            (optional: FLAKY=1 node server.js)

const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

// Bitte drin lassen: simulierte Netzlatenz und optionaler Flaky-Modus.
app.use((req, res, next) => setTimeout(next, 400));
app.use((req, res, next) =>
  process.env.FLAKY && Math.random() < 0.15
    ? res.status(500).json({ error: 'upstream unavailable' })
    : next());

app.get('/api/devices', (req, res) => {
  const devices = JSON.parse(fs.readFileSync('./data/devices.json', 'utf8'));
  let result = devices;

  if (req.query.status) {
    result = result.filter(d => d.status == req.query.status);
  }
  if (req.query.q) {
    result = result.filter(d => d.name.indexOf(req.query.q) > -1);
  }
  if (req.query.sort) {
    result = result.sort((a, b) => (a[req.query.sort] > b[req.query.sort] ? 1 : -1));
  }

  res.json(result);
});

app.get('/api/devices/:id', (req, res) => {
  const devices = JSON.parse(fs.readFileSync('./data/devices.json', 'utf8'));
  res.json(devices.find(d => d.id == req.params.id));
});

app.get('/api/locations/:id', (req, res) => {
  const locations = JSON.parse(fs.readFileSync('./data/locations.json', 'utf8'));
  res.json(locations.find(l => l.id == req.params.id));
});

app.post('/api/devices/bulk-update', (req, res) => {
  const devices = JSON.parse(fs.readFileSync('./data/devices.json', 'utf8'));
  req.body.ids.forEach(id => {
    const d = devices.find(x => x.id == id);
    d.firmware = req.body.firmware;
  });
  fs.writeFileSync('./data/devices.json', JSON.stringify(devices));
  res.json({ ok: true });
});

app.listen(3000, () => console.log('api on http://localhost:3000'));
