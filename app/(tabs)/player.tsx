import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Song, Artist } from '@/types/database';
import Slider from '@react-native-community/slider';

export default function PlayerTab() {
  const { songId } = useLocalSearchParams();
  const [song, setSong] = useState<Song | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (songId && typeof songId === 'string') {
      loadSong(songId);
    }
  }, [songId]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (song && prev >= song.duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, song]);

  async function loadSong(id: string) {
    setLoading(true);
    try {
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (songError) throw songError;
      setSong(songData);

      if (songData) {
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('id', songData.artist_id)
          .maybeSingle();

        if (artistError) throw artistError;
        setArtist(artistData);
      }
    } catch (error) {
      console.error('Error loading song:', error);
    } finally {
      setLoading(false);
    }
  }

  function togglePlayPause() {
    setIsPlaying(!isPlaying);
  }

  function skipForward() {
    if (song) {
      setCurrentTime(Math.min(currentTime + 15, song.duration));
    }
  }

  function skipBackward() {
    setCurrentTime(Math.max(currentTime - 15, 0));
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!song || !artist) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noSongText}>No song selected</Text>
        <Text style={styles.noSongSubtext}>Browse artists and select a song to play</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.coverContainer}>
        <Image source={{ uri: song.cover_url || artist.image_url }} style={styles.coverImage} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.artistName}>{artist.name}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={song.duration}
          value={currentTime}
          onValueChange={setCurrentTime}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#4D4D4D"
          thumbTintColor="#1DB954"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(song.duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={skipBackward}>
          <SkipBack size={32} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          {isPlaying ? (
            <Pause size={40} color="#000" fill="#FFF" />
          ) : (
            <Play size={40} color="#000" fill="#FFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward}>
          <SkipForward size={32} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.volumeContainer}>
        <Volume2 size={20} color="#8E8E93" />
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={100}
          value={100}
          minimumTrackTintColor="#8E8E93"
          maximumTrackTintColor="#4D4D4D"
          thumbTintColor="#8E8E93"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 24,
  },
  noSongText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  noSongSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  coverImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
  },
  infoContainer: {
    marginBottom: 40,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 16,
    color: '#8E8E93',
  },
  progressContainer: {
    marginBottom: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginBottom: 40,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
});
