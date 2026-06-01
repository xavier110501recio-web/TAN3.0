import type { Mission } from "../types";

export type ToastIntent = "share-win";

export interface ShareToastPayload {
  intent: ToastIntent;
  mission: Mission;
  defaultText?: string;
}

type Listener = (payload: ShareToastPayload) => void;
const listeners: Set<Listener> = new Set();

export function emitShareToast(payload: ShareToastPayload): void {
  listeners.forEach((l) => l(payload));
}

export function onShareToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
