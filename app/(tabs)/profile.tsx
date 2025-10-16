import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { deleteImage } from '@/lib/storage';
import { Artist } from '@/types/database';
import { Plus, Edit, Trash2, User as UserIcon, Mic2 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  const isArtistAccount = userProfile?.account_type === 'artist';

  useFocusEffect(
    useCallback(() => {
      if (isArtistAccount && userProfile?.id) {
        loadArtists();
      } else {
        setLoading(false);
      }
    }, [userProfile, isArtistAccount])
  );

  async function loadArtists() {
    if (!userProfile?.id) return;

    setLoading(true);
    const { data } = await supabase
      .from('artists')
      .select('*')
      .eq('owner_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setArtists(data);
    }
    setLoading(false);
  }

  async function handleDeleteArtist(artistId: string, imageUrl: string | null) {
    Alert.alert(
      'Delete Artist',
      'Are you sure you want to delete this artist? All albums and tracks will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (imageUrl) {
              await deleteImage(imageUrl);
            }

            const { error } = await supabase.from('artists').delete().eq('id', artistId);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              loadArtists();
            }
          },
        },
      ]
    );
  }


  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/');
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileIcon}>
          {isArtistAccount ? (
            <Mic2 size={40} color="#ea2745" />
          ) : (
            <UserIcon size={40} color="#ea2745" />
          )}
        </View>
        <Text style={styles.displayName}>{userProfile?.display_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.accountTypeBadge}>
          <Text style={styles.accountTypeText}>
            {isArtistAccount ? 'Artist Account' : 'Listener Account'}
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {isArtistAccount && (
        <View style={styles.section}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Artists</Text>
              <Text style={styles.subtitle}>Manage your artist profiles</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/artist-form/create')}>
              <Plus size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ea2745" />
            </View>
          ) : artists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No artists yet</Text>
              <Text style={styles.emptySubtext}>Create your first artist profile to get started</Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => router.push('/artist-form/create')}>
                <Plus size={20} color="#FFF" />
                <Text style={styles.createFirstButtonText}>Create Artist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.artistsList}>
              {artists.map((artist) => (
                <View key={artist.id} style={styles.artistCard}>
                  <View style={styles.artistInfo}>
                    <Text style={styles.artistName}>{artist.name}</Text>
                    {artist.genre && <Text style={styles.artistGenre}>{artist.genre}</Text>}
                    {artist.bio && <Text style={styles.artistBio} numberOfLines={2}>{artist.bio}</Text>}
                    <TouchableOpacity
                      style={styles.viewAlbumsButton}
                      onPress={() => router.push(`/artist/${artist.id}`)}>
                      <Text style={styles.viewAlbumsText}>View Albums</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.artistActions}>
                    <TouchableOpacity
                      onPress={() => router.push(`/artist-form/${artist.id}`)}
                      style={styles.actionButton}>
                      <Edit size={20} color="#ea2745" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteArtist(artist.id, artist.image_url)}
                      style={styles.actionButton}>
                      <Trash2 size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ea274520',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
  },
  accountTypeBadge: {
    backgroundColor: '#ea274520',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ea2745',
    marginBottom: 16,
  },
  accountTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea2745',
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#ea2745',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ea2745',
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
    padding: 48,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  artistsList: {
    gap: 12,
  },
  artistCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  artistGenre: {
    fontSize: 14,
    color: '#ea2745',
    marginTop: 4,
  },
  artistBio: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  viewAlbumsButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ea2745',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewAlbumsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  artistActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
  },
});
