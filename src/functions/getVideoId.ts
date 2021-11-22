/* Import functions */
import getYoutubeFromSpotify from "./getYoutubeFromSpotify";
import isUrl from "./isUrl";

/**
 * Get YouTube video ID from passed parameter.
 * @param url string
 */
export default async function getVideoId(url: string): Promise<string> {
  const isParamUrl = isUrl(url);

  if (isParamUrl === true) {
    const newUrl = new URL(url);

    if (newUrl.hostname === "open.spotify.com")
      return await getYoutubeFromSpotify(url);
    else if (["youtube.com", "music.youtube.com"].includes(newUrl.hostname))
      return newUrl.searchParams.get("v");
    else if (newUrl.hostname === "youtu.be")
      return newUrl.pathname.replace(/\//g, "");
  } else return url;
}
