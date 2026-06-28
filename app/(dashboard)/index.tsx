import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MediaEntriesClient, {
  type MediaEntryMinimalDto,
  MediaType,
} from '../../clients/MediaEntriesClient';
import { useUser } from '../../shared/UserContext';
import { statusSections } from '../../shared/mediaConstants';

export default function DashboardScreen() {
  const { currentUser } = useUser();
  const [entries, setEntries] = useState<MediaEntryMinimalDto[]>([]);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<number>(MediaType.All);
  const [client] = useState(() => new MediaEntriesClient());

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await client.getMediaEntries();
        setEntries(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch entries: ' + (error as Error).message);
      }
    };

    void fetchEntries();
  }, [client]);


  const filteredEntries = mediaTypeFilter === MediaType.All 
    ? entries 
    : entries.filter(e => e.mediaType === mediaTypeFilter);

  const renderStatusSection = ({ type, title }: { type: number; title: string }) => {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView>
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
          style={{ paddingHorizontal: 16, paddingVertical: 12 }}
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
              <Text
                style={{
                  color: mediaTypeFilter === type.value ? '#fff' : '#333',
                  fontWeight: mediaTypeFilter === type.value ? 'bold' : 'normal',
                }}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Sections */}
        {statusSections.map(renderStatusSection)}

        {filteredEntries.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: '#999', marginBottom: 12 }}>No entries yet</Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Your First Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
