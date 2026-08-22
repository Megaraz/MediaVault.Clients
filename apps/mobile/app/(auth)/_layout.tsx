import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '../../shared/UserContext';

export default function AuthLayout() {
  const { authenticationStatus } = useUser();

  if (authenticationStatus === 'restoring') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (authenticationStatus === 'authenticated') {
    return <Redirect href={'/(dashboard)' as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
