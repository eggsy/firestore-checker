export interface Song {
  date: any; // Firestore Date is not an actual Date!
  url: string;
  spotifyUrl?: string;
  metadata?: Metadata;
}

export interface Metadata {
  artist: string;
  lyrics: string[];
  thumbnail: string;
  title: string;
  spotifyUrl?: string;
}
