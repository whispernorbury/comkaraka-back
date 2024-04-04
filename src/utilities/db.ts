import mysql from "mysql2/promise";
import * as env from "../config/env";

const AdminPool: mysql.Pool = mysql.createPool({
  host: env.MYSQL_HOST,
  user: env.MYSQL_USERNAME,
  port: env.MYSQL_PORT,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  queueLimit: 100,
  waitForConnections: true,
  connectionLimit: 100,
});

export { AdminPool };
