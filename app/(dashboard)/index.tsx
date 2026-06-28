import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MediaEntriesClient, {
  type MediaEntryMinimalDto,
  MediaType,
  StatusType,
  StatusLabels,
  MediaTypeLabels,
} from '../../clients/MediaEntriesClient';
import { useUser } from '../../shared/UserContext';
import { statusSections } from '../../shared/mediaConstants';
import { Colors, S } from '../../constants/theme';

export default function DashboardScreen() {
  const { currentUser } = useUser();
  const [entries, setEntries] = useState<MediaEntryMinimalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<number>(MediaType.All);
  const [client] = useState(() => new MediaEntriesClient());

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const data = await client.getMediaEntries();
        setEntries(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch entries: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchEntries();
  }, [client]);

  const filteredEntries = mediaTypeFilter === MediaType.All
    ? entries
    : entries.filter(e => e.mediaType === mediaTypeFilter);

  const mediaTypeFilters = [
    { value: MediaType.All, label: 'All' },
    { value: MediaType.Movie, label: 'Movies' },
    { value: MediaType.Series, label: 'Series' },
    { value: MediaType.Book, label: 'Books' },
    { value: MediaType.Manga, label: 'Manga' },
    { value: MediaType.Game, label: 'Games' },
  ];

  const renderStatusSection = ({ type, title }: { type: number; title: string }) => {
    const sectionEntries = filteredEntries.filter(e => e.status === type);
    if (sectionEntries.length === 0) return null;

    return (
      <View key={type} style={styles.section}>
        <Text style={[S.sectionTitle, styles.sectionTitle]}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {sectionEntries.map(entry => (
            <TouchableOpacity key={entry.id} style={styles.card} activeOpacity={0.75}>
              {entry.imageUrl ? (
                <Image source={{ uri: entry.imageUrl }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                  <Text style={{ fontSize: 28 }}>🎬</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{entry.title}</Text>
                <Text style={styles.cardMeta}>{MediaTypeLabels[entry.mediaType] ?? 'Unknown'}</Text>
                {entry.rating > 0 && (
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingText}>{entry.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={S.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Text style={styles.headerLogo}>MediaVault</Text>
        </View>
        <View style={styles.headerUser}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(currentUser?.username?.[0] ?? '?').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Media Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {mediaTypeFilters.map((type) => {
          const isActive = mediaTypeFilter === type.value;
          return (
            <TouchableOpacity
              key={type.value}
              onPress={() => setMediaTypeFilter(type.value)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.divider} />

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateTitle}>No entries yet</Text>
              <Text style={styles.emptyStateSubtitle}>Start tracking your media!</Text>
            </View>
          ) : (
            statusSections.map(section => renderStatusSection(section))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = 130;
const CARD_IMAGE_HEIGHT = 190;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  filterBar: {
    flexGrow: 0,
    backgroundColor: Colors.surface,
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  section: {
    paddingTop: 20,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_IMAGE_HEIGHT,
  },
  cardImagePlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 10,
    gap: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 17,
  },
  cardMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingStar: {
    color: '#f59e0b',
    fontSize: 11,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    gap: 8,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

