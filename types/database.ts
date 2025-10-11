export interface Artist {
  id: string;
  name: string;
  image_url: string;
  genre: string;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  duration: number;
  audio_url: string;
  cover_url: string;
  created_at: string;
}

export interface SongWithArtist extends Song {
  artist: Artist;
}
