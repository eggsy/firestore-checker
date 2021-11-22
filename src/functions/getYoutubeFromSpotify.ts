/* Import Spotify packages */
import SpotifyToYoutube from "spotify-to-youtube";
import SpotifyWebApi from "spotify-web-api-node";

/* Import config */
import config from "../config";

/* Import functions */
import isUrl from "./isUrl";

/**
 * Spotify API wrapper to convert Spotify URL to YouTube
 */
export default async function getYoutubeFromSpotify(url: string) {
  const isActualUrl = isUrl(url);

  if (isActualUrl === false)
    throw new Error("Please insert an actual Spotify URL.");

  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(config.key.spotify);

  const spotifyToYoutube = SpotifyToYoutube(spotifyApi);
  const trackId = new URL(url).pathname.split("/")[2];

  const id = await spotifyToYoutube(trackId);
  return id;
}
