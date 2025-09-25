import { postJSON } from "./api";

export function recordToken(args: {
  network: string;
  owner?: string;
  mint: string;
  signature: string;
  metadata?: any;
}) {
  return postJSON<{ ok: true; mint: string; signature: string }>(
    "/tokens/record",
    args
  );
}
