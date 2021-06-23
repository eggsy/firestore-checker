import firebase from "firebase";
import config from "../config";
import moment from "moment";
import EventEmitter from "events";

/* Import functions */
import getLocalSongs from "../functions/getLocalSongs";
import getVideoId from "../functions/getVideoId";
import mergeDocs from "../functions/mergeDocs";

/* Import types */
import type { Song } from "../types/Song";

export default class Firebase extends EventEmitter {
  app = firebase.initializeApp(config.firebase.config);
  firestore = this.app.firestore();

  /* State */
  private loggedIn = false;
  songs: Song[];

  constructor() {
    super();

    this.app
      .auth()
      .signInWithEmailAndPassword(
        config.firebase.user.email,
        config.firebase.user.password
      )
      .then(async () => {
        // Set loggedIn state
        this.loggedIn = true;

        // Emit that it's successfully logged in
        this.emit("loggedIn");

        // Set state
        this.songs = mergeDocs(await this.getSongs(), getLocalSongs())

        // Emit that songs are fetched
        this.emit("songsFetched");
      });
  }

  /**
   * Reads from Firestore collection and returns a nice array of songs.
   * @returns Promise<Song[]>
   */
  async getSongs(): Promise<Song[]> {
    if (this.loggedIn === false)
      throw new Error("Still logging in to Firebase.");

    const query = await this.firestore.collection("dailySongs").get();
    const docs = query.docs;

    const songs: Song[] = [];

    for (let song of docs) {
      const { url, date } = song.data() as Song;
      if (!url || !date) continue;

      const fUrl = getVideoId(url) || "[MISSING URL]";
      const fDate = moment(date.toDate()).format("DD.MM.YYYY");

      songs.push({
        url: fUrl,
        date: fDate,
      });
    }

    return songs;
  }

  /**
   * Adds new record to the collection in Firestore.
   */
  async addSong(data: Song, date: Date) {
    if (this.loggedIn === false)
      throw new Error("Still logging in to Firebase.");

    const isDateNotEmpty = !!this.songs.find(
      (song) => song.date === moment(date, "DD.MM.YYYY")
    );

    if (isDateNotEmpty !== false)
      throw new Error("There's already a song for that date.");

    this.songs.push({
      date,
      url: data.url,
    });

    this.firestore.collection("dailySongs").add(data);
  }
}
