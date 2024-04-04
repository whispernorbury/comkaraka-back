import express, { Request, Response, Express } from "express";
import bodyParser from "body-parser";
import * as env from "./config/env";
import { session_obj } from "./config/session";
import router from "./api/router";

if (!env.checkEnvs()) process.exit(1);
const app: Express = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session_obj);

// routers
app.use("/", router);
app.get("/healthcheck", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.listen(env.PORT, () => {
  console.log(`Server Listening at http://${env.HOST}:${env.PORT}\n`);
});
