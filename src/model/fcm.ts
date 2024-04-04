import mysql, { RowDataPacket } from "mysql2/promise";
import { AdminPool } from "../utilities/db";
import { firebaseConfig } from "../config/fcm";

firebaseConfig();

class FCMToken {

  static getTokens = async (
    userID: string
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getQuery: string = `SELECT value FROM fcmtokens WHERE user_id = ?`;
        const [tokens] = await connect.query<RowDataPacket[]>(getQuery, [ userID ]);
        return tokens;
      } catch (err) {
        throw err;
      } finally {
        if (connect) connect.release();
      }
    } catch (err) {
      throw err;
    }
  };

  static existToken = async (
    fcmToken: string
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getQuery: string = `SELECT value FROM fcmtokens WHERE value = ?`;
        const [token] = await connect.query<RowDataPacket[]>(getQuery, [fcmToken]);
        return token.length > 0;
      } catch (err) {
        throw err;
      } finally {
        if (connect) connect.release();
      }
    } catch (err) {
      throw err;
    }
  };

  static add = async (
    userID: string,
    fcmToken: string,
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const addQuery: string = `INSERT INTO fcmtokens (value, user_id) VALUES (?, ?)`;
        await connect.query(addQuery, [fcmToken, userID]);
      } catch (err) {
        throw err;
      } finally {
        if (connect) connect.release();
      }
    } catch (err) {
      throw err;
    }
  };
}

export = FCMToken;
