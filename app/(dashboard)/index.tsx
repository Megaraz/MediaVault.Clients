import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

  const renderStatusSection = ({ type, title }: { type: number; title: string }) => {
    const sectionEntries = filteredEntries.filter(e => e.status === type);
    if (sectionEntries.length === 0) return null;

    return (
      <View key={type} style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', paddingHorizontal: 16, paddingVertical: 8 }}>
          {title}
        </Text>
        {sectionEntries.map(entry => (
          <View
            key={entry.id}
            style={{
              marginHorizontal: 16,
              marginBottom: 8,
              padding: 12,
              backgroundColor: '#fff',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#111' }}>{entry.title}</Text>
            <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
              {MediaTypeLabels[entry.mediaType] ?? 'Unknown'}{entry.rating > 0 ? ` · ★ ${entry.rating}` : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>MediaVault</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>Hi, {currentUser?.username}</Text>
        </View>
      </View>

      {/* Media Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, paddingVertical: 12, flexGrow: 0 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {[
          { value: MediaType.All, label: 'All' },
          { value: MediaType.Movie, label: 'Movies' },
          { value: MediaType.Series, label: 'Series' },
          { value: MediaType.Book, label: 'Books' },
          { value: MediaType.Manga, label: 'Manga' },
          { value: MediaType.Game, label: 'Games' },
        ].map((type) => (
          <TouchableOpacity
            key={type.value}
            onPress={() => setMediaTypeFilter(type.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: mediaTypeFilter === type.value ? '#3b82f6' : '#e5e7eb',
            }}
          >
            <Text style={{ color: mediaTypeFilter === type.value ? '#fff' : '#333', fontWeight: mediaTypeFilter === type.value ? 'bold' : 'normal' }}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView>
          {filteredEntries.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, color: '#999', marginBottom: 12 }}>No entries yet</Text>
            </View>
          ) : (
            statusSections.map(section => renderStatusSection(section))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

