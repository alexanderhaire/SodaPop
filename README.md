# DeFi Advisor

## Overview
AI-powered desktop web app:
- **Frontend:** React + TypeScript + chat UI
- **Backend:** Node.js + TypeScript + Express
- **Conversational AI:** Routes that call an LLM to build structured trade instructions
- **DeFi integrations:** Wrappers for Uniswap, Aave, Compound, Yearn, 1inch, etc.

The AI agent acts as a conversational financial advisor—collecting user goals and risk preferences, recommending an on-chain strategy across multiple protocols, and, upon user approval, executing live transactions.

---

## Folder Structure

```
.
├── frontend/                ← React-TypeScript app
│   ├── public/              ← Static assets
│   └── src/
│       ├── api/             ← Axios wrappers for backend endpoints
│       ├── components/      ← Chat UI, Dashboard widgets, etc.
│       ├── context/         ← App context (authentication, chat state)
│       ├── hooks/           ← Custom React hooks (useChat, useWallet, etc.)
│       ├── pages/           ← Top-level pages (Login, Dashboard, ChatPage, Settings)
│       ├── styles/          ← Global CSS/SCSS or Tailwind config
│       ├── App.tsx          ← Root component
│       └── main.tsx         ← React entrypoint
│   ├── tsconfig.json
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 ← Node.js + TypeScript server
│   ├── src/
│   │   ├── ai/              ← LLM wrappers and function-calling logic
│   │   ├── controllers/     ← Route handlers (chat, portfolio, executeTrade)
│   │   ├── defi/            ← Protocol SDK wrappers (Uniswap, Aave, 1inch, etc.)
│   │   ├── services/        ← Business logic (portfolio optimizer, risk checks)
│   │   ├── utils/           ← Helpers (logging, error handling, formatting)
│   │   └── index.ts         ← Server entrypoint
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env                 ← Actual secrets (never commit)
│   └── .env.example         ← Template for environment variables
│
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

2. **Frontend**  
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - The development server will start at **http://localhost:5173**.  

3. **Backend**  
   (Open a new terminal)
   ```bash
   cd backend
   npm install
   ```
   - Copy `.env.example` to `.env` and fill in your secrets (`OPENAI_API_KEY`, `RPC_URL`, etc.).  
   - In `backend/package.json`, ensure you have:
     ```json
     "scripts": {
       "dev": "ts-node src/index.ts"
     }
     ```
   - Then run:
     ```bash
     npm run dev
     ```
   - The server will listen on **http://localhost:4000**.

---

## Environment Variables

- **OPENAI_API_KEY** — Your OpenAI API key for LLM access  
- **RPC_URL** — RPC endpoint (Infura, Alchemy, etc.) for on-chain calls  
- **1INCH_API_KEY** — (If needed) API key for 1inch aggregator  
- **AAVE_API_KEY**, **COMPOUND_API_KEY**, etc. — Other protocol keys as needed  

Copy `.env.example` to `.env` before running the backend.

---

## Next Steps


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
