import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors, ST } from '../../constants/theme';
import { MediaType } from '../../clients/MediaEntriesClient';
import TmdbApiClient from '../../clients/TmdbApiClient';
import RawgApiClient from '../../clients/RawgApiClient';
import GoogleBooksApiClient, { type GoogleBooksDetailedDto } from '../../clients/GoogleBooksApiClient';
import type { MediaEntrySearchResultDto } from '../../types/dtos/MediaEntryBase';

export type SearchResult = MediaEntrySearchResultDto;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelectResult: (result: SearchResult) => void;
  mediaType: number;
  isEditMode: boolean;
  placeholder?: string;
};

const DEBOUNCE_MS = 400;
const MIN_LEN = 3;

const isSearchEnabled = (mediaType: number) =>
  [MediaType.Movie, MediaType.Series, MediaType.Book, MediaType.Game].includes(mediaType as any);

export default function TitleSearchInput({ value, onChange, onSelectResult, mediaType, isEditMode, placeholder }: Props) {
  const [tmdbClient] = useState(() => new TmdbApiClient());
  const [rawgClient] = useState(() => new RawgApiClient());
  const [booksClient] = useState(() => new GoogleBooksApiClient());

  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelected = useRef(false);
  const userHasTyped = useRef(!isEditMode);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!userHasTyped.current) return;
    if (justSelected.current) { justSelected.current = false; return; }
    if (!isSearchEnabled(mediaType) || value.length < MIN_LEN) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    timer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        let data: SearchResult[];
        if (mediaType === MediaType.Movie) {
          data = await tmdbClient.searchMovies(value);
        } else if (mediaType === MediaType.Series) {
          data = await tmdbClient.searchTvSeries(value);
        } else if (mediaType === MediaType.Book) {
          data = await booksClient.searchBooks(value);
        } else {
          data = await rawgClient.searchGames(value);
        }
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, mediaType]);

  const handleSelect = (result: SearchResult) => {
    justSelected.current = true;
    onChange(result.title);
    onSelectResult(result);
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={(text) => { userHasTyped.current = true; onChange(text); }}
          placeholder={placeholder ?? (isSearchEnabled(mediaType) ? 'Type to search…' : 'Enter title')}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
        />
        {isSearching && (
          <ActivityIndicator size="small" color={Colors.primary} style={styles.spinner} />
        )}
      </View>

      {isSearchEnabled(mediaType) && !isEditMode && value.length === 0 && (
        <Text style={styles.hint}>✨ Start typing to auto-fill cover art, genres and more</Text>
      )}

      {/* Results dropdown rendered as a modal overlay */}
      <Modal visible={showDropdown} transparent animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownHeader}>Search Results</Text>
            <FlatList
              data={results}
              keyExtractor={(item) => item.idExternal}
              keyboardShouldPersistTaps="always"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultRow} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                  {item.coverImageUrl ? (
                    <Image source={{ uri: item.coverImageUrl }} style={styles.resultImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.resultImg, styles.resultImgPlaceholder]}>
                      <Text style={{ fontSize: 16 }}>🎬</Text>
                    </View>
                  )}
                  <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 17,
    paddingVertical: 16,
    fontSize: 17,
    color: Colors.text,
  },
  spinner: {
    marginRight: 12,
  },
  hint: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 6,
    marginLeft: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 400,
    overflow: 'hidden',
  },
  dropdownHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultImg: {
    width: 48,
    height: 66,
    borderRadius: 8,
  },
  resultImgPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
});
