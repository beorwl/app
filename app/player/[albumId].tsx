import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Album } from '@/types/database';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack } from 'lucide-react-native';
import { Audio } from 'expo-av';

interface Track {
  id: string;
  title: string;
  track_number: number;
  audio_url: string;
  duration_seconds: number | null;
  play_count: number | null;
}

export default function PlayerScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const router = useRouter();

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    loadAlbumData();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [albumId]);

  async function loadAlbumData() {
    setLoading(true);

    const [albumResult, tracksResult] = await Promise.all([
      supabase.from('albums').select('*').eq('id', albumId).maybeSingle(),
      supabase.from('tracks').select('*').eq('album_id', albumId).order('track_number', { ascending: true }),
    ]);

    if (albumResult.data) {
      setAlbum(albumResult.data);
    }

    if (tracksResult.data) {
      setTracks(tracksResult.data);
    }

    setLoading(false);
  }

  async function playTrack(index: number) {
    if (sound) {
      await sound.unloadAsync();
    }

    const track = tracks[index];
    if (!track || !track.audio_url) return;

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audio_url },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentTrackIndex(index);
      setIsPlaying(true);

      await supabase
        .from('tracks')
        .update({ play_count: (track.play_count || 0) + 1 })
        .eq('id', track.id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          handleNext();
        }
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  async function togglePlayPause() {
    if (!sound) {
      playTrack(currentTrackIndex);
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }

  async function handleNext() {
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length) {
      await playTrack(nextIndex);
    } else {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    }
  }

  async function handlePrevious() {
    const prevIndex = currentTrackIndex - 1;
    if (prevIndex >= 0) {
      await playTrack(prevIndex);
    }
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

  if (!album) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Album not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{album.title}</Text>
      </View>

      <ScrollView style={styles.content}>
        {album.cover_image_url && (
          <Image source={{ uri: album.cover_image_url }} style={styles.coverImage} />
        )}

        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{album.title}</Text>
          {album.description && (
            <Text style={styles.albumDescription}>{album.description}</Text>
          )}
        </View>

        {currentTrack && (
          <View style={styles.nowPlaying}>
            <Text style={styles.nowPlayingLabel}>Now Playing</Text>
            <Text style={styles.nowPlayingTitle}>{currentTrack.title}</Text>
            <Text style={styles.nowPlayingNumber}>Track {currentTrack.track_number}</Text>
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentTrackIndex === 0}
            style={[styles.controlButton, currentTrackIndex === 0 && styles.controlButtonDisabled]}>
            <SkipBack size={32} color={currentTrackIndex === 0 ? '#3C3C3E' : '#FFF'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            {isPlaying ? (
              <Pause size={48} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={48} color="#FFF" fill="#FFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={currentTrackIndex === tracks.length - 1}
            style={[styles.controlButton, currentTrackIndex === tracks.length - 1 && styles.controlButtonDisabled]}>
            <SkipForward size={32} color={currentTrackIndex === tracks.length - 1 ? '#3C3C3E' : '#FFF'} />
          </TouchableOpacity>
        </View>

        <View style={styles.tracksList}>
          <Text style={styles.tracksTitle}>Tracks</Text>
          {tracks.map((track, index) => (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackItem,
                currentTrackIndex === index && styles.trackItemActive,
              ]}
              onPress={() => playTrack(index)}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackNumber}>{track.track_number}</Text>
                <Text style={[
                  styles.trackTitle,
                  currentTrackIndex === index && styles.trackTitleActive,
                ]}>
                  {track.title}
                </Text>
              </View>
              {currentTrackIndex === index && isPlaying && (
                <Play size={16} color="#1DB954" fill="#1DB954" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    padding: 24,
  },
  coverImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1C1C1E',
  },
  albumInfo: {
    padding: 24,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  albumDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    lineHeight: 20,
  },
  nowPlaying: {
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 24,
  },
  nowPlayingLabel: {
    fontSize: 12,
    color: '#1DB954',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  nowPlayingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  nowPlayingNumber: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingVertical: 24,
  },
  controlButton: {
    padding: 12,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tracksList: {
    padding: 16,
  },
  tracksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    marginBottom: 8,
  },
  trackItemActive: {
    backgroundColor: '#282828',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  trackNumber: {
    fontSize: 16,
    color: '#8E8E93',
    width: 24,
    textAlign: 'center',
  },
  trackTitle: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  trackTitleActive: {
    color: '#1DB954',
    fontWeight: '600',
  },
});
