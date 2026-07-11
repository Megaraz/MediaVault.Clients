import { useEffect, useState } from 'react';
import type React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Colors } from '../constants/theme';
import { initializeOfflineDatabase } from '../database/SQLite';
import { featureFlags } from './featureFlags';

type ClientDatabaseProviderProps = {
  children: React.ReactNode;
};

export function ClientDatabaseProvider({ children }: ClientDatabaseProviderProps) {
  const [isReady, setIsReady] = useState(!featureFlags.useClientDatabase);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!featureFlags.useClientDatabase) {
      return;
    }

    let isMounted = true;

    void initializeOfflineDatabase()
      .then(() => {
        if (isMounted) {
          setIsReady(true);
        }
      })
      .catch((initializationError: unknown) => {
        if (isMounted) {
          setError(
            initializationError instanceof Error
              ? initializationError
              : new Error('Failed to initialize the client database.'),
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.background }}>
        <Text style={{ color: Colors.error, textAlign: 'center' }}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}
