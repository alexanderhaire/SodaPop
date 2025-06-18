export function estimateTokens(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3); // rough approximation
}

export function stripSensitiveValues(text: string): string {
  if (!text) return "";
  return text
    .replace(/0x[a-fA-F0-9]{40}/g, "[redacted]")
    .replace(/\b[\w.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[redacted]");
}
