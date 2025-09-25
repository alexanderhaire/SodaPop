const API = import.meta.env.VITE_API_BASE_URL ?? "/api";

export interface RecordTokenPayload {
  mint: string;
  tx: string;
  name: string;
  symbol: string;
  creatorWallet: string;
  ata: string;
  amount?: string | number | bigint;
  decimals?: number;
  imageUrl?: string;
}

export async function recordToken(params: RecordTokenPayload) {
  const payload: Record<string, unknown> = {
    mint: params.mint,
    tx: params.tx,
    name: params.name,
    symbol: params.symbol,
    creatorWallet: params.creatorWallet,
    ata: params.ata,
  };

  if (params.imageUrl) {
    payload.imageUrl = params.imageUrl;
  }

  if (params.decimals !== undefined) {
    payload.decimals = params.decimals;
  }

  if (params.amount !== undefined) {
    payload.amount =
      typeof params.amount === "bigint"
        ? params.amount.toString(10)
        : typeof params.amount === "number"
          ? params.amount.toString(10)
          : params.amount;
  }

  const r = await fetch(`${API}/tokens/record`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  // don't blindly call res.json(); 405/500 often returns empty text/html
  const text = await r.text().catch(() => "");
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    /* ignore */
  }

  if (!r.ok || json?.ok === false) {
    const msg =
      json?.error || `${r.status} ${r.statusText}` || "Failed to record token launch";
    throw new Error(msg);
  }
  return json;
}
