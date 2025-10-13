import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import * as ExpoImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';

interface ImagePickerProps {
  currentImageUrl?: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved?: () => void;
  label?: string;
}

export function ImagePicker({ currentImageUrl, onImageSelected, onImageRemoved, label = 'Image' }: ImagePickerProps) {
  const [imageUri, setImageUri] = useState<string | null>(currentImageUrl || null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    if (Platform.OS !== 'web') {
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images.');
        return;
      }
    }

    setLoading(true);

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    setLoading(false);

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onImageSelected(uri);
    }
  }

  function removeImage() {
    setImageUri(null);
    if (onImageRemoved) {
      onImageRemoved();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <X size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#1DB954" />
          ) : (
            <>
              <Camera size={32} color="#8E8E93" />
              <Text style={styles.uploadText}>Choose Image</Text>
            </>
          )}
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
  uploadButton: {
    height: 120,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#2C2C2E',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
