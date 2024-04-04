import * as env from "./env";
import RedisStore from "connect-redis";
import session from "express-session";
import { Redis } from "ioredis";

const redisClient = new Redis({
  host: env.REDIS_HOST,
  password: env.REDIS_PASSWORD,
});
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "comkaraka:",
});
const sessionOption: session.SessionOptions = {
  store: redisStore,
  secret: env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: env.SESSION_AGE,
  },
};

export const session_obj = session(sessionOption);
