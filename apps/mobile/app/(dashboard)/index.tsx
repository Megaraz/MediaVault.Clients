import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  type MediaEntryMinimalDto,
  MediaType,
  MediaTypeLabels,
} from '../../clients/MediaEntriesClient';
import { MediaEntryService } from '../../services/mediaEntryService';
import { useUser } from '../../shared/UserContext';
import { statusSections } from '../../shared/mediaConstants';
import { Colors, S } from '../../constants/theme';
import MediaEntrySheet from '../../components/media-entry/MediaEntrySheet';
import type { MediaEntryFormData } from '../../components/media-entry/MediaEntryForm';
import type { MediaEntryDetailedDto } from '../../types/dtos/MediaEntryBase';

export default function DashboardScreen() {
  const { currentUser } = useUser();
  const [entries, setEntries] = useState<MediaEntryMinimalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<number>(MediaType.All);

  const [mediaEntryService] = useState(() => new MediaEntryService());

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MediaEntryDetailedDto | undefined>();

  useEffect(() => { void fetchEntries(); }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) throw new Error('Not authenticated.');
      const data = await mediaEntryService.getMinimalCollectionByOwnerIdAsync(currentUser.id);
      setEntries(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch entries: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetailedEntry = async (entry: Pick<MediaEntryMinimalDto, 'id' | 'mediaType'>): Promise<MediaEntryDetailedDto> => {
    switch (entry.mediaType) {
      case MediaType.Movie: return mediaEntryService.getMovieByIdAsync(currentUser!.id, entry.id);
      case MediaType.Series: return mediaEntryService.getTvSeriesByIdAsync(currentUser!.id, entry.id);
      case MediaType.Game: return mediaEntryService.getGameByIdAsync(currentUser!.id, entry.id);
      case MediaType.Book: return mediaEntryService.getBookByIdAsync(currentUser!.id, entry.id);
      case MediaType.Manga: return mediaEntryService.getMangaByIdAsync(currentUser!.id, entry.id);
      default: return mediaEntryService.getDetailedByIdAsync(currentUser!.id, entry.id);
    }
  };

  const handleOpenEntry = async (entry: MediaEntryMinimalDto) => {
    try {
      const detailed = await loadDetailedEntry(entry);
      setSelectedEntry(detailed);
      setSheetVisible(true);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const handleOpenCreate = () => {
    setSelectedEntry(undefined);
    setSheetVisible(true);
  };

  const handleCloseSheet = () => {
    setSheetVisible(false);
    setSelectedEntry(undefined);
  };

  const handleSubmit = async (formData: MediaEntryFormData, entryId?: string) => {
    if (!currentUser) throw new Error('Not authenticated.');
    const baseFields = {
      idExternal: formData.idExternal ?? null,
      title: formData.title ?? '',
      status: formData.status,
      rating: formData.rating,
      imageUrl: formData.imageUrl?.trim() || null,
      review: formData.review || null,
      overview: formData.overview || null,
      genres: formData.genres,
      releaseDate: formData.releaseDate || null,
    };

    const gamePlatforms = formData.platforms
      ? formData.platforms.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const buildSeasons = () => formData.seasons?.map(s => ({
      seasonNumber: parseInt(s.seasonNumber) || 0,
      name: s.name || null,
      overview: s.overview || null,
      imageUrl: s.imageUrl || null,
      airDate: s.airDate || null,
      episodes: parseInt(s.episodes) || 0,
      watchedEpisodes: parseInt(s.watchedEpisodes) || 0,
      status: s.status,
      rating: s.rating,
    }));

    if (entryId) {
      // UPDATE
      switch (formData.mediaType) {
        case MediaType.Movie:
          await mediaEntryService.updateAsync(currentUser.id, entryId, MediaType.Movie, { ...baseFields, runtimeMinutes: Number(formData.runtimeMinutes) || 0 });
          break;
        case MediaType.Series:
          await mediaEntryService.updateAsync(currentUser.id, entryId, MediaType.Series, {
            ...baseFields,
            numberOfSeasons: Number(formData.numberOfSeasons) || 0,
            numberOfEpisodes: Number(formData.numberOfEpisodes) || 0,
            totalWatchedEpisodes: Number(formData.totalWatchedEpisodes) || 0,
            backdropImageUrl: formData.backdropImageUrl ?? null,
            firstAirDate: formData.firstAirDate ?? null,
            lastAirDate: formData.lastAirDate ?? null,
            airingStatus: formData.airingStatus ?? null,
            seasons: buildSeasons(),
          });
          break;
        case MediaType.Game:
          await mediaEntryService.updateAsync(currentUser.id, entryId, MediaType.Game, { ...baseFields, hoursPlayed: Number(formData.hoursPlayed) || 0, metacriticRating: formData.metacriticRating ?? 0, website: formData.website?.trim() || undefined, platforms: gamePlatforms });
          break;
        case MediaType.Book:
          await mediaEntryService.updateAsync(currentUser.id, entryId, MediaType.Book, { ...baseFields, author: formData.author || null });
          break;
        case MediaType.Manga:
          await mediaEntryService.updateAsync(currentUser.id, entryId, MediaType.Manga, { ...baseFields, author: formData.author || null });
          break;
        default:
          throw new Error('Unknown media type');
      }
      const updated = await mediaEntryService.getDetailedByIdAsync(currentUser.id, entryId);
      setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
    } else {
      // CREATE
      let created: MediaEntryDetailedDto;
      switch (formData.mediaType) {
        case MediaType.Movie:
          created = await mediaEntryService.createAsync(currentUser.id, MediaType.Movie, { ...baseFields, runtimeMinutes: Number(formData.runtimeMinutes) || 0 });
          break;
        case MediaType.Series:
          created = await mediaEntryService.createAsync(currentUser.id, MediaType.Series, {
            ...baseFields,
            numberOfSeasons: Number(formData.numberOfSeasons) || 0,
            numberOfEpisodes: Number(formData.numberOfEpisodes) || 0,
            totalWatchedEpisodes: Number(formData.totalWatchedEpisodes) || 0,
            backdropImageUrl: formData.backdropImageUrl ?? null,
            firstAirDate: formData.firstAirDate ?? null,
            lastAirDate: formData.lastAirDate ?? null,
            airingStatus: formData.airingStatus ?? null,
            seasons: buildSeasons(),
          });
          break;
        case MediaType.Game:
          created = await mediaEntryService.createAsync(currentUser.id, MediaType.Game, { ...baseFields, hoursPlayed: Number(formData.hoursPlayed) || 0, metacriticRating: formData.metacriticRating ?? 0, website: formData.website?.trim() || undefined, platforms: gamePlatforms });
          break;
        case MediaType.Book:
          created = await mediaEntryService.createAsync(currentUser.id, MediaType.Book, { ...baseFields, author: formData.author || null });
          break;
        case MediaType.Manga:
          created = await mediaEntryService.createAsync(currentUser.id, MediaType.Manga, { ...baseFields, author: formData.author || null });
          break;
        default:
          throw new Error('Unknown media type');
      }
      setEntries(prev => [...prev, created]);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!currentUser) throw new Error('Not authenticated.');
    await mediaEntryService.deleteAsync(currentUser.id, entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

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
            <TouchableOpacity key={entry.id} style={styles.card} onPress={() => handleOpenEntry(entry)} activeOpacity={0.75}>
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
        <Text style={styles.headerLogo}>MediaVault</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(currentUser?.username?.[0] ?? '?').toUpperCase()}</Text>
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
            <TouchableOpacity key={type.value} onPress={() => setMediaTypeFilter(type.value)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]} numberOfLines={1}>{type.label}</Text>
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateTitle}>No entries yet</Text>
              <Text style={styles.emptyStateSub}>Tap + to add your first entry</Text>
            </View>
          ) : (
            statusSections.map(section => renderStatusSection(section))
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity onPress={handleOpenCreate} style={styles.fab} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Entry Sheet */}
      <MediaEntrySheet
        visible={sheetVisible}
        detailedEntry={selectedEntry}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onClose={handleCloseSheet}
      />
    </SafeAreaView>
  );
}

const CARD_WIDTH = 164;
const CARD_IMAGE_HEIGHT = 238;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLogo: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  filterBar: {
    flexGrow: 0,
    flexShrink: 0,
    height: 58,
    backgroundColor: Colors.surface,
  },
  filterBarContent: {
    paddingHorizontal: 8,
    minHeight: 58,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    height: 42,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 'auto',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    paddingTop: 28,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  cardRow: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 18,
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
    padding: 14,
    gap: 5,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  cardMeta: {
    fontSize: 14,
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
    fontSize: 16,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyStateSub: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '300',
  },
});
