import { View, Text, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../shared/UserContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)' as any);
    } catch (error) {
      Alert.alert('Logout Error', (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>Profile</Text>
        </View>

        {/* User Info */}
        <View style={{ padding: 16, backgroundColor: '#fff', marginTop: 16, marginHorizontal: 16, borderRadius: 8 }}>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Username</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
            {currentUser?.username}
          </Text>

          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Email</Text>
          <Text style={{ fontSize: 16, color: '#333', marginBottom: 16 }}>
            {currentUser?.email}
          </Text>

          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Member Since</Text>
          <Text style={{ fontSize: 16, color: '#333' }}>
            {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>

        {/* Actions */}
        <View style={{ padding: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
