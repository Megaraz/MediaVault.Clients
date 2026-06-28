/**
 * MediaEntryForm — all fields for a media entry, adapted for mobile.
 * Controlled component: parent owns formData and calls onChange/onSeasonsChange.
 *
 * Step 1: if no media type selected (mediaType < 0), only show the type picker.
 * Step 2: full form with type-specific sections.
 */
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, ST } from '../../constants/theme';
import { MediaType, MediaTypeLabels, StatusLabels } from '../../clients/MediaEntriesClient';
import StarRating from './StarRating';
import TitleSearchInput, { type SearchResult } from './TitleSearchInput';

export type SeasonFormData = {
  seasonNumber: string;
  name: string;
  overview: string;
  imageUrl: string;
  airDate: string;
  episodes: string;
  watchedEpisodes: string;
  status: number;
  rating: number;
};

export type MediaEntryFormData = {
  idExternal?: string | null;
  title?: string;
  imageUrl?: string;
  backdropUrl?: string;
  mediaType: number;
  status: number;
  rating: number;
  review: string;
  releaseDate?: string;
  genres: string[];
  overview?: string;
  // Movie
  runtimeMinutes?: string;
  // TV Series
  numberOfEpisodes?: string;
  totalWatchedEpisodes?: string;
  backdropImageUrl?: string | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  numberOfSeasons?: string;
  airingStatus?: string | null;
  seasons?: SeasonFormData[];
  // Game
  metacriticRating?: number;
  hoursPlayed?: string;
  platforms?: string;
  website?: string;
  // Book / Manga
  author?: string;
};

type FormValue = string | number | string[] | null;

type Props = {
  formData: MediaEntryFormData;
  onChange: (field: keyof MediaEntryFormData, value: FormValue) => void;
  onSeasonsChange: (seasons: SeasonFormData[]) => void;
  onSelectResult: (result: SearchResult) => void;
  isEditMode: boolean;
};

const mediaTypeOptions = Object.entries(MediaTypeLabels).map(([v, label]) => ({ value: Number(v), label }));
const statusOptions = Object.entries(StatusLabels).map(([v, label]) => ({ value: Number(v), label }));

export default function MediaEntryForm({ formData, onChange, onSeasonsChange, onSelectResult, isEditMode }: Props) {
  const normalizeGenres = (val: FormValue): string[] => {
    if (Array.isArray(val)) return val.map(s => s.trim()).filter(Boolean);
    if (!val) return [];
    return String(val).split(',').map(s => s.trim()).filter(Boolean);
  };

  if (formData.mediaType < 0) {
    return (
      <View style={styles.typePickerContainer}>
        <Text style={styles.typePickerTitle}>What are you adding?</Text>
        <Text style={styles.typePickerSub}>Choose a media type to get started</Text>
        <View style={styles.typeGrid}>
          {mediaTypeOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.typeChip, formData.mediaType === opt.value && styles.typeChipActive]}
              onPress={() => onChange('mediaType', opt.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.typeChipIcon}>{typeIcon(opt.value)}</Text>
              <Text style={[styles.typeChipLabel, formData.mediaType === opt.value && styles.typeChipLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      {/* Title with external search */}
      <FormSection label="Title">
        <TitleSearchInput
          value={formData.title ?? ''}
          onChange={(val) => onChange('title', val)}
          onSelectResult={(result) => {
            onChange('idExternal', result.idExternal);
            onChange('title', result.title);
            if (result.coverImageUrl) onChange('imageUrl', result.coverImageUrl);
            onSelectResult(result);
          }}
          mediaType={formData.mediaType}
          isEditMode={isEditMode}
          placeholder="e.g. Elden Ring, The Great Gatsby"
        />
      </FormSection>

      {/* Media Type */}
      <FormSection label="Media Type">
        <SegmentRow
          options={mediaTypeOptions}
          value={formData.mediaType}
          onChange={(v) => onChange('mediaType', v)}
        />
      </FormSection>

      {/* Status */}
      <FormSection label="Status">
        <SegmentRow
          options={statusOptions}
          value={formData.status}
          onChange={(v) => onChange('status', v)}
        />
      </FormSection>

      {/* Rating */}
      <FormSection label="Rating">
        <StarRating rating={formData.rating} onChange={(v) => onChange('rating', v)} />
      </FormSection>

      {/* Review */}
      <FormSection label="Your Review">
        <TextInput
          multiline
          numberOfLines={5}
          value={formData.review}
          onChangeText={(v) => onChange('review', v)}
          placeholder="Write your thoughts here…"
          placeholderTextColor={Colors.textMuted}
          style={styles.textarea}
          textAlignVertical="top"
        />
      </FormSection>

      {/* Cover image URL */}
      <FormSection label="Cover Image URL">
        <FormInput
          value={formData.imageUrl ?? ''}
          onChangeText={(v) => onChange('imageUrl', v)}
          placeholder="https://example.com/cover.jpg"
          keyboardType="url"
        />
      </FormSection>

      {/* ── Movie-specific ─────────────────────── */}
      {formData.mediaType === MediaType.Movie && <>
        <View style={styles.row}>
          <View style={styles.rowHalf}>
            <FormSection label="Runtime (min)">
              <FormInput value={formData.runtimeMinutes ?? ''} onChangeText={v => onChange('runtimeMinutes', v)} placeholder="e.g. 148" keyboardType="numeric" />
            </FormSection>
          </View>
          <View style={styles.rowHalf}>
            <FormSection label="Release Date">
              <FormInput value={formData.releaseDate ?? ''} onChangeText={v => onChange('releaseDate', v)} placeholder="YYYY-MM-DD" />
            </FormSection>
          </View>
        </View>
        <FormSection label="Genres (comma separated)">
          <FormInput value={formData.genres.join(', ')} onChangeText={v => onChange('genres', normalizeGenres(v))} placeholder="e.g. Action, Drama" />
        </FormSection>
        <FormSection label="Overview">
          <TextInput multiline numberOfLines={4} value={formData.overview ?? ''} onChangeText={v => onChange('overview', v)} placeholder="Short description…" placeholderTextColor={Colors.textMuted} style={styles.textarea} textAlignVertical="top" />
        </FormSection>
      </>}

      {/* ── TV Series-specific ─────────────────── */}
      {formData.mediaType === MediaType.Series && <>
        <View style={styles.row}>
          <View style={styles.rowHalf}>
            <FormSection label="Seasons">
              <FormInput value={formData.numberOfSeasons ?? ''} onChangeText={v => onChange('numberOfSeasons', v)} placeholder="e.g. 3" keyboardType="numeric" />
            </FormSection>
          </View>
          <View style={styles.rowHalf}>
            <FormSection label="Total Episodes">
              <FormInput value={formData.numberOfEpisodes ?? ''} onChangeText={v => onChange('numberOfEpisodes', v)} placeholder="e.g. 24" keyboardType="numeric" />
            </FormSection>
          </View>
        </View>
        <FormSection label="Episodes Watched">
          <FormInput value={formData.totalWatchedEpisodes ?? ''} onChangeText={v => onChange('totalWatchedEpisodes', v)} placeholder="e.g. 12" keyboardType="numeric" />
        </FormSection>
        <FormSection label="Genres (comma separated)">
          <FormInput value={formData.genres.join(', ')} onChangeText={v => onChange('genres', normalizeGenres(v))} placeholder="e.g. Drama, Thriller" />
        </FormSection>
        <FormSection label="Overview">
          <TextInput multiline numberOfLines={4} value={formData.overview ?? ''} onChangeText={v => onChange('overview', v)} placeholder="Short description…" placeholderTextColor={Colors.textMuted} style={styles.textarea} textAlignVertical="top" />
        </FormSection>
      </>}

      {/* ── Game-specific ──────────────────────── */}
      {formData.mediaType === MediaType.Game && <>
        <View style={styles.row}>
          <View style={styles.rowHalf}>
            <FormSection label="Hours Played">
              <FormInput value={formData.hoursPlayed ?? ''} onChangeText={v => onChange('hoursPlayed', v)} placeholder="e.g. 80" keyboardType="numeric" />
            </FormSection>
          </View>
          <View style={styles.rowHalf}>
            <FormSection label="Metacritic">
              <FormInput value={formData.metacriticRating?.toString() ?? ''} onChangeText={v => onChange('metacriticRating', Number(v) || 0)} placeholder="e.g. 87" keyboardType="numeric" />
            </FormSection>
          </View>
        </View>
        <FormSection label="Release Date">
          <FormInput value={formData.releaseDate ?? ''} onChangeText={v => onChange('releaseDate', v)} placeholder="YYYY-MM-DD" />
        </FormSection>
        <FormSection label="Platforms (comma separated)">
          <FormInput value={formData.platforms ?? ''} onChangeText={v => onChange('platforms', v)} placeholder="e.g. PC, PlayStation 5" />
        </FormSection>
        <FormSection label="Overview">
          <TextInput multiline numberOfLines={4} value={formData.overview ?? ''} onChangeText={v => onChange('overview', v)} placeholder="Short description…" placeholderTextColor={Colors.textMuted} style={styles.textarea} textAlignVertical="top" />
        </FormSection>
        <FormSection label="Website">
          <FormInput value={formData.website ?? ''} onChangeText={v => onChange('website', v)} placeholder="https://example.com" keyboardType="url" />
        </FormSection>
      </>}

      {/* ── Book / Manga-specific ──────────────── */}
      {(formData.mediaType === MediaType.Book || formData.mediaType === MediaType.Manga) && (
        <FormSection label="Author">
          <FormInput value={formData.author ?? ''} onChangeText={v => onChange('author', v)} placeholder="e.g. Kentaro Miura" />
        </FormSection>
      )}
    </View>
  );
}

// ── Small helpers ────────────────────────────────────────────────

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function FormInput({ value, onChangeText, placeholder, keyboardType }: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'url' | 'email-address';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      keyboardType={keyboardType ?? 'default'}
      autoCapitalize="none"
      style={styles.input}
    />
  );
}

function SegmentRow({ options, value, onChange }: {
  options: { value: number; label: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentRow}>
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segmentChip, isActive && styles.segmentChipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentChipText, isActive && styles.segmentChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function typeIcon(type: number): string {
  switch (type) {
    case MediaType.Movie: return '🎬';
    case MediaType.Series: return '📺';
    case MediaType.Book: return '📚';
    case MediaType.Manga: return '📖';
    case MediaType.Game: return '🎮';
    default: return '❓';
  }
}

const styles = StyleSheet.create({
  typePickerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  typePickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  typePickerSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  typeChip: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 90,
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  typeChipIcon: {
    fontSize: 28,
  },
  typeChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeChipLabelActive: {
    color: Colors.primary,
  },
  form: {
    gap: 0,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
  },
  textarea: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    minHeight: 110,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowHalf: {
    flex: 1,
  },
  segmentRow: {
    gap: 8,
    paddingVertical: 2,
  },
  segmentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  segmentChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  segmentChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  segmentChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
