import * as elastic from "@elastic/elasticsearch";
import * as env from "./env";

export const elasticCli = new elastic.Client({
  node: env.ELASTIC_HOST,
  auth: {
    username: env.ELASTIC_USERNAME,
    password: env.ELASTIC_PASSWORD,
  },
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true,
});
