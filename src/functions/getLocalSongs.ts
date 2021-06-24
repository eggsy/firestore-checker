/**
 * Reads from local asset file and converts content to new metadata style.
 */
export default function getLocalSongs() {
  const songs = require("../assets/oldSongs.json");
  return songs;
}
