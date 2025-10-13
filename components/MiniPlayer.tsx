import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function MiniPlayer() {
  const { currentTrack, currentAlbum, isPlaying, position, duration, togglePlayPause } = usePlayer();
  const router = useRouter();

  if (!currentTrack || !currentAlbum) {
    return null;
  }

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <TouchableOpacity
        style={styles.container}
        onPress={() => router.push(`/(tabs)/player/${currentAlbum.id}`)}
        activeOpacity={0.8}>
        <Image
          source={{ uri: currentAlbum.cover_image_url || '' }}
          style={styles.albumArt}
        />
        <View style={styles.info}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.albumTitle} numberOfLines={1}>
            {currentAlbum.title}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}>
          {isPlaying ? (
            <Pause size={24} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={24} color="#FFF" fill="#FFF" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#282828',
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: '#404040',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  albumTitle: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
