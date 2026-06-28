import { ScrollView, TextInput, TouchableOpacity, View, Text, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useUser } from '../../shared/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, S } from '../../constants/theme';

export default function LoginScreen() {
  const { login, isLoading } = useUser();
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!userNameOrEmail || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login({ userNameOrEmail, password });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[S.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        {/* Logo / Branding */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ backgroundColor: Colors.primaryDim, borderRadius: 20, padding: 14, marginBottom: 16 }}>
            <Text style={{ fontSize: 28, color: Colors.primary }}>🗄️</Text>
          </View>
          <Text style={S.title}>Welcome Back</Text>
          <Text style={S.subtitle}>Log in to your MediaVault account</Text>
        </View>

        {/* Card */}
        <View style={[S.card, { padding: 24, gap: 16 }]}>
          <View>
            <Text style={S.label}>Email or Username</Text>
            <TextInput
              placeholder="name@example.com"
              placeholderTextColor={S.inputPlaceholder}
              value={userNameOrEmail}
              onChangeText={setUserNameOrEmail}
              autoCapitalize="none"
              editable={!isSubmitting}
              style={S.input}
            />
          </View>

          <View>
            <Text style={S.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={S.inputPlaceholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isSubmitting}
              style={S.input}
            />
          </View>

          {errorMessage && (
            <View style={{ backgroundColor: Colors.errorDim, borderRadius: 8, padding: 12 }}>
              <Text style={{ color: Colors.error, fontSize: 13 }}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            style={[S.primaryBtn, { opacity: isSubmitting ? 0.6 : 1, marginTop: 4 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={S.primaryBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[S.linkText, { fontSize: 14 }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
