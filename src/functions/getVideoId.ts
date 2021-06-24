/**
 * Get YouTube video ID from passed parameter.
 * @param url string
 */
export default function getVideoId(url: string): string {
  if (url.includes("youtube.com/watch"))
    return new URLSearchParams(new URL(url).search).get("v");
  else if (url.includes("youtu.be/"))
    return url
      .split("/")
      .filter((item) => item)
      .slice(-1)
      .join("");
  else return url;
}
