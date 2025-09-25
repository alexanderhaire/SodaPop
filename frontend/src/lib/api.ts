export const API_BASE =
  import.meta.env.VITE_API_BASE_URL
  || (typeof window !== "undefined" && window.location.hostname.includes("railway.app")
      ? "https://sodapop-production.up.railway.app/api"
      : "/api");

export async function postJSON<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch {}
  if (!res.ok || json?.ok === false) throw new Error(json?.error || `${res.status}`);
  return json as T;
}
