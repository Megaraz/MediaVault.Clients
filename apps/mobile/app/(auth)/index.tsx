import { ScrollView, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useUser } from '../../shared/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, S } from '../../constants/theme';
import { OperationType } from 'result-pattern-typescript/legacy';
import { UserDtoValidator } from '../../validators/User/UserDtoValidator';

const userValidator = new UserDtoValidator();

export default function LoginScreen() {
  const { login, isLoading } = useUser();
  const [userNameOrEmail, setUserNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const validation = userValidator.validateLoginDto(
      { usernameOrEmail: userNameOrEmail, password },
      {
        layer: 'Presentation',
        serviceName: 'LoginScreen',
        methodName: 'handleLogin',
        operation: OperationType.Login,
        entityName: 'User',
      },
    );
    if (!validation.isValid) {
      setErrorMessage(validation.validationErrors[0]?.userMessage ?? 'Invalid login details.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login({ usernameOrEmail: userNameOrEmail, password });
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[S.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} accessibilityLabel="Restoring your session" />
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
              accessibilityLabel="Email or username"
              accessibilityState={{ disabled: isSubmitting }}
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
              accessibilityLabel="Password"
              accessibilityState={{ disabled: isSubmitting }}
            />
          </View>

          {errorMessage && (
            <View style={{ backgroundColor: Colors.errorDim, borderRadius: 8, padding: 12 }} accessibilityRole="alert">
              <Text style={{ color: Colors.error, fontSize: 13 }}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            style={[S.primaryBtn, { opacity: isSubmitting ? 0.6 : 1, marginTop: 4 }]}
            accessibilityRole="button"
            accessibilityLabel="Log in"
            accessibilityHint="Logs in to your MediaVault account"
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" accessibilityLabel="Logging in" />
            ) : (
              <Text style={S.primaryBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Don&apos;t have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity accessibilityRole="link" accessibilityLabel="Sign up">
                <Text style={[S.linkText, { fontSize: 14 }]}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
