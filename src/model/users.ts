import mysql, { RowDataPacket } from "mysql2/promise";
import { AdminPool } from "../utilities/db";
import * as Encryption from "../utilities/encryption";
import * as env from "../config/env";
import FCMToken from "./fcm";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/typesWithBodyKey";
import { elasticCli } from "../config/elastic";

class Users {
  userID?: string;
  userName?: string;
  userAddInfo?: string[];
  userTEL?: string;
  userIMG?: string;
  userEmail?: string;

  static signIn = async (
    userID: string,
    userPW: string,
    fcmToken: string
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getPasswdQuery: string = `SELECT user_pw, is_admin FROM users WHERE user_id = ? AND is_alive = 1`;
        const [found] = await connect.query<RowDataPacket[]>(getPasswdQuery, [userID]);

        // Check Validity
        if (found.length === 0) throw new Error("ID doesn't exist");
        const isMatch: boolean = await Encryption.compareEncrypt( userPW, found[0].user_pw );
        if (!isMatch) throw new Error("Wrong Password");

        // Add Device FCM token
        if (!(await FCMToken.existToken(fcmToken))) {
          await FCMToken.add(userID, fcmToken);
        }

        return {
          isAdmin: found[0].is_admin
        }
      } catch (e) {
        throw e;
      } finally {
        if (connect) { connect.release(); }
      }
    } catch (e) {
      throw e;
    }
  };

  static signUp = async (
    userID: string,
    userPW: string,
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        // Check Existence
        const [isExist] = await connect.query<RowDataPacket[]>(`SELECT user_id, is_alive FROM users WHERE user_id = ?`, [userID]);
        const hashedPW: string = await Encryption.encrypt(userPW);
        if (isExist.length) {
          if (isExist[0].is_alive) throw new Error(`Already Signed up: ${userID}`);

          // Awake frozen user
          else {
            const awakeQuery: string = `UPDATE users SET user_pw = ?, is_alive = ? WHERE user_id = ?`;
            await connect.query<RowDataPacket[]>(awakeQuery, [hashedPW, 1, userID]);
          }
        }
        else {
          // Sign up
          const signUpQuery: string = `INSERT INTO users (user_id, user_pw, user_name, user_addi_info, user_tel, user_email, user_img, is_admin, is_alive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          await connect.query(signUpQuery, [userID, hashedPW, "", "", "", "", "", 0, 1]);
        }
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };

  editInfo = async () => {
    // Check properties
    if (this.userID === undefined) throw new Error("userID missing");
    if (this.userName === undefined) throw new Error("userName missing");
    if (this.userEmail === undefined) throw new Error("userEmail missing");
    if (this.userAddInfo === undefined) throw new Error("userAddInfo missing");
    if (this.userIMG === undefined) throw new Error("userIMG missing");
    if (this.userTEL === undefined) throw new Error("userTEL missing")

    try {
      const connect = await AdminPool.getConnection();
      try {
        const addInfoArr = this.userAddInfo.join(` ${env.SEPARATOR} `);
        const infoEditQuery: string = `UPDATE users SET user_name = ?, user_addi_info = ?, user_tel = ?, user_email = ?, user_img = ? WHERE user_id = ?`;
        const infoEditArray = [ this.userName, addInfoArr, this.userTEL, this.userEmail, this.userIMG, this.userID ];
        await connect.query<RowDataPacket[]>(infoEditQuery, infoEditArray);
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };

  static changePW = async (
    userID: string,
    newPW: string
  ) => {
    try {
      const connect = await AdminPool.getConnection();
      try {
        const hashedPW: string = await Encryption.encrypt(newPW);
        const changePWQuery: string = `UPDATE users SET user_pw = ? WHERE user_id = ?`;
        await connect.query<RowDataPacket[]>(changePWQuery, [hashedPW, userID]);
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };

  static delAccount = async (
    userID: string,
    userPW: string,
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getQuery: string = `SELECT user_pw FROM users WHERE user_id = ?`;
        const [found] = await connect.query<RowDataPacket[]>(getQuery, [userID]);

        // Check ID, then Check Passwd
        if (found.length === 0) throw new Error("ID doesn't exist");
        const isMatch: boolean = await Encryption.compareEncrypt( userPW, found[0].user_pw);
        if (!isMatch) throw new Error("Wrong Password");

        // Delete Account
        const deleteQuery: string = `UPDATE users SET is_alive = 0, user_name = ? WHERE user_id = ?`;
        await connect.query(deleteQuery, ['Deleted Account', userID]);
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };

  static getFromID = async (userID: string) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getQuery: string = `SELECT user_id, user_name, user_addi_info, user_tel, user_email, user_img FROM users WHERE user_id = ? AND is_alive = 1`;
        const [found] = await connect.query<RowDataPacket[]>(getQuery, [userID]);
        
        // Check ID validity
        if (found.length === 0) throw new Error(`ID doesn't exist`);

        return {
          user_id: found[0].user_id,
          user_name: found[0].user_name,
          user_addi_info: found[0].user_addi_info.split(` ${env.SEPARATOR} `),
          user_tel: found[0].user_tel,
          user_email: found[0].user_email,
          user_img: found[0].user_img,
        };
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };

  static getList = async (
    userID: string,
    text: string,
    startIdx: number,
    numberToGet: number,
  ) => {
    // Check query validity
    if (isNaN(Number(userID)) || (userID.length != 2 && userID != "")) throw new Error("Invalid ID for query. userID must be 'NN'");
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        // Filtering
        const idFilter = userID == "" ? "" : Number(userID) >= 83 || Number(userID) <= 6 ? userID : "20" + userID;
        let users: RowDataPacket[] = [];
        if (text == "" && userID == "") {
          // just SQL (search nothing)
          const GetQuery: string = `SELECT user_id, user_name, user_tel, user_img, user_email FROM users WHERE is_alive = 1 ORDER BY user_name ASC LIMIT ?, ?`;
          [users] = await connect.query<RowDataPacket[]>(GetQuery, [startIdx, numberToGet]);
        } else {
          // Elastic Search (keyword search)
          const elaQuery: QueryDslQueryContainer = {
            bool: {
              must: {
                multi_match: {
                  query: text,
                  type: "most_fields",
                  fields: ["user_name", "user_addi_info"],
                  operator: "OR",
                }
              },
              filter: {
                prefix: { user_id: idFilter },
              }
            }
          }
          if (text == "") delete elaQuery.bool?.must;
          const search = (await elasticCli.search({
            index: "users",
            query: elaQuery,
          })).hits.hits;
          if (search.length != 0) {
            const userArr = search.map((obj) => obj._id);
            const GetQuery: string = `SELECT user_id, user_name, user_tel, user_img, user_email FROM users WHERE is_alive = 1 AND user_id IN (?) ORDER BY user_name ASC LIMIT ?, ?`;
            [users] = await connect.query<RowDataPacket[]>(GetQuery, [userArr, startIdx, numberToGet]);
          }
        }
        return users;
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };
}

export = Users;
