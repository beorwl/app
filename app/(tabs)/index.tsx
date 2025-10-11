import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Artist } from '@/types/database';

export default function BrowseTab() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadArtists();
  }, []);

  async function loadArtists() {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse Artists</Text>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.artistCard}
            onPress={() => router.push(`/artist/${item.id}`)}>
            <Image source={{ uri: item.image_url }} style={styles.artistImage} />
            <Text style={styles.artistName}>{item.name}</Text>
            <Text style={styles.artistGenre}>{item.genre}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  grid: {
    paddingHorizontal: 8,
  },
  artistCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistGenre: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
