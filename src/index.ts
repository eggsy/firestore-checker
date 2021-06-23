import Firebase from "./structures/firebase";
import Questions from "./structures/Questions";

const firebase = new Firebase();

firebase.on("songsFetched", async () => {
  const questions = new Questions(firebase);
  await questions.start();
});
