/**
 * Reads from local asset file and converts content to new metadata style.
 */
export default function getLocalSongs() {
  const songs = require("../assets/songs.json");
  return songs;
}
