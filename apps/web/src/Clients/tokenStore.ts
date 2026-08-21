const TOKEN_KEY = "media_vault_auth_token";

// Remove tokens persisted by releases before the session-scoped storage policy.
localStorage.removeItem(TOKEN_KEY);

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
