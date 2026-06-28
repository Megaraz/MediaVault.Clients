import { ScrollView, TextInput, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import UsersClient, { type UserCreateDto } from '../../clients/UsersClient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const [usersClient] = useState(() => new UsersClient());
  const [form, setForm] = useState({
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.confirmEmail || !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (form.email !== form.confirmEmail) {
      Alert.alert('Error', 'Emails do not match');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await usersClient.register(form as UserCreateDto);
      Alert.alert('Success', 'Account created! Please log in.');
      router.replace('/(auth)' as any);
    } catch (error) {
      Alert.alert('Registration Failed', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
            Create Account
          </Text>
          <Text style={{ fontSize: 16, color: '#666' }}>Join MediaVault</Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextInput
            placeholder="Username"
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
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
            placeholder="Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
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
            placeholder="Confirm Email"
            value={form.confirmEmail}
            onChangeText={(text) => setForm({ ...form, confirmEmail: text })}
            keyboardType="email-address"
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
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
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

          <TextInput
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
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
            onPress={handleRegister}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 8,
              padding: 14,
              alignItems: 'center',
              marginTop: 8,
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Text style={{ color: '#666' }}>Already have an account?</Text>
            <Link href={'/(auth)' as any} asChild>
              <TouchableOpacity>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
