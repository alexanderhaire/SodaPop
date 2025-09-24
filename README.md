# Grey MarketPlace

**Grey MarketPlace** is a decentralized marketplace for creating, buying, and selling both **variable** and **fixed** assets — combining Web3-powered investment infrastructure with on-chain commerce fulfillment.

## Table of Contents

1. [What is Grey MarketPlace?](#-what-is-grey-marketplace)
2. [Key Features](#key-features)
3. [How It Works](#how-it-works)
4. [Folder Structure](#folder-structure)
5. [Getting Started](#getting-started)
6. [Tech Stack](#tech-stack)
7. [Environment Variables](#environment-variables)
8. [Deployment](#deployment)
9. [Auto Improvement](#auto-improvement)
10. [Contributing](#contributing)
11. [License](#license)

## 🧠 What is Grey MarketPlace?

Grey MarketPlace manages two distinct asset classes:

### ✅ Variable Assets (Fractional Ownership / Tradable)
These assets allow for ongoing ownership via shares that can be resold or transferred.

**Examples**:
- Racehorses
- Real estate
- Stocks
- Art & collectibles
- Music royalties

**Smart Contract Logic**:
- Tokenized fractional ownership (e.g., ERC-1155 or ERC-20)
- Shares persist post-sale and can be traded in secondary markets
- Metadata remains tied to ownership

### ✅ Fixed Assets (Consumables / Non-Resalable)
These assets are consumed, delivered, or redeemed upon purchase and cannot be resold.

**Examples**:
- Apples, coffee, food products
- Merchandise
- One-time services or tickets
- Limited-use licenses

**Smart Contract Logic**:
- Claimable/burnable assets (e.g., ERC-721 or ephemeral contract)
- Once used, the token is burned or deactivated
- Prevents secondary resale to maintain finality

## Key Features
- 🌐 Web3-native smart contract creation
- 🧩 Toggle between Fixed and Variable asset types
- 📸 Upload images and metadata (stored on IPFS/Pinata)
- 💸 Set share price and total supply
- 🧾 Mint NFTs or tokens based on asset logic
- 📊 Upcoming Analytics dashboard

## How It Works
1. **Create an Asset Listing**  
   Choose whether the item is fixed or variable. Upload an image, set the price, and input the total shares (if variable).
2. **Smart Contract Deployment**  
   - Variable assets mint transferable shares.
   - Fixed assets mint burnable or non-transferable claims.
3. **Buyers Interact**  
   Buyers purchase shares or individual fixed units, depending on the listing.
4. **Optional Secondary Market (for Variable)**  
   Variable asset shares are tradeable on secondary marketplaces.

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
│       ├── pages/           ← Create, List, Detail, etc.
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
├── contracts/              ← Solidity contracts
├── migrations/             ← Truffle migration scripts
├── shared/                  ← Shared TypeScript types or utilities
│   └── types/
│       └── index.ts
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- **Node.js & npm** (v16+ recommended)
- **Git** (to clone and version-control the project)
- **MetaMask** (or another EIP-1193 wallet) installed in your browser
- (Optional) An RPC provider account (e.g. Infura, Alchemy) to connect to Ethereum or other EVM chains

### Clone & Install

1. Open a terminal and run:
   ```bash
   git clone https://github.com/your-username/GreyMarketPlace.git
   cd GreyMarketPlace
   ```
   Replace `your-username` with the GitHub account that hosts this repository.
2. Install dependencies for both apps:
   ```bash
   ./setup.sh
   ```
   This convenience script installs all Node dependencies in the `frontend`, `backend`, and `shared` workspaces.
3. Copy `.env.example` to `.env` and fill in your secrets.
4. Start the development servers:
   ```bash
   ./dev.sh
   ```
   - Frontend runs at **http://localhost:5173**
   - Backend listens on **http://localhost:4000**
   The script boots both services concurrently using `npm run dev` in each workspace.
5. Compile and deploy the smart contracts (example uses Goerli):
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network goerli
   ```
   Swap `goerli` for the EVM network you are targeting.

### Testing

- **Frontend**: `cd frontend && npm test`
- **Backend**: `cd backend && npm test`
- **Contracts**: `npx hardhat test`

Run these commands after installing dependencies to ensure your changes are stable before opening a pull request.

## Tech Stack
- **Frontend:** React, TypeScript, Chakra UI
- **Backend:** Node.js, TypeScript, Express, MongoDB
- **Smart Contracts:** Solidity, Hardhat, Ethers.js
- **Storage:** IPFS/Pinata for asset metadata and images
- **AI:** OpenAI GPT-4o vision is used to auto-generate titles and descriptions
  for uploaded images when these fields are left blank during item creation

## Environment Variables
Copy `.env.example` to `.env` and fill in:
- **PORT** — Backend port (default `4000`)
- **OPENAI_API_KEY** — OpenAI key for the chatbot and image captioning
- **ALCHEMY_API_URL** — RPC endpoint for contract calls
- **PRIVATE_KEY** or **DEPLOYER_PRIVATE_KEY** — Wallet used for contract writes
- **JWT_SECRET** — Secret used to sign JWTs
- **JWT_EXPIRES_IN** — Token lifetime (e.g. `1d`)
- **MONGO_URI** — MongoDB connection string
- **SMTP_HOST**, **SMTP_PORT**, **SMTP_USER**, **SMTP_PASS**, **ALERT_EMAIL** — Optional email alert configuration
- **VITE_BACKEND_URL** — Base URL of the deployed backend (omit for same-origin deployments)
- **VITE_SAMPLE_METADATA_URL** — Optional sample metadata used by the create flow
- **VITE_NFT_STORAGE_KEY** — API key for NFT.Storage V2 uploads
- **VITE_TOKEN_FACTORY_ADDRESS** — Address of the deployed token factory contract
  (set `VITE_HORSE_FACTORY_ADDRESS` instead if you still use the legacy name)

### Auto captions with OpenAI Vision
`POST /api/items/describe` accepts a base64 image and returns a generated title
and short description. The item creation form uses this endpoint when the user
leaves those fields blank.

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

3. **Contracts**
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network goerli
   ```
   - Change `goerli` to your desired network.

## Auto Improvement
This repository includes an experimental script that calls OpenAI to suggest refinements to any JavaScript or TypeScript file. Provide a file path and the script will overwrite it with the model's response.

```bash
npm run improve -- path/to/file.ts
```
Set `OPENAI_API_KEY` in your environment before running.

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

## License

This project is licensed under the Business Source License 1.1. See [LICENSE](LICENSE) for details.
