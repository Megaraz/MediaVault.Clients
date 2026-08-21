export type AuthenticationRedirectState = {
  readonly openLogin: true;
  readonly returnTo: string;
};

export function createAuthenticationRedirectState(
  returnTo: string,
): AuthenticationRedirectState {
  return {
    openLogin: true,
    returnTo: isSafeInternalPath(returnTo) ? returnTo : "/dashboard",
  };
}

export function getAuthenticationReturnPath(state: unknown): string | null {
  if (typeof state !== "object" || state === null || !("returnTo" in state)) {
    return null;
  }

  const returnTo = (state as { returnTo?: unknown }).returnTo;
  return typeof returnTo === "string" && isSafeInternalPath(returnTo)
    ? returnTo
    : null;
}

export function shouldOpenLogin(state: unknown): boolean {
  return typeof state === "object"
    && state !== null
    && "openLogin" in state
    && (state as { openLogin?: unknown }).openLogin === true;
}

function isSafeInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}
