import { resolve } from "path";
import { config } from "dotenv";

config({
  path:
    process.env.NODE_ENV === "development"
      ? resolve("./.env")
      : resolve("../.env"),
});

export default {
  firebase: {
    config: {
      appId: process.env.FIREBASE_APP_ID,
      apiKey: process.env.FIREBASE_API_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
    },
    user: {
      email: process.env.FIREBASE_USER,
      password: process.env.FIREBASE_PASSWORD,
    },
  },
  key: {
    youtube: process.env.YOUTUBE_API_KEY,
    ksoft: process.env.KSOFT_API_KEY,
  },
};
