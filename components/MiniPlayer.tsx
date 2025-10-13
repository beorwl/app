import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play, Pause } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function MiniPlayer() {
  const { currentTrack, currentAlbum, isPlaying, togglePlayPause } = usePlayer();
  const router = useRouter();

  if (!currentTrack || !currentAlbum) {
    return null;
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#404040',
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
