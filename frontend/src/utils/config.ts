export const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_BACKEND_URL?.trim();
  if (!raw) {
    return "/api";
  }

  const normalized = raw.replace(/\/+$/, "");
  if (normalized.toLowerCase().endsWith("/api")) {
    return normalized;
  }

  return `${normalized}/api`;
})();

export const SAMPLE_METADATA_URL =
  import.meta.env.VITE_SAMPLE_METADATA_URL?.trim() || "";
