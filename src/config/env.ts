export const HOST = String(process.env.HOST);
export const PORT = Number(process.env.PORT);
export const MYSQL_HOST = String(process.env.MYSQL_HOST);
export const MYSQL_PORT = Number(process.env.MYSQL_PORT);
export const MYSQL_DATABASE = String(process.env.MYSQL_DATABASE);
export const MYSQL_USERNAME = String(process.env.MYSQL_USERNAME);
export const MYSQL_PASSWORD = String(process.env.MYSQL_PASSWORD);
export const ELASTIC_HOST = String(process.env.ELASTIC_HOST);
export const ELASTIC_USERNAME = String(process.env.ELASTIC_USERNAME);
export const ELASTIC_PASSWORD = String(process.env.ELASTIC_PASSWORD);
export const REDIS_HOST = String(process.env.REDIS_HOST);
export const REDIS_PASSWORD = String(process.env.REDIS_PASSWORD);
export const SALTING_NUM = Number(process.env.SALTING_NUM);
export const SESSION_AGE = Number(process.env.SESSION_AGE) * 1000 * 60; // env: minutes -> vari: millisec
export const SESSION_KEY = String(process.env.SESSION_KEY);
export const SEPARATOR = String(process.env.SEPARATOR);
export const CONTENT_MAX_LENGTH = Number(process.env.CONTENT_MAX_LENGTH);

export const checkEnvs = () => {
  const envs = [
    "HOST",
    "PORT",
    "MYSQL_HOST",
    "MYSQL_PORT",
    "MYSQL_DATABASE",
    "MYSQL_USERNAME",
    "MYSQL_PASSWORD",
    "ELASTIC_HOST",
    "ELASTIC_USERNAME",
    "ELASTIC_PASSWORD",
    "REDIS_HOST",
    "REDIS_PASSWORD",
    "SALTING_NUM",
    "SESSION_AGE",
    "SESSION_KEY",
    "SEPARATOR",
    "CONTENT_MAX_LENGTH",
  ];
  console.log(`Checking ${envs.length} envs...`);
  const nulls: string[] = [];
  envs.map((k) => {
    console.log(`${k}: ${process.env[k]} `);
    if (!process.env[k]) {
      nulls.push(k);
    }
  });
  if (nulls.length !== 0) {
    nulls.map((i) => {
      console.log(`#### ${i} undefined... ####`);
    });
    return false;
  }
  return true;
};
