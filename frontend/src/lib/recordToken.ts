import { postJSON } from "./api";

type RecordTokenArgs = {
  network: string;
  owner?: string;
  mint: string;
  signature: string;
  metadata?: any;
};

export type RecordTokenPayload = RecordTokenArgs;

export function recordToken(args: RecordTokenArgs) {
  return postJSON<{ ok: true; mint: string; signature: string }>(
    "/tokens/record",
    args
  );
}
