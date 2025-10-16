import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { uploadImageFromUri, uploadAudioFromUri } from '@/lib/storage';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react-native';
import { ImagePicker } from '@/components/ImagePicker';
import { AudioPicker } from '@/components/AudioPicker';

interface TrackInput {
  title: string;
  track_number: number;
  audio_url: string;
  audio_uri: string | null;
  duration_seconds: string;
}

export default function CreateAlbumScreen() {
  const router = useRouter();
  const { artistId } = useLocalSearchParams<{ artistId: string }>();

  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumCoverUri, setAlbumCoverUri] = useState<string | null>(null);
  const [albumReleaseDate, setAlbumReleaseDate] = useState('');
  const [tracks, setTracks] = useState<TrackInput[]>([{ title: '', track_number: 1, audio_url: '', audio_uri: null, duration_seconds: '' }]);
  const [uploadingTracks, setUploadingTracks] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function addTrackField() {
    setTracks([...tracks, { title: '', track_number: tracks.length + 1, audio_url: '', audio_uri: null, duration_seconds: '' }]);
  }

  function removeTrackField(index: number) {
    const newTracks = tracks.filter((_, i) => i !== index);
    setTracks(newTracks.map((track, i) => ({ ...track, track_number: i + 1 })));
  }

  function updateTrack(index: number, field: keyof TrackInput, value: string) {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setTracks(newTracks);
  }

  async function handleCreateAlbum() {
    if (!albumTitle.trim()) {
      Alert.alert('Error', 'Album title is required');
      return;
    }

    const validTracks = tracks.filter(t => t.title.trim() && (t.audio_url.trim() || t.audio_uri));
    if (validTracks.length === 0) {
      Alert.alert('Error', 'At least one track with title and audio file is required');
      return;
    }

    setSubmitting(true);

    try {
      let coverImageUrl: string | null = null;

      if (albumCoverUri) {
        const { url, error: uploadError } = await uploadImageFromUri(albumCoverUri, 'albums');
        if (uploadError) {
          Alert.alert('Error', 'Failed to upload cover image: ' + uploadError.message);
          setSubmitting(false);
          return;
        }
        coverImageUrl = url;
      }

      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          artist_id: artistId,
          title: albumTitle,
          description: albumDescription || null,
          cover_image_url: coverImageUrl,
          release_date: albumReleaseDate || null,
        })
        .select()
        .single();

      if (albumError || !albumData) {
        Alert.alert('Error', albumError?.message || 'Failed to create album');
        setSubmitting(false);
        return;
      }

      const tracksToInsert = await Promise.all(
        validTracks.map(async (track) => {
          let audioUrl = track.audio_url;

          if (track.audio_uri && !track.audio_url) {
            const { url, error: uploadError } = await uploadAudioFromUri(track.audio_uri);
            if (uploadError || !url) {
              throw new Error(`Failed to upload audio for "${track.title}": ${uploadError?.message}`);
            }
            audioUrl = url;
          }

          return {
            album_id: albumData.id,
            title: track.title,
            track_number: track.track_number,
            audio_url: audioUrl,
            duration_seconds: track.duration_seconds ? parseInt(track.duration_seconds) : null,
          };
        })
      );

      const { error: tracksError } = await supabase.from('tracks').insert(tracksToInsert);

      setSubmitting(false);

      if (tracksError) {
        Alert.alert('Error', tracksError.message);
      } else {
        Alert.alert('Success', 'Album created successfully!', [
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
        <Text style={styles.headerTitle}>Create Album</Text>
        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          onPress={handleCreateAlbum}
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
            currentImageUrl={albumCoverUri}
            onImageSelected={setAlbumCoverUri}
            onImageRemoved={() => setAlbumCoverUri(null)}
            label="Album Cover"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Album Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter album title"
              placeholderTextColor="#666666"
              value={albumTitle}
              onChangeText={setAlbumTitle}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Release Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g., 2024-01-15)"
              placeholderTextColor="#666666"
              value={albumReleaseDate}
              onChangeText={setAlbumReleaseDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the album..."
              placeholderTextColor="#666666"
              value={albumDescription}
              onChangeText={setAlbumDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.tracksSection}>
            <Text style={styles.tracksTitle}>Tracks *</Text>
            <Text style={styles.tracksSubtitle}>At least one track is required</Text>

            {tracks.map((track, index) => (
              <View key={index} style={styles.trackInput}>
                <View style={styles.trackHeader}>
                  <Text style={styles.trackNumber}>Track {track.track_number}</Text>
                  {tracks.length > 1 && (
                    <TouchableOpacity onPress={() => removeTrackField(index)}>
                      <Trash2 size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Track Title"
                  placeholderTextColor="#666666"
                  value={track.title}
                  onChangeText={(value) => updateTrack(index, 'title', value)}
                />

                <AudioPicker
                  currentAudioUri={track.audio_uri}
                  onAudioSelected={(uri) => {
                    const newTracks = [...tracks];
                    newTracks[index] = { ...newTracks[index], audio_uri: uri, audio_url: '' };
                    setTracks(newTracks);
                  }}
                  onAudioRemoved={() => {
                    const newTracks = [...tracks];
                    newTracks[index] = { ...newTracks[index], audio_uri: null };
                    setTracks(newTracks);
                  }}
                  trackTitle={track.title || `Track ${track.track_number}`}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Duration in seconds (optional)"
                  placeholderTextColor="#666666"
                  value={track.duration_seconds}
                  onChangeText={(value) => updateTrack(index, 'duration_seconds', value)}
                  keyboardType="numeric"
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addTrackButton} onPress={addTrackField}>
              <Plus size={16} color="#ea2745" />
              <Text style={styles.addTrackText}>Add Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
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
    backgroundColor: '#ea2745',
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
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tracksSection: {
    marginTop: 8,
  },
  tracksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  tracksSubtitle: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 16,
  },
  trackInput: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ea2745',
  },
  addTrackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ea2745',
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 8,
  },
  addTrackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ea2745',
  },
});
