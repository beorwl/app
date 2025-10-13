export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          account_type: 'user' | 'artist';
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          account_type: 'user' | 'artist';
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_type?: 'user' | 'artist';
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      artists: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          bio: string | null;
          image_url: string | null;
          genre: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          bio?: string | null;
          image_url?: string | null;
          genre?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          bio?: string | null;
          image_url?: string | null;
          genre?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      albums: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          release_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          release_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          release_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tracks: {
        Row: {
          id: string;
          album_id: string;
          title: string;
          track_number: number;
          duration_seconds: number | null;
          audio_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          title: string;
          track_number: number;
          duration_seconds?: number | null;
          audio_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          title?: string;
          track_number?: number;
          duration_seconds?: number | null;
          audio_url?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Artist = Database['public']['Tables']['artists']['Row'];
export type Album = Database['public']['Tables']['albums']['Row'];
export type Track = Database['public']['Tables']['tracks']['Row'];

export interface AlbumWithArtist extends Album {
  artist: Artist;
}

export interface TrackWithAlbum extends Track {
  album: AlbumWithArtist;
}
