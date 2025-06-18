# SodaPop Horse Marketplace

## Overview
SodaPop is a full‑stack dApp for fractional racehorse ownership. It combines an
ERC‑1155 smart contract with a React frontend and an Express backend. Owners can
create new horse offerings with a share price and total supply, while investors
purchase and track shares using their crypto wallet. A built‑in chatbot powered
by OpenAI helps users navigate the app.

Technology stack:
- **Frontend:** React + TypeScript + Chakra UI
- **Backend:** Node.js + TypeScript + Express + MongoDB
- **Smart Contracts:** Solidity (HorseToken & HorseFactory)
- **Storage:** IPFS via nft.storage for horse metadata
- **Chatbot:** OpenAI‑powered assistant

---

## Folder Structure

```
.
├── frontend/                ← React-TypeScript app
│   ├── public/              ← Static assets
│   └── src/
│       ├── api/             ← Axios wrappers for backend endpoints
│       ├── components/      ← Chat UI and dashboard widgets
│       ├── context/         ← App context (authentication, wallet)
│       ├── hooks/           ← Custom React hooks
│       ├── pages/           ← CreateHorse, HorseList, HorseDetail, etc.
│       ├── styles/          ← Global CSS or Tailwind config
│       ├── App.tsx          ← Root component
│       └── main.tsx         ← React entrypoint
│   ├── tsconfig.json
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 ← Node.js + TypeScript server
│   ├── src/
│   │   ├── ai/              ← OpenAI helpers and personalization engine
│   │   ├── controllers/     ← Express route handlers
│   │   ├── models/          ← Mongoose models
│   │   ├── routes/          ← API routes
│   │   ├── utils/           ← Helpers (logging, config)
│   │   └── index.ts         ← Server entrypoint
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env                 ← Actual secrets (never commit)
│   └── .env.example         ← Template for environment variables
│
├── contracts/              ← Solidity contracts (HorseToken, HorseFactory)
├── migrations/             ← Truffle migration scripts
├── shared/                  ← Shared TypeScript types or utilities
│   └── types/
│       └── index.ts
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js & npm** (v 16+ recommended)  
- **Git** (to clone and version-control the project)  
- **MetaMask** (or another EIP-1193 wallet) installed in your browser for testing on local or testnet  
- (Optional) An RPC provider account (e.g. Infura, Alchemy) to connect to Ethereum or other EVM chains

### Clone & Install

1. Open a terminal and run:
   ```bash
   git clone https://github.com/your-username/SodaPop.git
   cd SodaPop
   ```

2. Install dependencies for both apps:
   ```bash
   ./setup.sh
   ```

3. Copy `.env.example` to `.env` and fill in your secrets.

4. Start the development servers (frontend and backend) in parallel:
   ```bash
   ./dev.sh
   ```
   - Frontend runs at **http://localhost:5173**
   - Backend listens on **http://localhost:4000**

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- **PORT** — Backend port (default `4000`)
- **OPENAI_API_KEY** — OpenAI key for the chatbot
- **ALCHEMY_API_URL** — RPC endpoint for contract calls
- **DEPLOYER_PRIVATE_KEY** — Private key for contract deployment
- **JWT_SECRET** — Secret used to sign JWTs
- **JWT_EXPIRES_IN** — Token lifetime (e.g. `1d`)
- **MONGO_URI** — MongoDB connection string
- **VITE_NFT_STORAGE_KEY** — API key for nft.storage uploads
- **VITE_HORSE_FACTORY_ADDRESS** — Deployed HorseFactory address

---

## Deployment

1. **Frontend**  
   ```bash
   cd frontend
   npm run build
   ```
   - Deploy the `dist/` folder to Vercel, Netlify, etc.

2. **Backend**  
   ```bash
   cd backend
   npx tsc
   ```
   - Run with PM2, Docker, or serverless.

---

## Auto Improvement

This repository includes an experimental script that calls OpenAI to suggest
refinements to any JavaScript or TypeScript file. Provide a file path and the
script will overwrite it with the model's response.

```bash
npm run improve -- path/to/file.ts
```

Set `OPENAI_API_KEY` in your environment before running.


---

## Contributing

1. Fork the repo and create a branch:
   ```bash
   git checkout -b feature/your-feature
   ```
2. Commit changes and push:
   ```bash
   git commit -m "Add feature X"
   git push origin feature/your-feature
   ```
3. Open a pull request with a clear description.

---

## License

This project is MIT-licensed. See [LICENSE](LICENSE) for details.
