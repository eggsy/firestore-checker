import axios from "axios";
import config from "../config";

/* Import functions */
import getKsoftInfo from "./getKsoft";

/* Import types */
import type { Metadata } from "../types/Song";
import type { YoutubeResponse } from "../types/Response/Youtube";

/**
 * Get video metadata such as title, artist and thumbnail from YouTube.
 * @param videoId string
 */
export default async function getMetadata(videoId: string): Promise<Metadata> {
  const { items } =
    ((
      await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=${videoId}&key=${config.key.youtube}`
      )
    ).data as YoutubeResponse) || {};

  if (!items[0])
    throw new Error("No results found on YouTube related to that ID.");

  const { title, channelTitle, thumbnails } = items[0]?.snippet;

  const metadata: Metadata = {
    title,
    artist: channelTitle?.replace(" - Topic", ""),
    thumbnail: thumbnails?.default?.url || "http://via.placeholder.com/75",
    lyrics: [],
  };

  const ksoft = await getKsoftInfo(metadata.title, metadata.artist);

  metadata.lyrics = ksoft.lyrics;
  metadata.spotifyUrl = ksoft.spotifyUrl;

  return metadata;
}
