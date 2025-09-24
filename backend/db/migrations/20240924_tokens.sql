CREATE TABLE IF NOT EXISTS tokens (
  mint TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  imageUrl TEXT,
  creatorWallet TEXT NOT NULL,
  tx TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS holdings (
  wallet TEXT NOT NULL,
  mint TEXT NOT NULL REFERENCES tokens(mint) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount>=0),
  PRIMARY KEY (wallet, mint)
);
