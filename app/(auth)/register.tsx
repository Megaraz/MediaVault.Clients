import { ScrollView, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import UsersClient, { type UserCreateDto } from '../../clients/UsersClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, S } from '../../constants/theme';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.confirmEmail || !form.password || !form.confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (form.email !== form.confirmEmail) {
      setErrorMessage('Emails do not match');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await usersClient.register(form as UserCreateDto);
      router.replace('/(auth)' as any);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, placeholder: string, opts?: { secureTextEntry?: boolean; keyboardType?: 'email-address' }) => (
    <View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={S.inputPlaceholder}
        value={form[key]}
        onChangeText={(text) => setForm({ ...form, [key]: text })}
        editable={!isSubmitting}
        autoCapitalize="none"
        style={S.input}
        {...opts}
      />
    </View>
  );

  return (
    <SafeAreaView style={S.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        {/* Branding */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View style={{ backgroundColor: Colors.primaryDim, borderRadius: 20, padding: 14, marginBottom: 16 }}>
            <Text style={{ fontSize: 28, color: Colors.primary }}>✨</Text>
          </View>
          <Text style={S.title}>Create Account</Text>
          <Text style={S.subtitle}>Join MediaVault today</Text>
        </View>

        {/* Card */}
        <View style={[S.card, { padding: 24, gap: 12 }]}>
          {field('username', 'Username')}
          {field('email', 'Email', { keyboardType: 'email-address' })}
          {field('confirmEmail', 'Confirm Email', { keyboardType: 'email-address' })}
          {field('password', 'Password', { secureTextEntry: true })}
          {field('confirmPassword', 'Confirm Password', { secureTextEntry: true })}

          {errorMessage && (
            <View style={{ backgroundColor: Colors.errorDim, borderRadius: 8, padding: 12 }}>
              <Text style={{ color: Colors.error, fontSize: 13 }}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isSubmitting}
            style={[S.primaryBtn, { opacity: isSubmitting ? 0.6 : 1, marginTop: 4 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={S.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Already have an account?</Text>
            <Link href={'/(auth)' as any} asChild>
              <TouchableOpacity>
                <Text style={[S.linkText, { fontSize: 14 }]}>Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
