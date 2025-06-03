export function formatAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.substring(0, 6)}…${addr.substring(addr.length - 4)}`;
}
