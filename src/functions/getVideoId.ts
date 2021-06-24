/* Import functions */
import isUrl from "./isUrl";

/**
 * Get YouTube video ID from passed parameter.
 * @param url string
 */
export default function getVideoId(url: string): string {
  const isParamUrl = isUrl(url);

  if (isParamUrl === true) {
    const newUrl = new URL(url);

    if (["youtube.com", "music.youtube.com"].includes(newUrl.hostname))
      return newUrl.searchParams.get("v");
    else if (newUrl.hostname === "youtu.be")
      return newUrl.pathname.replace(/\//g, "");
  } else return url;
}
