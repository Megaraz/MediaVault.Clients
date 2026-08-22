import { SessionTransitionCoordinator } from "@mediavault/client-core";
import { clearToken, getToken } from "../Clients/tokenStore";

type SessionInvalidatedListener = () => void;

const coordinator = new SessionTransitionCoordinator();

export function beginSessionTransition(): number {
  return coordinator.beginTransition();
}

export function isCurrentSessionTransition(epoch: number): boolean {
  return coordinator.isCurrent(epoch);
}

export function subscribeToSessionInvalidation(
  listener: SessionInvalidatedListener,
): () => void {
  return coordinator.subscribe(listener);
}

export async function clearSession(): Promise<void> {
  coordinator.invalidate();
  clearToken();
}

export async function clearSessionForRequest(
  authorizationHeader: string | undefined,
): Promise<void> {
  const requestToken = bearerToken(authorizationHeader);
  if (requestToken !== getToken()) {
    return;
  }

  await clearSession();
}

function bearerToken(authorizationHeader: string | undefined): string | null {
  const prefix = "Bearer ";
  return authorizationHeader?.startsWith(prefix)
    ? authorizationHeader.slice(prefix.length)
    : null;
}
