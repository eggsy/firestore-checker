import axios from "axios";
import config from "../config";

/* Interfaces */
interface Ksoft {
  lyrics: string[];
  spotifyUrl: string;
}

/* Import types */
import type { KsoftResponse } from "../types/Response/Ksoft";

/**
 * Get lyrics and Spotify URL from KSoft API with given title and artist.
 */
export default async function getKsoftInfo(
  title: string,
  artist: string
): Promise<Ksoft> {
  let searchValue = title;
  if (artist) searchValue = `${title} ${artist.replace(" - Topic", "")}`;

  const apiUri = `https://api.ksoft.si/lyrics/search?q=${encodeURI(
    searchValue
  )}&limit=1`;

  const { data: ksoft } = (
    await axios.get(apiUri, {
      headers: { Authorization: `Bearer ${config.key.ksoft}` },
    })
  ).data as KsoftResponse;

  if (!ksoft || ksoft?.length === 0) return { lyrics: [], spotifyUrl: null };
  else
    return {
      lyrics: ksoft[0]?.lyrics?.split("\n") || [],
      spotifyUrl: ksoft[0]?.meta?.spotify?.track,
    };
}
