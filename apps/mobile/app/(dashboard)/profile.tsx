import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '../../shared/UserContext';
import { Colors, S } from '../../constants/theme';

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

  const initial = (currentUser?.username?.[0] ?? '?').toUpperCase();

  return (
    <SafeAreaView style={S.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar + Name */}
        <View style={styles.heroSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.username}>{currentUser?.username}</Text>
          <Text style={styles.role}>Pro Curator</Text>
        </View>

        {/* Info Card */}
        <View style={[S.card, styles.infoCard]}>
          <InfoRow label="Username" value={currentUser?.username ?? '—'} />
          <View style={S.separator} />
          <InfoRow label="Email" value={currentUser?.email ?? '—'} />
          <View style={S.separator} />
          <InfoRow
            label="Member Since"
            value={currentUser?.createdAtUtc ? new Date(currentUser.createdAtUtc).toLocaleDateString() : '—'}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLogout} style={S.dangerBtn}>
            <Text style={S.dangerBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryDim,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  infoCard: {
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    padding: 20,
    marginTop: 8,
  },
});
