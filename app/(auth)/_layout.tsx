import { Stack, Redirect } from 'expo-router';
import { useUser } from '../../shared/UserContext';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href={'/(dashboard)' as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
