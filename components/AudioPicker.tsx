import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Music, Trash2 } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

interface AudioPickerProps {
  currentAudioUri: string | null;
  onAudioSelected: (uri: string) => void;
  onAudioRemoved: () => void;
  label?: string;
  trackTitle?: string;
}

export function AudioPicker({
  currentAudioUri,
  onAudioSelected,
  onAudioRemoved,
  label = 'Audio File',
  trackTitle,
}: AudioPickerProps) {
  async function handlePickAudio() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];

        if (!asset.mimeType?.startsWith('audio/')) {
          Alert.alert('Error', 'Please select an audio file (MP3, WAV, etc.)');
          return;
        }

        onAudioSelected(asset.uri);
      }
    } catch (error) {
      console.error('Error picking audio:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  }

  const fileName = currentAudioUri?.split('/').pop() || 'No file selected';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {trackTitle && <Text style={styles.trackTitle}>{trackTitle}</Text>}

      {currentAudioUri ? (
        <View style={styles.audioPreview}>
          <View style={styles.audioInfo}>
            <Music size={24} color="#1DB954" />
            <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
          </View>
          <TouchableOpacity onPress={onAudioRemoved} style={styles.removeButton}>
            <Trash2 size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.pickerButton} onPress={handlePickAudio}>
          <Music size={24} color="#8E8E93" />
          <Text style={styles.pickerText}>Choose Audio File</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  trackTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2C2C2E',
    borderStyle: 'dashed',
    gap: 8,
  },
  pickerText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  audioPreview: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  removeButton: {
    padding: 8,
  },
});
