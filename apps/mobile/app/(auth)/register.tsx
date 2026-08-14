import { ScrollView, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import type { UserRegisterDto } from '@mediavault/contracts';
import { AuthService } from '../../services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, S } from '../../constants/theme';
import { OperationType } from 'result-pattern-typescript/legacy';
import { UserDtoValidator } from '../../validators/User/UserDtoValidator';

const userValidator = new UserDtoValidator();

export default function RegisterScreen() {
  const router = useRouter();
  const [authService] = useState(() => new AuthService());
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
    const validation = userValidator.validateCreateDto(form, {
      layer: 'Presentation',
      serviceName: 'RegisterScreen',
      methodName: 'handleRegister',
      operation: OperationType.Create,
      entityName: 'User',
    });
    if (!validation.isValid) {
      setErrorMessage(validation.validationErrors[0]?.userMessage ?? 'Invalid registration details.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await authService.registerUserAsync(form as UserRegisterDto);
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
