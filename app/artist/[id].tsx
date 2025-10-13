import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { deleteImage } from '@/lib/storage';
import { Artist, Album } from '@/types/database';
import { Plus, Trash2, ArrowLeft, Music } from 'lucide-react-native';

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userProfile } = useAuth();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = artist?.owner_id === userProfile?.id;

  useFocusEffect(
    useCallback(() => {
      loadArtistData();
    }, [id])
  );

  async function loadArtistData() {
    setLoading(true);

    const [artistResult, albumsResult] = await Promise.all([
      supabase.from('artists').select('*').eq('id', id).maybeSingle(),
      supabase.from('albums').select('*').eq('artist_id', id).order('created_at', { ascending: false }),
    ]);

    if (artistResult.data) {
      setArtist(artistResult.data);
    }

    if (albumsResult.data) {
      setAlbums(albumsResult.data);
    }

    setLoading(false);
  }


  async function handleDeleteAlbum(album: Album) {
    Alert.alert('Delete Album', 'Are you sure you want to delete this album? All tracks will also be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (album.cover_image_url) {
            await deleteImage(album.cover_image_url);
          }

          const { error } = await supabase.from('albums').delete().eq('id', album.id);

          if (error) {
            Alert.alert('Error', error.message);
          } else {
            loadArtistData();
          }
        },
      },
    ]);
  }


  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Artist not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artist Details</Text>
      </View>

      <View style={styles.artistHeader}>
        <Text style={styles.artistName}>{artist.name}</Text>
        {artist.genre && <Text style={styles.artistGenre}>{artist.genre}</Text>}
        {artist.bio && <Text style={styles.artistBio}>{artist.bio}</Text>}
      </View>

      {isOwner && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Albums</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push(`/album-form/create?artistId=${id}`)}>
              <Plus size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add Album</Text>
            </TouchableOpacity>
          </View>

        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Albums</Text>

        {albums.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Music size={48} color="#8E8E93" />
            <Text style={styles.emptyText}>No albums yet</Text>
            {isOwner && (
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => router.push(`/album-form/create?artistId=${id}`)}>
                <Plus size={20} color="#FFF" />
                <Text style={styles.createFirstButtonText}>Create Album</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.albumsGrid}>
            {albums.map((album) => (
              <TouchableOpacity
                key={album.id}
                style={styles.albumCard}
                onPress={() => router.push(`/player/${album.id}`)}>
                {album.cover_image_url ? (
                  <Image source={{ uri: album.cover_image_url }} style={styles.albumCover} />
                ) : (
                  <View style={[styles.albumCover, styles.albumCoverPlaceholder]}>
                    <Music size={48} color="#3C3C3E" />
                  </View>
                )}
                <View style={styles.albumCardInfo}>
                  <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                  {album.release_date && (
                    <Text style={styles.albumDate}>
                      {new Date(album.release_date).getFullYear()}
                    </Text>
                  )}
                </View>
                {isOwner && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteAlbum(album);
                    }}
                    style={styles.deleteIconButton}>
                    <Trash2 size={18} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  artistHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  artistGenre: {
    fontSize: 16,
    color: '#1DB954',
    marginTop: 4,
  },
  artistBio: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  albumCard: {
    width: '47%',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 12,
    position: 'relative',
  },
  albumCover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: '#282828',
  },
  albumCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCardInfo: {
    marginTop: 12,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  albumDate: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: 4,
  },
  deleteIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 6,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    padding: 24,
  },
});
