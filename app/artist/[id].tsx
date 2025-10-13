import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, Linking, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { deleteImage } from '@/lib/storage';
import { Artist, Album } from '@/types/database';

interface Track {
  id: string;
  title: string;
  track_number: number;
  play_count: number;
  album_id: string;
  album: {
    id: string;
    title: string;
    cover_image_url: string | null;
  };
}
import { Plus, Trash2, ArrowLeft, Music, ExternalLink } from 'lucide-react-native';

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userProfile } = useAuth();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = artist?.owner_id === userProfile?.id;

  useFocusEffect(
    useCallback(() => {
      loadArtistData();
    }, [id])
  );

  async function loadArtistData() {
    setLoading(true);

    const [artistResult, albumsResult, topTracksResult] = await Promise.all([
      supabase.from('artists').select('*').eq('id', id).maybeSingle(),
      supabase.from('albums').select('*').eq('artist_id', id).order('release_date', { ascending: false }),
      supabase
        .from('tracks')
        .select(`
          id,
          title,
          track_number,
          play_count,
          album_id,
          album:albums(
            id,
            title,
            cover_image_url
          )
        `)
        .eq('albums.artist_id', id)
        .order('play_count', { ascending: false })
        .limit(10),
    ]);

    if (artistResult.data) {
      setArtist(artistResult.data);
    }

    if (albumsResult.data) {
      setAlbums(albumsResult.data);
    }

    if (topTracksResult.data) {
      setTopTracks(topTracksResult.data as Track[]);
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
      <View style={styles.heroSection}>
        {artist.image_url ? (
          <Image source={{ uri: artist.image_url }} style={styles.artistImage} />
        ) : (
          <View style={[styles.artistImage, styles.artistImagePlaceholder]}>
            <Music size={64} color="#3C3C3E" />
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonFloating}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}>
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{artist.name}</Text>
            {artist.description && <Text style={styles.artistDescription}>{artist.description}</Text>}
            {artist.website && (
              <TouchableOpacity
                style={styles.websiteButton}
                onPress={() => Linking.openURL(artist.website!)}>
                <ExternalLink size={14} color="#1DB954" />
                <Text style={styles.websiteText}>Visit Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {artist.genre && (
        <View style={styles.genreSection}>
          <Text style={styles.artistGenre}>{artist.genre}</Text>
        </View>
      )}

      {artist.bio && (
        <View style={styles.bioSection}>
          <Text style={styles.bioLabel}>About</Text>
          <Text style={styles.artistBio}>{artist.bio}</Text>
        </View>
      )}

      {topTracks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Tracks</Text>
          <View style={styles.topTracksList}>
            {topTracks.map((track, index) => (
              <TouchableOpacity
                key={track.id}
                style={styles.topTrackItem}
                onPress={() => router.push(`/player/${track.album_id}`)}>
                <Text style={styles.topTrackNumber}>{index + 1}</Text>
                {track.album.cover_image_url ? (
                  <Image source={{ uri: track.album.cover_image_url }} style={styles.topTrackCover} />
                ) : (
                  <View style={[styles.topTrackCover, styles.topTrackCoverPlaceholder]}>
                    <Music size={20} color="#3C3C3E" />
                  </View>
                )}
                <View style={styles.topTrackInfo}>
                  <Text style={styles.topTrackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.topTrackAlbum} numberOfLines={1}>{track.album.title}</Text>
                </View>
                <Text style={styles.topTrackPlays}>{track.play_count.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discography</Text>
          {isOwner && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push(`/album-form/create?artistId=${id}`)}>
              <Plus size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add Album</Text>
            </TouchableOpacity>
          )}
        </View>

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
  heroSection: {
    position: 'relative',
    width: '100%',
  },
  artistImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#1C1C1E',
  },
  artistImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFloating: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  artistInfo: {
    padding: 20,
    paddingBottom: 24,
  },
  genreSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bioSection: {
    padding: 16,
  },
  bioLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  artistGenre: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  artistDescription: {
    fontSize: 15,
    color: '#FFF',
    marginTop: 8,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  websiteText: {
    fontSize: 13,
    color: '#1DB954',
    fontWeight: '600',
  },
  artistBio: {
    fontSize: 14,
    color: '#B3B3B3',
    lineHeight: 22,
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
  topTracksList: {
    gap: 8,
  },
  topTrackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#181818',
    borderRadius: 8,
    gap: 12,
  },
  topTrackNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    width: 24,
    textAlign: 'center',
  },
  topTrackCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#282828',
  },
  topTrackCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTrackInfo: {
    flex: 1,
  },
  topTrackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  topTrackAlbum: {
    fontSize: 13,
    color: '#B3B3B3',
    marginTop: 2,
  },
  topTrackPlays: {
    fontSize: 13,
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    padding: 24,
  },
});
