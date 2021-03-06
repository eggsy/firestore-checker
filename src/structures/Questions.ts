import prompts from "prompts";
import moment from "moment";
import nextDay from "get-next-date";

/* Import functions */
import getVideoId from "../functions/getVideoId";
import getMetadata from "../functions/getMetadata";
import getTurkeyTime from "../functions/getTurkeyTime";
import { success, warn } from "../functions/logger";

/* Import classes */
import Firebase from "./firebase";

/* Import types */
import type { Metadata, Song } from "../types/Song";

export default class Questions {
  songs: Song[];
  firebase: Firebase;

  constructor(firebase: Firebase) {
    this.songs = firebase.songs;
    this.firebase = firebase;
  }

  async start() {
    /* First */
    const { url } = await prompts({
      type: "text",
      name: "url",
      message: "Enter the URL or the ID of the YouTube video to check",
    });

    if (!url) return this.askAndContinue();

    const songId = await getVideoId(url);
    const isSongAddedBefore = this.songs.find(
      (musiki) => musiki.url === songId
    );

    if (!!isSongAddedBefore !== false) {
      warn(`This song was added before on ${isSongAddedBefore.date}`);
      return this.askAndContinue();
    }

    /* Second */
    const { addToList } = await prompts({
      type: "confirm",
      name: "addToList",
      message: "This song was never added before, would you like to add it?",
      initial: true,
    });

    if (addToList === false) return this.askAndContinue();

    /* Third */
    const lastSong = this.songs.slice(-1)[0];
    const isTodayLaterThanLastSong =
      moment(lastSong.date, "DD.MM.YYYY").toDate().getTime() <
      getTurkeyTime().getTime();

    const oneDayLater = moment(
      nextDay(
        isTodayLaterThanLastSong
          ? getTurkeyTime()
          : moment(lastSong.date, "DD.MM.YYYY").toDate()
      )
    ).format("DD.MM.YYYY");

    const { newSongDate } = await prompts({
      type: "text",
      name: "newSongDate",
      message: "Enter the date that you want this song to be on",
      initial: oneDayLater,
    });

    const isDateOccupied = this.songs.find(
      (musiki) => musiki.date === newSongDate
    );

    if (!!isDateOccupied === true) {
      warn("There's already a song selected for this date.");
      return this.askAndContinue();
    }

    const { spotifyUrl, ...metadata }: Metadata = await getMetadata(songId);

    const song: Song = {
      date: newSongDate,
      url: songId,
      metadata,
      spotifyUrl,
    };

    if (addToList === true) {
      this.firebase.addSong(song);
      success(`Successfully added that song to be played on ${newSongDate}`);

      return this.askAndContinue();
    }
  }

  /**
   * Ask and start the questions again.
   */
  private async askAndContinue() {
    const { isContinue } = await prompts({
      type: "confirm",
      name: "isContinue",
      message: "Do you want to continue?",
      initial: true,
    });

    if (isContinue === true) this.start();
    else process.exit();
  }
}
