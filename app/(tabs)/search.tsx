import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, Keyboard, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, Music, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Artist, Song } from '@/types/database';

type SearchResult = {
  type: 'artist' | 'song';
  data: Artist | Song;
};

const METAL_GENRES = [
  'Black Metal',
  'Death Metal',
  'Doom Metal'
];

export default function SearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genreArtists, setGenreArtists] = useState<Artist[]>([]);
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  async function handleSearch(text: string) {
    setQuery(text);
    setSelectedGenre(null);
    setGenreArtists([]);

    if (text.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const searchTerm = `%${text}%`;

      const { data: artistData } = await supabase
        .from('artists')
        .select('*')
        .ilike('name', searchTerm)
        .limit(10);

      const { data: songData } = await supabase
        .from('songs')
        .select('*')
        .ilike('title', searchTerm)
        .limit(10);

      const artistResults: SearchResult[] = (artistData || []).map(artist => ({
        type: 'artist' as const,
        data: artist,
      }));

      const songResults: SearchResult[] = (songData || []).map(song => ({
        type: 'song' as const,
        data: song,
      }));

      setResults([...artistResults, ...songResults]);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  }

  async function handleGenreSelect(genre: string) {
    setSelectedGenre(genre);
    setSearching(true);
    try {
      const { data } = await supabase
        .from('artists')
        .select('*')
        .ilike('genre', `%${genre}%`)
        .limit(20);

      setGenreArtists(data || []);
    } catch (error) {
      console.error('Error fetching genre artists:', error);
    } finally {
      setSearching(false);
    }
  }

  function handleCancel() {
    inputRef.current?.blur();
    Keyboard.dismiss();
    setTimeout(() => {
      setQuery('');
      setResults([]);
    }, 0);
  }

  function handleResultPress(result: SearchResult) {
    if (result.type === 'artist') {
      router.push(`/artist/${result.data.id}`);
    } else {
      router.push(`/(tabs)/player?songId=${result.data.id}`);
    }
  }

  function renderResult({ item }: { item: SearchResult }) {
    if (item.type === 'artist') {
      const artist = item.data as Artist;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}>
          <Image source={{ uri: artist.image_url }} style={styles.resultImage} />
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>{artist.name}</Text>
            <Text style={styles.resultSubtitle}>Artist • {artist.genre}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      const song = item.data as Song;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}>
          <View style={styles.songIconContainer}>
            <Music size={24} color="#FFF" />
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>{song.title}</Text>
            <Text style={styles.resultSubtitle}>Song</Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Artists or songs"
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <X size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {query.length === 0 && !selectedGenre && (
        <ScrollView style={styles.genresContainer}>
          <Text style={styles.genresTitle}>Browse Metal Genres</Text>
          <View style={styles.genresGrid}>
            {METAL_GENRES.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={styles.genreCard}
                onPress={() => handleGenreSelect(genre)}>
                <Text style={styles.genreText}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {selectedGenre && (
        <View style={styles.genreResults}>
          <View style={styles.genreHeader}>
            <Text style={styles.genreResultsTitle}>{selectedGenre}</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedGenre(null);
                setGenreArtists([]);
              }}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>Back to Genres</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={genreArtists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => router.push(`/artist/${item.id}`)}>
                <Image source={{ uri: item.image_url }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle}>{item.name}</Text>
                  <Text style={styles.resultSubtitle}>Artist • {item.genre}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.resultsList}
          />
        </View>
      )}

      {query.length > 0 && results.length === 0 && !searching && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      )}

      {query.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.type}-${item.data.id}-${index}`}
          renderItem={renderResult}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#FFF',
  },
  cancelButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
  resultsList: {
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  songIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  genresContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  genresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genreCard: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '47%',
    alignItems: 'center',
  },
  genreText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  genreResults: {
    flex: 1,
  },
  genreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  genreResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
});
