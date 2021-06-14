import consola from "consola";
import firebase from "firebase";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import moment from "moment";
import axios from "axios";
import prompts from "prompts";
import nextDay from "get-next-date";

loadEnv({ path: resolve("../.env") });

const firebaseConfig = {
  appId: process.env.FIREBASE_APP_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DB_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDER_ID,
};

class firestoreChecker {
  app = firebase.initializeApp(firebaseConfig);
  firestore = this.app.firestore();

  constructor() {
    this.app
      .auth()
      .signInWithEmailAndPassword(
        process.env.FIREBASE_USER,
        process.env.FIREBASE_PASSWORD
      )
      .then(() => {
        this.run();
      });
  }

  async run() {
    const songs = await this.getDocs();
    this.startQuestions(songs);
  }

  async getDocs() {
    const query = await this.firestore.collection("dailySongs").get(),
      docs = query.docs,
      songs = [];

    const localSongs = require(resolve("../assets/songs.json")).map((song) => {
      return {
        date: moment(song.date, "M/DD/YYYY").format("DD.MM.YYYY"),
        url: this.getVideoID(song.url),
      };
    });

    for (let doc of docs) {
      const data = doc.data();

      const url = this.getVideoID(data?.url) || "[MISSING URL]";
      const date = moment(data?.date?.toDate()).format("DD.MM.YYYY");

      songs.push({
        date,
        url,
      });
    }

    const mergedSongs = [...localSongs, ...songs].sort((a, b) => {
      var dateA: any = moment(a.date, "DD.MM.YYYY"),
        dateB: any = moment(b.date, "DD.MM.YYYY");

      return dateA - dateB;
    });

    return mergedSongs;
  }

  async startQuestions(songs) {
    const latestSong = songs[songs.length - 1].date;

    const { url } = await prompts({
        type: "text",
        name: "url",
        message:
          "Kontrol etmek istediğiniz şarkının bağlantısını veya ID'sini girin",
      }),
      songId = this.getVideoID(url) || url,
      found = songs.find((song) => song.url === songId);

    if (found) {
      consola.warn(
        `Bu şarkı daha önce ${found.date} tarihinde sisteme eklenmiş.`
      );

      this.startQuestions(songs);
    } else {
      const { addToList } = await prompts({
        type: "confirm",
        name: "addToList",
        message:
          "ℹ Bu şarkı önceki tarihlerin hiçbirinde sisteme eklenmemiş, hemen eklemek ister misiniz?",
        initial: true,
      });

      if (addToList) {
        const oneDayLater = nextDay(moment(latestSong, "DD.MM.YYYY").toDate());
        const formattedNextDay = moment(oneDayLater).format("DD.MM.YYYY");

        const { newSongDate } = await prompts({
          type: "text",
          name: "newSongDate",
          message: `Şarkıyı eklemek istediğiniz tarihi girin (${formattedNextDay})`,
          initial: formattedNextDay,
        });

        const found = songs.find((song) => song.date === newSongDate);

        if (found) {
          consola.warn(
            `Bu tarih (${newSongDate}) için daha önce zaten bir müzik eklenmiş.\nhttps://youtube.com/watch?v=${found.url} `
          );
        } else {
          const metadata = await this.getMetadata(songId);
          const { spotifyUrl, ...rest } = metadata;

          const object: FirestoreData = {
            date: moment(newSongDate, "DD.MM.YYYY").toDate(),
            url: songId,
            metadata: rest,
          };

          if (spotifyUrl) object.spotifyUrl = spotifyUrl;
          await this.firestore.collection("dailySongs").add(object);

          songs.push({
            date: newSongDate,
            song: songId,
          });

          consola.success(
            `Belirttiğiniz şarkı ${newSongDate} tarihinden çalmak üzere sisteme eklendi.`
          );

          const { isContinue } = await prompts({
            type: "confirm",
            name: "isContinue",
            message: "Devam etmek ister misiniz?",
            initial: true,
          });

          if (isContinue) this.startQuestions(songs);
          else process.exit();
        }
      } else {
        const { isContinue } = await prompts({
          type: "confirm",
          name: "isContinue",
          message: "Devam etmek ister misiniz?",
          initial: true,
        });

        if (isContinue) this.startQuestions(songs);
        else process.exit();
      }
    }
  }

  getVideoID(url: string): string | null {
    if (!url) return null;
    else if (url.includes("youtube.com/watch"))
      return new URLSearchParams(new URL(url).search).get("v");
    else if (url.includes("youtu.be/"))
      return url.split("/")[url.split("/").length - 1];
    else return url;
  }

  async getMetadata(videoId: string): Promise<Metadata> {
    const snippet =
      (
        await axios.get(
          `https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
        )
      )?.data?.items?.[0]?.snippet || {};

    const object: Metadata = {
      title: snippet?.title,
      artist: snippet?.channelTitle?.replace(" - Topic", ""),
      thumbnail:
        snippet?.thumbnails?.default?.url || "http://via.placeholder.com/75",
      lyrics: [],
    };

    const ksoft = await this.getKsoftInfo(object.title, object.artist);

    object.lyrics = ksoft.lyrics;
    object.spotifyUrl = ksoft.spotifyUrl;

    return object;
  }

  async getKsoftInfo(
    title: string,
    artist: string
  ): Promise<{ lyrics: string[]; spotifyUrl: string }> {
    title = title;
    artist = artist?.replace(" - Topic", "");
    if (artist) title = `${title} ${artist}`;

    const apiUri = `https://api.ksoft.si/lyrics/search?q=${encodeURI(
      title
    )}&limit=1`;

    try {
      const response = await axios.get(apiUri, {
        headers: { Authorization: `Bearer ${process.env.KSOFT_API_KEY}` },
      });

      const data = response.data?.data;

      if (
        !data ||
        response.status !== 200 ||
        response.data?.data?.error ||
        response.data?.data?.length === 0
      )
        return { lyrics: [], spotifyUrl: null };
      else
        return {
          lyrics: data?.[0]?.lyrics?.split("\n") || [],
          spotifyUrl: data?.[0]?.meta?.spotify?.track,
        };
    } catch (err) {
      return { lyrics: [], spotifyUrl: null };
    }
  }
}

new firestoreChecker();
