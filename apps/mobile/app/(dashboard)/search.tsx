import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState, useRef, useEffect } from 'react';
import { PagedRequestCoordinator } from '@mediavault/client-core';
import type { MediaEntryMinimalDto } from '@mediavault/contracts';
import { useUser } from '../../shared/UserContext';
import { MediaEntryService } from '../../services/mediaEntryService';
import { MediaTypeLabels } from '../../shared/mediaConstants';
import { Colors, S } from '../../constants/theme';

const DEBOUNCE_DELAY_MS = 400;
const MIN_SEARCH_LENGTH = 3;

export default function SearchScreen() {
  const { currentUser } = useUser();
  const [mediaEntryService] = useState(() => new MediaEntryService());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaEntryMinimalDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestCoordinator = useRef(new PagedRequestCoordinator());
  const requestController = useRef<AbortController | null>(null);

  const executeSearch = useCallback(async (query: string, requestedPage: number) => {
    if (!currentUser) return;
    const normalizedQuery = query.trim();
    const ticket = requestCoordinator.current.begin(`search:${normalizedQuery}:${requestedPage}`);
    if (!ticket) return;

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setPageNumber(requestedPage);
    try {
      const page = await mediaEntryService.searchAsync(
        currentUser.id,
        normalizedQuery,
        requestedPage,
        10,
        controller.signal,
      );
      if (!requestCoordinator.current.isCurrent(ticket)) return;

      setSearchResults(page.items);
      setPageNumber(page.pageNumber);
      setTotalPages(page.totalPages);
    } catch (error) {
      if (requestCoordinator.current.isCurrent(ticket)) {
        setSearchResults([]);
        setSearchError((error as Error).message);
      }
    } finally {
      requestCoordinator.current.complete(ticket);
      if (requestCoordinator.current.isCurrent(ticket)) setIsSearching(false);
    }
  }, [currentUser, mediaEntryService]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.length < MIN_SEARCH_LENGTH) {
      requestController.current?.abort();
      requestCoordinator.current.invalidate();
      setSearchResults([]);
      setSearchError(null);
      setPageNumber(1);
      setTotalPages(0);
      return;
    }

    requestController.current?.abort();
    requestCoordinator.current.invalidate();
    debounceTimer.current = setTimeout(() => {
      void executeSearch(searchQuery, 1);
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [executeSearch, searchQuery]);

  useEffect(() => {
    const coordinator = requestCoordinator.current;
    return () => {
      requestController.current?.abort();
      coordinator.invalidate();
    };
  }, []);

  return (
    <SafeAreaView style={S.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search your library..."
            placeholderTextColor={S.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {isSearching && <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 4 }} />}
        </View>

        {searchQuery.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH && (
          <Text style={styles.hint}>
            Type at least {MIN_SEARCH_LENGTH} characters to search
          </Text>
        )}
      </View>

      {/* Results */}
      {searchError && !isSearching && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Search failed</Text>
          <Text style={styles.errorDetail}>{searchError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void executeSearch(searchQuery, pageNumber)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!searchError && searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultCard} activeOpacity={0.7}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.resultImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
                  <Text style={{ fontSize: 22 }}>🎬</Text>
                </View>
              )}
              <View style={styles.resultBody}>
                <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>{MediaTypeLabels[item.mediaType]}</Text>
                </View>
                {item.rating > 0 && (
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={totalPages > 0 ? (
            <View style={styles.paginationRow}>
              <TouchableOpacity
                style={[styles.pageButton, (isSearching || pageNumber <= 1) && styles.pageButtonDisabled]}
                disabled={isSearching || pageNumber <= 1}
                onPress={() => void executeSearch(searchQuery, pageNumber - 1)}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageLabel}>Page {pageNumber} of {totalPages}</Text>
              <TouchableOpacity
                style={[styles.pageButton, (isSearching || pageNumber >= totalPages) && styles.pageButtonDisabled]}
                disabled={isSearching || pageNumber >= totalPages}
                onPress={() => void executeSearch(searchQuery, pageNumber + 1)}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        />
      )}

      {!searchError && searchQuery.length >= MIN_SEARCH_LENGTH && searchResults.length === 0 && !isSearching && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔭</Text>
          <Text style={styles.emptyStateText}>No results found</Text>
        </View>
      )}
    </SafeAreaView>
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
  searchContainer: {
    padding: 16,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    paddingHorizontal: 4,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultImage: {
    width: 72,
    height: 108,
  },
  resultImagePlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: {
    flex: 1,
    padding: 12,
    gap: 4,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryDim,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  resultBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    color: '#f59e0b',
    fontSize: 13,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 60,
  },
  emptyStateIcon: {
    fontSize: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorDetail: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  pageButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  pageLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
