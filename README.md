# SodaPop Ascension Hub

SodaPop is a full-stack Solana launchpad that helps creators mint SPL tokens, stage rich listings, and provide investors with real-time portfolio telemetry. The project combines a Vite + React front end with a Node.js/Express API, MongoDB persistence, and OpenAI-powered assistants that generate launch copy, media summaries, and conversational guidance.

## Table of contents
1. [Highlights](#highlights)
2. [Architecture](#architecture)
3. [Directory structure](#directory-structure)
4. [Getting started](#getting-started)
5. [Environment variables](#environment-variables)
6. [Running the app](#running-the-app)
7. [Testing](#testing)
8. [Notable endpoints & scripts](#notable-endpoints--scripts)
9. [Contributing](#contributing)
10. [License](#license)

## Highlights
- **Launch Forge** – Create SPL tokens end-to-end from the browser. The form validates supply math, uploads hero art and supporting documents, and records the mint through the backend so new assets surface in the spotlight feed.
- **Spotlight marketplace** – Browse freshly launched tokens with curated metadata, hero imagery, and creator context pulled from MongoDB and on-chain activity.
- **Portfolio telemetry** – Wallet holders can review live holdings, creator allocations, and bonding-curve performance dashboards rendered with Recharts.
- **SodaSpot market view** – A trading-style surface that includes lightweight charts, order book mocks, and trade history to prototype price discovery flows.
- **SodaBot** – An OpenAI-powered copilot that summarizes ownership history, suggests next moves, and auto-fills launch copy or image alt text when creatives leave fields blank.
- **Image-to-metadata assist** – `/api/items/describe` accepts base64 images and returns a generated title/description pair to streamline listings.
- **Operational hardening** – The backend serves the compiled frontend with cache headers, optional email alerts, cron-based jobs, and JWT-protected routes for authenticated flows.

## Architecture
- **Frontend**: React 18, TypeScript, Chakra UI, Vite, TanStack Query, Recharts, Framer Motion, Solana Wallet Adapter.
- **Backend**: Node.js + Express, TypeScript, Mongoose, JWT authentication, OpenAI SDK, Multer uploads, cron workers.
- **Blockchain**: SPL token minting via `@solana/web3.js` and `@solana/spl-token`, plus portfolio persistence through MongoDB holdings.
- **AI integrations**: GPT-4o for vision-assisted metadata and GPT-4 chat completions for SodaBot.

## Directory structure
```
.
├── backend/               # Express API (TypeScript)
│   ├── src/
│   │   ├── ai/            # Prompt helpers
│   │   ├── controllers/   # Route handlers (auth, marketplace, portfolio, etc.)
│   │   ├── jobs/          # Background cron jobs
│   │   ├── middleware/    # Shared Express middleware
│   │   ├── models/        # Mongoose schemas (items, tokens, users)
│   │   ├── routes/        # Feature routes (SodaBot, tokens, items, uploads)
│   │   └── utils/         # Config, helpers
│   └── package.json
├── frontend/              # Vite + React SPA
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI primitives
│       ├── features/      # SodaSpot feature module (charts, order book)
│       ├── hooks/, utils/ # Client helpers
│       ├── pages/         # App screens (Welcome, Launch Forge, Analytics, etc.)
│       └── theme.ts       # Chakra theme overrides
├── shared/                # Cross-package TypeScript types
├── scripts/               # Tooling (OpenAI-driven auto-improve)
├── setup.sh               # Install helper for backend/frontend
├── dev.sh                 # Starts both servers in parallel
├── jest.config.js         # Root Jest config for backend tests
└── README.md
```

## Getting started
### Prerequisites
- **Node.js 18+** and **npm**
- **Git**
- A Solana wallet (Phantom, Backpack, etc.) for testing mint flows
- Optional: Access to a MongoDB deployment and an OpenAI API key

### Clone and install
```bash
git clone https://github.com/your-username/SodaPop.git
cd SodaPop
./setup.sh            # installs backend and frontend dependencies
```
You can install manually with `npm install` inside both `backend/` and `frontend/` if you prefer.

## Environment variables
Create `.env` files in `backend/` and `frontend/` (or export them in your shell) before running the stack.

### Backend (`backend/.env`)
| Variable | Description |
| --- | --- |
| `PORT` | API port (default `4000`). |
| `JWT_SECRET` | Secret string used to sign access tokens. |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1h`, `1d`). |
| `MONGO_URI` | MongoDB connection string; omit to run stateless prototypes. |
| `OPENAI_API_KEY` | Required for SodaBot chat and image captioning. |
| `SOLANA_RPC_URL` | Solana RPC endpoint (defaults to devnet). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ALERT_EMAIL` | Optional email alert configuration. |

### Frontend (`frontend/.env`)
| Variable | Description |
| --- | --- |
| `VITE_BACKEND_URL` | Origin of the backend when different from the frontend. Appends `/api` automatically. |
| `VITE_API_BASE_URL` | Explicit API base override (falls back to `/api`). |
| `VITE_SOLANA_RPC_URL` | Custom RPC URL for the wallet adapter. |
| `VITE_SAMPLE_METADATA_URL` | Optional JSON used to pre-fill the launch form. |
| `VITE_CLUSTER` | Display hint for the target cluster (defaults to `mainnet` in the UI copy). |

## Running the app
### Development
```bash
./dev.sh
```
This launches `npm run dev` in both `backend/` (ts-node-dev on port 4000) and `frontend/` (Vite on port 5173). The frontend proxies API calls to the backend via `/api`.

You can run the services separately if needed:
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

### Production build
```bash
cd frontend && npm run build    # outputs to frontend/dist
cd backend && npm run build     # compiles TypeScript to dist/
```
Serve `frontend/dist` behind a static host and point the backend at the same Mongo/OpenAI resources. The Express server automatically serves the built SPA with immutable cache headers for hashed assets.

## Testing
- **Backend unit tests**: `npm test` (from the repo root or inside `backend/`).
- **Frontend component tests**: `cd frontend && npm run test` (uses Vitest).

Add new tests before committing critical changes to ensure existing flows remain stable.

## Notable endpoints & scripts
- `POST /api/tokens/record` – Persists launched SPL tokens and creator allocations.
- `GET /api/portfolio?wallet=<address>` – Returns holdings, launch history, and creator share for a wallet.
- `POST /api/items/describe` – Generates title/description metadata from an image (requires OpenAI vision access).
- `POST /api/sodabot` – Chat endpoint powering the in-app assistant.
- `npm run improve -- path/to/file.ts` – Experimental script that asks OpenAI for inline refactors; use with caution.

## Contributing
1. Fork the repo and create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
2. Commit with clear messages and push your branch.
3. Open a pull request describing the change, tests, and any environment considerations.

## License
This project is distributed under the Business Source License 1.1. See [LICENSE](./LICENSE) for full terms.
