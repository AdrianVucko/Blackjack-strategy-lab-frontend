# Blackjack Strategy Lab — Frontend

React + Tailwind frontend for the Blackjack Strategy Lab backend. It renders the
optimal basic strategy and Monte-Carlo analysis computed by the API described in
[`docs/frontend-handoff.md`](docs/frontend-handoff.md).

## Stack

- **React 19** + **TypeScript** (Vite)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Plotly** via `react-plotly.js` (for the analytical charts)
- **Vitest** + Testing Library

## Getting started

```bash
npm install
cp .env.example .env      # optional; defaults to http://localhost:8000
npm run dev               # http://localhost:5173
```

The backend must be running for live data (see the handoff doc). The UI degrades
gracefully when it is offline (health badge turns red, the strategy chart shows a
retryable error).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Watch mode |
| `npm run typecheck` | `tsc` only |
| `npm run lint` | oxlint |

## Configuration

`VITE_API_BASE_URL` sets the backend origin (default `http://localhost:8000`).
CORS on the backend is preconfigured for the Vite port `5173`.

## Docker

Multi-stage build (Node builds the bundle, nginx serves it). nginx reverse-proxies
`/api` to the backend, so the browser only talks to one origin — no CORS.

### Full stack (frontend + backend)

`docker-compose.yml` brings up both services. The backend is built from the
sibling checkout `../Blackjack-strategy-lab-backend` (override with
`BACKEND_CONTEXT`), and the frontend waits for its healthcheck before starting.

```bash
docker compose up --build        # frontend http://localhost:5173, backend http://localhost:8000/docs
```

The frontend reaches the backend over the compose network as `http://backend:8000`;
run history persists in the `blackjack-data` volume.

### Frontend image only

Two independent knobs, because Vite inlines `VITE_*` at build time but the proxy
target is read at container start:

| Setting | When | Default | Purpose |
|---------|------|---------|---------|
| `VITE_API_BASE_URL` (build arg) | build | `/api` | Path the app calls; keep as `/api` to use the proxy |
| `BACKEND_URL` (env var) | runtime | `http://host.docker.internal:8000` | Where nginx forwards `/api/*` |

```bash
# Build once, point the proxy at any backend at run time
docker build -t blackjack-frontend .
docker run --rm -p 5173:80 -e BACKEND_URL=http://host.docker.internal:8000 blackjack-frontend
```

`/api/strategy/chart` → nginx → `${BACKEND_URL}/strategy/chart` (the `/api` prefix
is stripped).

## Structure

```
src/
├── api/            # typed fetch client + endpoint wrappers
├── components/     # shared UI (form controls, Plotly wrapper)
├── features/
│   ├── rules/      # Rules configurator (shared state driver)
│   └── strategy/   # Basic strategy chart + grid-building logic
├── hooks/          # useAsync (fetch-on-deps with AbortSignal)
├── lib/            # rule defaults + query serialization
├── state/          # RulesProvider context (shared Rules state)
└── types/          # contract types (handoff §7)
```

## Implemented

- **Rules configurator** — shared `Rules` state (context) that drives every
  other call. Decks, payout, splits, penetration, and the boolean rule toggles.
- **Basic strategy chart** — `GET /strategy/chart`, colour-coded hard/soft/pairs
  grid. Re-fetches on any rule change. Synthesizes the rows the API omits
  (hard ≤7 hit, ≥18 stand) and renders `5,5` as hard 10 per the contract.
- **Simulator** — `POST /simulate` + `/viz/bankroll` + `/viz/result-distribution`.
  Configurable rounds (with presets), bet, optional bankroll (enables
  risk-of-ruin) and seed. Stat cards from `statistics` plus the two Plotly
  charts.
- **Card-counting lab** — `POST /simulate/counting` + `/viz/counting/edge-curve`
  + `/viz/counting/true-count-distribution`. System picker (Hi-Lo / KO /
  Hi-Opt I), base bet, and a bet-ramp editor for `ramp_tiers` (defaults to the
  classic 1–12 Hi-Lo spread when off). Shows `average_bet` and the edge curve as
  the teaching centerpiece.

- **Run history** — `GET /simulate/runs` table of the most recent runs (refresh
  button) plus a by-ID lookup (`GET /simulate/runs/{id}`) that handles the 404
  case gracefully.

The two Plotly-heavy views (simulator, counting lab) are lazy-loaded; Plotly
ships as a shared on-demand chunk so it stays out of the initial bundle. All four
handoff views are now implemented.
