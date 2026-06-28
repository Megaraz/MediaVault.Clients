import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MediaEntriesClient, {
  type MediaEntryMinimalDto,
  MediaType,
  MediaTypeLabels,
} from '../../clients/MediaEntriesClient';
import MovieEntriesClient from '../../clients/MovieEntriesClient';
import TvSeriesEntriesClient from '../../clients/TvSeriesEntriesClient';
import GameEntriesClient from '../../clients/GameEntriesClient';
import BookEntriesClient from '../../clients/BookEntriesClient';
import MangaEntriesClient from '../../clients/MangaEntriesClient';
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

  const [client] = useState(() => new MediaEntriesClient());
  const [movieClient] = useState(() => new MovieEntriesClient());
  const [tvClient] = useState(() => new TvSeriesEntriesClient());
  const [gameClient] = useState(() => new GameEntriesClient());
  const [bookClient] = useState(() => new BookEntriesClient());
  const [mangaClient] = useState(() => new MangaEntriesClient());

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MediaEntryDetailedDto | undefined>();

  useEffect(() => { void fetchEntries(); }, []);

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

  const loadDetailedEntry = async (entry: Pick<MediaEntryMinimalDto, 'id' | 'mediaType'>): Promise<MediaEntryDetailedDto> => {
    switch (entry.mediaType) {
      case MediaType.Movie: return client.getMovieById(entry.id);
      case MediaType.Series: return client.getTvSeriesById(entry.id);
      case MediaType.Game: return client.getGameById(entry.id);
      case MediaType.Book: return client.getBookById(entry.id);
      case MediaType.Manga: return client.getMangaById(entry.id);
      default: return client.getMediaEntryById(entry.id);
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
          await movieClient.updateMovie(entryId, { ...baseFields, runtimeMinutes: Number(formData.runtimeMinutes) || 0 });
          break;
        case MediaType.Series:
          await tvClient.updateTvSeries(entryId, {
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
          await gameClient.updateGame(entryId, { ...baseFields, hoursPlayed: Number(formData.hoursPlayed) || 0, metacriticRating: formData.metacriticRating ?? 0, website: formData.website?.trim() || undefined, platforms: gamePlatforms });
          break;
        case MediaType.Book:
          await bookClient.updateBook(entryId, { ...baseFields, author: formData.author || null });
          break;
        case MediaType.Manga:
          await mangaClient.updateManga(entryId, { ...baseFields, author: formData.author || null });
          break;
        default:
          throw new Error('Unknown media type');
      }
      const updated = await client.getMediaEntryById(entryId);
      setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
    } else {
      // CREATE
      let created: MediaEntryDetailedDto;
      switch (formData.mediaType) {
        case MediaType.Movie:
          created = await movieClient.createMovie({ ...baseFields, runtimeMinutes: Number(formData.runtimeMinutes) || 0 });
          break;
        case MediaType.Series:
          created = await tvClient.createTvSeries({
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
          created = await gameClient.createGame({ ...baseFields, hoursPlayed: Number(formData.hoursPlayed) || 0, metacriticRating: formData.metacriticRating ?? 0, website: formData.website?.trim() || undefined, platforms: gamePlatforms });
          break;
        case MediaType.Book:
          created = await bookClient.createBook({ ...baseFields, author: formData.author || null });
          break;
        case MediaType.Manga:
          created = await mangaClient.createManga({ ...baseFields, author: formData.author || null });
          break;
        default:
          throw new Error('Unknown media type');
      }
      setEntries(prev => [...prev, created]);
    }
  };

  const handleDelete = async (entryId: string) => {
    await client.deleteMediaEntry(entryId);
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
  headerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
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
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
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
    fontSize: 12,
    fontWeight: '500',
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
    paddingTop: 20,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardRow: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
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
  emptyStateSub: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
});
