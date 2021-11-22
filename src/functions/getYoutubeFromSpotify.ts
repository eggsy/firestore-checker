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

  // Create new Spotify API instance
  const spotifyApi = new SpotifyWebApi({
    clientId: config.key.spotify.clientId,
    clientSecret: config.key.spotify.clientSecret,
  });

  // Get access token
  await spotifyApi.clientCredentialsGrant().then(({ body }) => {
    spotifyApi.setAccessToken(body.access_token);
  });

  // Create new Spotify To YouTube instance
  const spotifyToYoutube = SpotifyToYoutube(spotifyApi);
  const trackId = new URL(url).pathname.split("/")[2];

  const id = await spotifyToYoutube(trackId);
  return id;
}
