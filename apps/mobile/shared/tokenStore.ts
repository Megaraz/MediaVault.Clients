import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'media_vault_auth_token';
const OFFLINE_TOKEN_PREFIX = 'offline:';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getOfflineUserId(): Promise<string | null> {
  const token = await getToken();
  return token?.startsWith(OFFLINE_TOKEN_PREFIX)
    ? token.slice(OFFLINE_TOKEN_PREFIX.length)
    : null;
}

export function createOfflineToken(userId: string): string {
  return `${OFFLINE_TOKEN_PREFIX}${userId}`;
}
