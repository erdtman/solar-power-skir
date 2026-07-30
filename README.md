# solar-power-skir

Monitoring system for the farm in Skir. It started out tracking solar power
production and has grown to also monitor wind speed and the water level in the
water treatment plant. The backend is a Node.js/Express app backed by MongoDB,
and the frontends are small Vue 3 single-page apps built with webpack. The app
is deployed on Heroku (see `Procfile`).

## Overview

```
Energy meters (pulse/tick senders)          ──► POST /api/tick/:id ─────┐
Wind sensor (pulse counter)                 ──► POST /wind/count ───────┤──► MongoDB
Siemens LOGO! ◄── Particle Photon (client/) ──► POST /water/measurement ┘        │
                                                                                 ▼
                             Vue frontends (display / mobile / wind / water) ◄── REST API
```

### Solar power

Each building has an energy meter that sends "ticks" (pulses) to the server;
**1000 ticks = 1 kWh** (`TICKS_PER_KWH` in `server/model/Tick.js`). Ticks are
stored as timestamped documents in the `ticks` collection and aggregated on
read into current power (KW), per-period totals (kWh) and history graphs.

Monitored locations (meter ids):

| Meter id         | Name (Swedish)  |
|------------------|-----------------|
| `traktorgaraget` | Traktorgaraget  |
| `skogsglantan`   | Skogsgläntan    |
| `weave_room`     | Vävrummet       |
| `barn`           | Ladugården      |

### Wind

A wind sensor posts pulse counts to `/wind/count`. Counts are accumulated in
pre-bucketed documents keyed by time period (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`,
`YYYY-MM-DD-HH`) plus a `now` document, and converted to m/s with the factor
`count * 8.75 / seconds / 100`.

### Water level

A Particle Photon (`client/water.cpp`) on the local network polls the Siemens
LOGO! PLC (`GETVARS` against its `/AJAX` endpoint) every 5 minutes and forwards
the raw response to `/water/measurement`. The server extracts the hex-encoded
level from the response and converts it to centimeters (`hex * 1.5`). If
the level goes above 1250 cm or below 500 cm, the server sends an SMS **and**
makes a voice call (playing `view/water/voice/high.mp3` / `low.mp3`) via the
[46elks](https://46elks.com/) API.

Reading the PLC requires an authenticated session (`Security-Hint` header).
The server implements the reverse-engineered LOGO! web UAM challenge/response
login protocol (`server/water/login/`) and exposes it via
`/water/login/challenge1` and `/water/login/challenge2`. The Photon acts as a
middleman: it shuttles the challenge strings between server and PLC (the
server holds `LOGO_PASSWORD` and does the crypto) and keeps the resulting
session hint in RAM. It logs in on boot and re-logs-in automatically whenever
the PLC answers with a non-200 status (e.g. after a PLC restart), so no
manual login is needed. `test/login.js` exercises the login flow end-to-end.

## Project layout

```
client/
  water.cpp         Particle Photon firmware: polls the LOGO! PLC on the LAN
                    and forwards measurements to /water/measurement
server/
  app.js            Express entry point (serves ./view + mounts routers)
  db.js             MongoDB connection singleton
  api/index.js      Solar tick API (ticks, now, period, graph)
  wind/index.js     Wind API (count ingestion, now, graphs)
  wind/reader.js    One-off script: export wind data to winddata.csv
  water/index.js    Water API (measurement ingestion, alerts, LOGO! login)
  water/alert/      SMS + voice call sending via 46elks
  water/login/      Siemens LOGO! web login challenge/response implementation
  model/            Data access: Tick.js, Wind.js, Water.js
src/
  display/          Vue app for wall-mounted display (now + today + graphs)
  mobile/           Vue app for phones (now + day/month/year sections)
  wind/             Vue app with wind speed graphs (day/month/year)
  water/            Vue app with water level graph and alert thresholds
  common/Chart.vue  Shared Chart.js wrapper
view/               Static root served by Express; webpack outputs each
                    app's bundle to view/<name>/main.js next to its index.html
test/login.js       Manual test for the LOGO! login flow
```

Frontends are reached at `/display/`, `/mobile/`, `/wind/` and `/water/`.
All UI text is in Swedish.

## API

### Solar (`/api`)

| Method | Path                   | Description |
|--------|------------------------|-------------|
| POST   | `/api/tick/:id`        | Register ticks for meter `:id` (`tick_count` in body, defaults to 1) |
| GET    | `/api/now`             | Current power per location (kW, based on the last 5 minutes) |
| GET    | `/api/period`          | Produced kWh per location for a period. Query: `interval` (`DAY`/`MONTH`/`YEAR`), `lookback` (0 = current) |
| GET    | `/api/tick/:id`        | Raw tick documents for the interval |
| GET    | `/api/tick/:id/last`   | Produced kWh in the interval |
| GET    | `/api/tick/:id/graph`  | Bucketed history for graphs (hours/days/months depending on `interval`) |

### Wind (`/wind`)

| Method | Path                   | Description |
|--------|------------------------|-------------|
| POST   | `/wind/count`          | Register pulse count (`count` in body) |
| GET    | `/wind/now`            | Latest wind speed in m/s |
| GET    | `/wind/graph/:period`  | Graph data with p50/p75 (`hours`, `days`, `months` or `years`) |

### Water (`/water`)

| Method | Path                        | Description |
|--------|-----------------------------|-------------|
| POST   | `/water/measurement`        | Register a measurement from the LOGO! PLC; triggers alerts on limit breach |
| GET    | `/water/measurements`       | Level history, alert limits and latest value |
| GET    | `/water/login/challenge1`   | LOGO! login step 1: returns the `UAMCHAL` string to POST to the PLC |
| GET    | `/water/login/challenge2`   | LOGO! login step 2: takes the PLC reply (`?data=`), returns two plain-text lines: the `Security-Hint` header value and the `UAMLOGIN` body to POST to the PLC |

## Configuration

Configuration is read from environment variables (`.env` locally via dotenv,
config vars on Heroku):

| Variable            | Purpose |
|---------------------|---------|
| `MONGODB_URI`       | MongoDB connection string (falls back to `MONGOHQ_URL`) |
| `HOST` / `PORT`     | Server bind address (defaults `127.0.0.1:8080`) |
| `ELKS_USERNAME`     | 46elks API username |
| `ELKS_PASSWORD`     | 46elks API password |
| `ELKS_FROM_NUMBER`  | Caller id for alert voice calls |
| `ELKS_TO_NUMBER`    | Number to alert on high/low water level |
| `ELKS_ERROR_NUMBER` | Number to alert on monitoring errors |
| `LOGO_PASSWORD`     | Password for the Siemens LOGO! web login |

## Development

```bash
npm install
npm run build     # build frontends once (webpack, output to view/)
npm run watch     # rebuild frontends on change
node server/app.js
```

Then open e.g. <http://127.0.0.1:8080/mobile/>. A running MongoDB instance
(and `MONGODB_URI` pointing at it) is required.

## Deployment

Deployed on Heroku. `Procfile` runs `node server/app.js` and the
`heroku-postbuild` script builds the frontends in production mode.
