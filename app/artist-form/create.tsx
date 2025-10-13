import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { uploadImageFromUri } from '@/lib/storage';
import { ArrowLeft, Check } from 'lucide-react-native';
import { ImagePicker } from '@/components/ImagePicker';

export default function CreateArtistScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [artistName, setArtistName] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [artistGenre, setArtistGenre] = useState('');
  const [artistDescription, setArtistDescription] = useState('');
  const [artistWebsite, setArtistWebsite] = useState('');
  const [artistImageUri, setArtistImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateArtist() {
    if (!artistName.trim()) {
      Alert.alert('Error', 'Artist name is required');
      return;
    }

    if (!userProfile?.id) {
      Alert.alert('Error', 'User profile not loaded. Please try again.');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (artistImageUri) {
        const { url, error: uploadError } = await uploadImageFromUri(artistImageUri, 'artists');
        if (uploadError) {
          Alert.alert('Error', 'Failed to upload image: ' + uploadError.message);
          setSubmitting(false);
          return;
        }
        imageUrl = url;
      }

      const { data, error } = await supabase.from('artists').insert({
        owner_id: userProfile.id,
        name: artistName,
        bio: artistBio || null,
        genre: artistGenre || null,
        description: artistDescription || null,
        website: artistWebsite || null,
        image_url: imageUrl,
      }).select();

      setSubmitting(false);

      if (error) {
        console.error('Artist creation error:', error);
        Alert.alert('Error', `Failed to create artist: ${error.message}`);
      } else {
        Alert.alert('Success', 'Artist created successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (err) {
      setSubmitting(false);
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Artist</Text>
        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          onPress={handleCreateArtist}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Check size={24} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <ImagePicker
            currentImageUrl={artistImageUri}
            onImageSelected={setArtistImageUri}
            onImageRemoved={() => setArtistImageUri(null)}
            label="Artist Image"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Artist Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter artist name"
              placeholderTextColor="#8E8E93"
              value={artistName}
              onChangeText={setArtistName}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Genre</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Rock, Pop, Hip-Hop"
              placeholderTextColor="#8E8E93"
              value={artistGenre}
              onChangeText={setArtistGenre}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Short description of the artist"
              placeholderTextColor="#8E8E93"
              value={artistDescription}
              onChangeText={setArtistDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com"
              placeholderTextColor="#8E8E93"
              value={artistWebsite}
              onChangeText={setArtistWebsite}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell fans about this artist..."
              placeholderTextColor="#8E8E93"
              value={artistBio}
              onChangeText={setArtistBio}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#1DB954',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
