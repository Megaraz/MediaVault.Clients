import { Tabs, Redirect } from 'expo-router';
import { useUser } from '../../shared/UserContext';

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href={'/(auth)' as any} />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
