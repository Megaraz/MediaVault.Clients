import { View, Text, TextInput, TouchableOpacity, FlatList, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import MediaEntriesClient, { type MediaEntryMinimalDto, MediaTypeLabels } from '../../clients/MediaEntriesClient';

const DEBOUNCE_DELAY_MS = 400;
const MIN_SEARCH_LENGTH = 3;

export default function SearchScreen() {
  const [client] = useState(() => new MediaEntriesClient());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaEntryMinimalDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await client.searchMediaEntries({ query: searchQuery });
        setSearchResults(results);
      } catch (error) {
        Alert.alert('Search Error', (error as Error).message);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, client]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>
          Search
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
            paddingHorizontal: 12,
          }}
        >
          <TextInput
            placeholder="Search media..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, padding: 12, fontSize: 16 }}
          />
          {isSearching && <ActivityIndicator size="small" color="#3b82f6" />}
        </View>

        {searchQuery.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH && (
          <Text style={{ color: '#999', marginTop: 8 }}>
            Type at least {MIN_SEARCH_LENGTH} characters to search
          </Text>
        )}
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                marginBottom: 12,
                flexDirection: 'row',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            >
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: 80, height: 120 }}
                  resizeMode="cover"
                />
              )}
              <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                    {MediaTypeLabels[item.mediaType]}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#3b82f6', fontWeight: 'bold' }}>
                    ⭐ {item.rating}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {searchQuery.length >= MIN_SEARCH_LENGTH && searchResults.length === 0 && !isSearching && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999' }}>No results found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
