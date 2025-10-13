import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';

interface Track {
  id: string;
  title: string;
  audio_url: string;
  album_id: string;
  total_playtime_seconds: number | null;
}

interface Album {
  id: string;
  title: string;
  cover_image_url: string | null;
  artist_id: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  playTrack: (track: Track, album: Album) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stopPlayback: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const playStartTimeRef = useRef<number | null>(null);
  const lastPositionRef = useRef<number>(0);

  async function recordPlaytime() {
    if (!currentTrack || !playStartTimeRef.current) return;

    const playedSeconds = Math.floor(lastPositionRef.current);
    if (playedSeconds > 0) {
      await supabase
        .from('tracks')
        .update({
          total_playtime_seconds: (currentTrack.total_playtime_seconds || 0) + playedSeconds
        })
        .eq('id', currentTrack.id);
    }

    playStartTimeRef.current = null;
    lastPositionRef.current = 0;
  }

  async function playTrack(track: Track, album: Album) {
    if (sound) {
      await recordPlaytime();
      await sound.unloadAsync();
    }

    if (!track.audio_url) return;

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audio_url },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentTrack(track);
      setCurrentAlbum(album);
      setIsPlaying(true);
      playStartTimeRef.current = Date.now();
      lastPositionRef.current = 0;

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.isPlaying) {
            lastPositionRef.current = status.positionMillis / 1000;
          }
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  async function togglePlayPause() {
    if (!sound) return;

    if (isPlaying) {
      await recordPlaytime();
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      playStartTimeRef.current = Date.now();
      await sound.playAsync();
      setIsPlaying(true);
    }
  }

  async function stopPlayback() {
    if (sound) {
      await recordPlaytime();
      await sound.unloadAsync();
      setSound(null);
    }
    setCurrentTrack(null);
    setCurrentAlbum(null);
    setIsPlaying(false);
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentAlbum,
        isPlaying,
        playTrack,
        togglePlayPause,
        stopPlayback,
      }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
