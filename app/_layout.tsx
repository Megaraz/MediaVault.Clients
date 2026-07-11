import { Stack } from 'expo-router';
import { UserProvider } from '../shared/UserContext';
import { ClientDatabaseProvider } from '../shared/ClientDatabaseProvider';

export default function RootLayout() {
  return (
    <ClientDatabaseProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
        </Stack>
      </UserProvider>
    </ClientDatabaseProvider>
  );
}
