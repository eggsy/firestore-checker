export default function getVideoId(url: string): string {
  if (url.includes("youtube.com/watch"))
    return new URLSearchParams(new URL(url).search).get("v");
  else if (url.includes("youtu.be/"))
    return url.split("/")[url.split("/").length - 1];
  else return url;
}
