import moment from "moment";
import EventEmitter from "events";

/* Import firebase */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

/* Import config */
import config from "../config";

/* Import functions */
import getLocalSongs from "../functions/getLocalSongs";
import getVideoId from "../functions/getVideoId";
import mergeDocs from "../functions/mergeDocs";

/* Import types */
import type { Song } from "../types/Song";

export default class Firebase extends EventEmitter {
  app = initializeApp(config.firebase.config);
  collection = collection(getFirestore(this.app), "dailySongs");

  /* State */
  private loggedIn = false;
  songs: Song[];

  constructor() {
    super();

    signInWithEmailAndPassword(
      getAuth(this.app),
      config.firebase.user.email,
      config.firebase.user.password
    ).then(async () => {
      // Set loggedIn state
      this.loggedIn = true;

      // Emit that it's successfully logged in
      this.emit("loggedIn");

      // Set state
      this.songs = mergeDocs(await this.getSongs(), getLocalSongs());

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

    const query = await getDocs(this.collection);
    const docs = query.docs;

    const songs: Song[] = [];

    for (let song of docs) {
      const { url, date } = song.data() as Song;
      if (!url || !date) continue;

      const fUrl = (await getVideoId(url)) || "[MISSING URL]";
      const fDate = moment(date.toDate()).utcOffset(3).format("DD.MM.YYYY");

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
  async addSong(data: Song) {
    if (this.loggedIn === false)
      throw new Error("Still logging in to Firebase.");

    /*
      This basically turns manipulates given date and sets
      hours to 9, minutes to 0 because that's when it's midnight
      in Turkey's timezone (UTC+3 so `9 + 3 = 12`).

      You can change this if you're on a different timezone, or want
      want to display in different timezone.
    */
    const date = moment(data.date as Date);
    const turkeyTimeInUtc = moment(date, "DD.MM.YYYY")
      .utc()
      .set({
        hour: 9,
        minutes: 0,
      })
      .toDate();

    addDoc(this.collection, { ...data, date: turkeyTimeInUtc });

    this.songs.push({
      date: date.format("DD.MM.YYYY"),
      url: data.url,
    });
  }
}
