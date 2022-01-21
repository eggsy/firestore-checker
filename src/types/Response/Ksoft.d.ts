export interface KsoftResponse {
  total: number;
  took: number;
  data: Datum[];
}

interface Datum {
  artist: string;
  artist_id: number;
  album: string;
  album_ids: string;
  album_year: string;
  name: string;
  lyrics: string;
  search_str: string;
  album_art: string;
  popularity: number;
  singalong: Singalong[];
  meta: Meta;
  id: string;
  search_score: number;
  url: string;
}

interface Meta {
  other: Other;
  deezer: DeezerOrSpotify;
  spotify: DeezerOrSpotify;
}

interface DeezerOrSpotify {
  album: string;
  track: string;
  artists: string[];
}

interface Other {
  bpm: number;
  gain: number;
  musicbrainz: Musicbrainz;
}

interface Musicbrainz {
  artist?: any;
}

interface Singalong {
  line: string;
  duration: string;
  milliseconds: string;
  lrc_timestamp: string;
}
