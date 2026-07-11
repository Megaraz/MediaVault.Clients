function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.trim().toLowerCase() === 'true';
}

export const featureFlags = {
  useClientDatabase: parseBoolean(process.env.EXPO_PUBLIC_USE_CLIENT_DATABASE, false),
} as const;
