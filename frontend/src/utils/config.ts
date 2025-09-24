export const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_BACKEND_URL?.trim();
  if (!raw) {
    return "/api/";
  }

  const normalized = raw.replace(/\/+$/, "");
  const base = normalized.toLowerCase().endsWith("/api")
    ? normalized
    : `${normalized}/api`;

  return base.endsWith("/") ? base : `${base}/`;
})();

export const SAMPLE_METADATA_URL =
  import.meta.env.VITE_SAMPLE_METADATA_URL?.trim() || "";
