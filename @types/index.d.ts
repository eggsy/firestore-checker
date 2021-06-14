interface Metadata {
  title: string;
  artist: string;
  thumbnail: string;
  lyrics: string[];
  spotifyUrl?: string;
}

interface FirestoreData {
  date: Date;
  url: string;
  metadata: Metadata;
  spotifyUrl?: string;
}
