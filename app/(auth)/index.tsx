import { ScrollView, TextInput, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useUser } from '../../shared/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, isLoading } = useUser();
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!userNameOrEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ userNameOrEmail, password });
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
            MediaVault
          </Text>
          <Text style={{ fontSize: 16, color: '#666' }}>Track Every Story</Text>
        </View>

        <View style={{ gap: 16 }}>
          <TextInput
            placeholder="Username or Email"
            value={userNameOrEmail}
            onChangeText={setUserNameOrEmail}
            editable={!isSubmitting}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              fontSize: 16,
            }}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isSubmitting}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              fontSize: 16,
            }}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 8,
              padding: 14,
              alignItems: 'center',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Text style={{ color: '#666' }}>Don&apos;t have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
