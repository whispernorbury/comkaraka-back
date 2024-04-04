import mysql, { RowDataPacket } from "mysql2/promise";
import { AdminPool } from "../utilities/db";

class Replies {
  userID?: string;
  commentID?: string;
  content?: string;
  replyID?: number;

  static getUser = async (
    replyID: number,
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getQuery: string = `SELECT user_id FROM replies WHERE reply_id = ?`;
        const [replies] = await connect.query<RowDataPacket[]>(getQuery, [ replyID ]);
        return replies[0].user_id;
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  }

  post = async () => {
    // Check properties
    if (this.userID === undefined) throw new Error("userID missing");
    if (this.commentID === undefined) throw new Error("commentID missing");
    if (this.content === undefined) throw new Error("content missing");

    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        // Post
        const makeReplyQuery: string = `INSERT INTO replies (comment_id, user_id, content, is_removed) VALUES (?, ?, ?, 0)`;
        await connect.query(makeReplyQuery, [ this.commentID, this.userID, this.content ]);
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };

  remove = async () => {
    // Check properties
    if (this.userID === undefined) throw new Error("userID missing");
    if (this.replyID === undefined) throw new Error("replyID missing");

    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getReplyQuery: string = `SELECT user_id, is_removed FROM replies WHERE reply_id = ?`;
        const [reply] = await connect.query<RowDataPacket[]>(getReplyQuery, [this.replyID]);

        // Check reply status, Check owner
        if (reply.length === 0 || reply[0].is_removed === 1) throw new Error("Reply doesn't exist");
        if (this.userID != reply[0].user_id) throw new Error("You are not writer");

        // Remove
        const delReplyQuery: string = `UPDATE replies SET is_removed = 1 WHERE reply_id = ?`;
        await connect.query(delReplyQuery, [this.replyID]);
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  }
}

export = Replies;
