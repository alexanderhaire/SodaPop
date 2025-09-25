const API = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function recordToken(params: {
  network: string;
  owner?: string;
  mint: string;
  signature: string;
  metadata?: any;
}) {
  const r = await fetch(`${API}/tokens/record`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
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
