/**
 * MediaEntrySheet — full-screen bottom sheet modal for creating/editing a media entry.
 * - Slide-up animation from bottom
 * - Header with image backdrop, title, close button
 * - Scrollable form with all fields
 * - Save/delete actions in sticky footer
 * - Success state with auto-close
 */
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, SV, ST } from '../../constants/theme';
import { MediaType } from '../../clients/MediaEntriesClient';
import type { MediaEntryDetailedDto } from '../../types/dtos/MediaEntryBase';
import type { GameEntryDetailedDto } from '../../types/dtos/GameEntry';
import type { MovieEntryDetailedDto } from '../../types/dtos/MovieEntry';
import type { TvSeriesEntryDetailedDto } from '../../types/dtos/TvSeriesEntry';
import type { BookEntryDetailedDto } from '../../types/dtos/BookEntry';
import type { MangaEntryDetailedDto } from '../../types/dtos/MangaEntry';
import MediaEntryForm, { type MediaEntryFormData, type SeasonFormData } from './MediaEntryForm';
import TmdbApiClient from '../../clients/TmdbApiClient';
import RawgApiClient from '../../clients/RawgApiClient';
import GoogleBooksApiClient from '../../clients/GoogleBooksApiClient';
import type { SearchResult } from './TitleSearchInput';
import type { GoogleBooksDetailedDto } from '../../clients/GoogleBooksApiClient';
import { OperationType } from 'result-pattern-typescript';
import { MediaEntryDtoValidator } from '../../validators/MediaEntry/MediaEntryDtoValidator';

const SUCCESS_DELAY_MS = 1200;
const mediaEntryValidator = new MediaEntryDtoValidator();

type Props = {
  visible: boolean;
  detailedEntry?: MediaEntryDetailedDto;
  onSubmit: (formData: MediaEntryFormData, entryId?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
};

function formatDateForInput(value?: string | null): string {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
}

function buildInitialFormData(entry?: MediaEntryDetailedDto): MediaEntryFormData {
  const movie = entry as MovieEntryDetailedDto | undefined;
  const series = entry as TvSeriesEntryDetailedDto | undefined;
  const game = entry as GameEntryDetailedDto | undefined;
  const book = entry as BookEntryDetailedDto | undefined;
  const manga = entry as MangaEntryDetailedDto | undefined;

  return {
    idExternal: entry?.idExternal ?? null,
    title: entry?.title ?? '',
    imageUrl: entry?.imageUrl ?? '',
    backdropUrl: '',
    mediaType: entry?.mediaType ?? -1,
    status: entry?.status ?? 0,
    rating: entry?.rating ?? 0,
    review: entry?.review ?? '',
    releaseDate: formatDateForInput(entry?.releaseDate),
    genres: entry?.genres ?? [],
    overview: entry?.overview ?? '',
    runtimeMinutes: movie?.runtimeMinutes?.toString() ?? '',
    numberOfEpisodes: series?.numberOfEpisodes?.toString() ?? '',
    totalWatchedEpisodes: series?.totalWatchedEpisodes?.toString() ?? '',
    numberOfSeasons: series?.numberOfSeasons?.toString() ?? '',
    backdropImageUrl: series?.backdropImageUrl ?? null,
    firstAirDate: series?.firstAirDate ?? null,
    lastAirDate: series?.lastAirDate ?? null,
    airingStatus: series?.airingStatus ?? null,
    seasons: series?.seasons?.map((s) => ({
      seasonNumber: s.seasonNumber.toString(),
      name: s.name ?? '',
      overview: s.overview ?? '',
      imageUrl: s.imageUrl ?? '',
      airDate: s.airDate ? s.airDate.split('T')[0] : '',
      episodes: s.episodes.toString(),
      watchedEpisodes: s.watchedEpisodes.toString(),
      status: s.status,
      rating: s.rating,
    })) ?? [],
    metacriticRating: game?.metacriticRating ?? 0,
    hoursPlayed: game?.hoursPlayed?.toString() ?? '',
    platforms: game?.platforms?.join(', ') ?? '',
    website: game?.website ?? '',
    author: book?.author ?? manga?.author ?? '',
  };
}

function normalizeGenres(value: string | string[] | null): string[] {
  if (Array.isArray(value)) return value.map(s => s.trim()).filter(Boolean);
  if (!value) return [];
  return String(value).split(',').map(s => s.trim()).filter(Boolean);
}

export default function MediaEntrySheet({ visible, detailedEntry, onSubmit, onDelete, onClose }: Props) {
  const [formData, setFormData] = useState<MediaEntryFormData>(() => buildInitialFormData(detailedEntry));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successState, setSuccessState] = useState<'none' | 'saved' | 'deleted'>('none');
  const [error, setError] = useState<string | null>(null);

  const [tmdbClient] = useState(() => new TmdbApiClient());
  const [rawgClient] = useState(() => new RawgApiClient());

  const isEditMode = !!(detailedEntry?.id);
  const isBusy = isSubmitting || successState !== 'none';

  useEffect(() => {
    if (visible) {
      setFormData(buildInitialFormData(detailedEntry));
      setSuccessState('none');
      setError(null);
    }
  }, [visible, detailedEntry]);

  const handleChange = (field: keyof MediaEntryFormData, value: string | number | string[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'genres' ? normalizeGenres(value as string | string[] | null) : value,
    }));
  };

  const handleSeasonsChange = (seasons: SeasonFormData[]) => {
    setFormData(prev => ({ ...prev, seasons }));
  };

  const handleExternalResult = (result: SearchResult) => {
    if (formData.mediaType === MediaType.Game) {
      rawgClient.getGameById(Number(result.idExternal)).then((game) => {
        if (game.rawgDescription) handleChange('overview', game.rawgDescription);
        if (game.rawgReleased) handleChange('releaseDate', formatDateForInput(game.rawgReleased));
        if (game.rawgMetacritic != null) handleChange('metacriticRating', game.rawgMetacritic);
        if (game.rawgPlatforms) handleChange('platforms', game.rawgPlatforms.join(', '));
        handleChange('website', game.rawgWebsite ?? '');
      }).catch(() => {});
    }

    if (formData.mediaType === MediaType.Movie) {
      tmdbClient.getMovieById(Number(result.idExternal)).then((movie) => {
        if (movie.tmdbRunTimeMinutes) handleChange('runtimeMinutes', movie.tmdbRunTimeMinutes.toString());
        if (movie.tmdbReleaseDate) handleChange('releaseDate', formatDateForInput(movie.tmdbReleaseDate));
        if (movie.tmdbGenres) handleChange('genres', movie.tmdbGenres.map(g => g.tmdbGenreName ?? ''));
        if (movie.tmdbOverview) handleChange('overview', movie.tmdbOverview);
      }).catch(() => {});
    }

    if (formData.mediaType === MediaType.Series) {
      tmdbClient.getTvSeriesById(Number(result.idExternal)).then((series) => {
        setFormData(prev => ({
          ...prev,
          overview: series.tmdbOverview ?? prev.overview,
          releaseDate: series.tmdbFirstAirDate ? formatDateForInput(series.tmdbFirstAirDate) : prev.releaseDate,
          firstAirDate: series.tmdbFirstAirDate ?? prev.firstAirDate,
          lastAirDate: series.tmdbLastAirDate ?? prev.lastAirDate,
          backdropImageUrl: series.tmdbBackdropPath ?? prev.backdropImageUrl,
          genres: series.tmdbGenres ? series.tmdbGenres.map(g => g.tmdbGenreName ?? '') : prev.genres,
          numberOfEpisodes: series.tmdbNumberOfEpisodes.toString(),
          numberOfSeasons: series.tmdbNumberOfSeasons.toString(),
          airingStatus: series.tmdbStatus ?? prev.airingStatus,
          seasons: series.tmdbSeasons?.map(s => ({
            seasonNumber: s.tmdbSeasonNumber.toString(),
            name: s.tmdbName ?? '',
            overview: s.tmdbOverview ?? '',
            imageUrl: s.tmdbPosterPath ?? '',
            airDate: s.tmdbAirDate ? formatDateForInput(s.tmdbAirDate) : '',
            episodes: s.tmdbEpisodeCount.toString(),
            watchedEpisodes: '0',
            status: 0,
            rating: 0,
          })) ?? prev.seasons,
        }));
      }).catch(() => {});
    }

    // Books: author is already in the SearchResult via GoogleBooksDetailedDto
    const books = result as GoogleBooksDetailedDto;
    if ((formData.mediaType === MediaType.Book || formData.mediaType === MediaType.Manga) && books.author) {
      handleChange('author', books.author);
    }
  };

  const handleSave = async () => {
    if (formData.mediaType < 0) { setError('Please select a media type'); return; }

    const validation = isEditMode
      ? mediaEntryValidator.validateUpdateDto(
        {
          title: formData.title ?? '',
          status: formData.status,
          rating: formData.rating,
        },
        {
          layer: 'Presentation',
          serviceName: 'MediaEntrySheet',
          methodName: 'handleSave',
          operation: OperationType.Update,
          entityName: 'MediaEntry',
        },
      )
      : mediaEntryValidator.validateCreateDto(
        {
          title: formData.title ?? '',
          status: formData.status,
          rating: formData.rating,
        },
        {
          layer: 'Presentation',
          serviceName: 'MediaEntrySheet',
          methodName: 'handleSave',
          operation: OperationType.Create,
          entityName: 'MediaEntry',
        },
      );
    if (!validation.isValid) {
      setError(validation.validationErrors[0]?.userMessage ?? 'Invalid media entry details.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData, detailedEntry?.id);
      setIsSubmitting(false);
      setSuccessState('saved');
      setTimeout(() => {
        setSuccessState('none');
        onClose();
      }, SUCCESS_DELAY_MS);
    } catch (err) {
      setIsSubmitting(false);
      setError((err as Error).message);
    }
  };

  const handleDelete = () => {
    if (!detailedEntry?.id) return;
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${detailedEntry.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            setError(null);
            try {
              await onDelete(detailedEntry.id);
              setIsSubmitting(false);
              setSuccessState('deleted');
              setTimeout(() => {
                setSuccessState('none');
                onClose();
              }, SUCCESS_DELAY_MS);
            } catch (err) {
              setIsSubmitting(false);
              setError((err as Error).message);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={isBusy ? undefined : onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          {successState !== 'none' ? (
            // ── Success state ────────────────────────────
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={{ fontSize: 48 }}>{successState === 'deleted' ? '🗑️' : '✅'}</Text>
              </View>
              <Text style={styles.successTitle}>
                {successState === 'deleted' ? 'Entry Deleted' : isEditMode ? 'Entry Updated' : 'Entry Created'}
              </Text>
              <Text style={styles.successSub}>
                {successState === 'deleted'
                  ? 'The entry was deleted successfully.'
                  : isEditMode
                  ? 'Your changes have been saved.'
                  : 'Your new entry has been added!'}
              </Text>
              <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
            </View>
          ) : (
            <>
              {/* ── Sheet header ────────────────────────── */}
              <View style={styles.header}>
                {/* Drag indicator */}
                <View style={styles.dragIndicator} />
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={onClose} disabled={isBusy} style={styles.headerBtn}>
                    <Text style={styles.headerBtnText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{isEditMode ? 'Edit Entry' : 'New Entry'}</Text>
                  <View style={{ width: 36 }} />
                </View>
                {/* Cover art preview strip */}
                {formData.imageUrl ? (
                  <Image source={{ uri: formData.imageUrl }} style={styles.headerImage} resizeMode="cover" />
                ) : null}
              </View>

              {/* ── Scrollable form ─────────────────────── */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
              >
                {error && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
                <MediaEntryForm
                  formData={formData}
                  onChange={handleChange}
                  onSeasonsChange={handleSeasonsChange}
                  onSelectResult={handleExternalResult}
                  isEditMode={isEditMode}
                />
              </ScrollView>

              {/* ── Footer ──────────────────────────────── */}
              <View style={styles.footer}>
                {isEditMode && (
                  <TouchableOpacity
                    onPress={handleDelete}
                    disabled={isBusy}
                    style={[styles.deleteBtn, isBusy && { opacity: 0.5 }]}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isBusy}
                  style={[styles.saveBtn, isBusy && { opacity: 0.5 }, !isEditMode && { flex: 1 }]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>{isEditMode ? 'Save Changes' : 'Add Entry'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 0,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  headerImage: {
    width: '100%',
    height: 160,
  },
  formContent: {
    padding: 20,
    paddingBottom: 8,
  },
  errorBanner: {
    backgroundColor: Colors.errorDim,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: Colors.errorDim,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteBtnText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
});
