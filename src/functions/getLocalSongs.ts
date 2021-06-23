import moment from "moment";

/* Import functions */
import getVideoId from "./getVideoId";

/**
 * Reads from local asset file and converts content to new metadata style.
 */
export default function getLocalSongs() {
  const songs = require("../assets/songs.json");

  return songs.map((song) => {
    return {
      date: moment(song.date, "M/DD/YYYY").format("DD.MM.YYYY"),
      url: getVideoId(song.url),
    };
  });
}
