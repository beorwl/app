import { supabase } from './supabase';
import { Platform } from 'react-native';

export async function uploadImageFromUri(uri: string, folder: 'artists' | 'albums'): Promise<{ url: string | null; error: Error | null }> {
  try {
    let blob: Blob;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      blob = await response.blob();
    } else {
      const response = await fetch(uri);
      blob = await response.blob();
    }

    const fileExt = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExt}`,
      });

    if (error) {
      return { url: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

export async function deleteImage(url: string): Promise<{ error: Error | null }> {
  try {
    if (!url) return { error: null };

    const path = url.split('/images/').pop();

    if (!path) {
      return { error: new Error('Invalid image URL') };
    }

    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

export function getImageUrl(path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return publicUrl;
}

export async function uploadAudioFromUri(uri: string): Promise<{ url: string | null; error: Error | null }> {
  try {
    let blob: Blob;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      blob = await response.blob();
    } else {
      const response = await fetch(uri);
      blob = await response.blob();
    }

    const fileExt = uri.split('.').pop()?.split('?')[0] || 'mp3';
    const fileName = `tracks/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: `audio/${fileExt}`,
      });

    if (error) {
      return { url: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(data.path);

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

export async function deleteAudio(url: string): Promise<{ error: Error | null }> {
  try {
    if (!url) return { error: null };

    const path = url.split('/audio/').pop();

    if (!path) {
      return { error: new Error('Invalid audio URL') };
    }

    const { error } = await supabase.storage
      .from('audio')
      .remove([path]);

    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}
