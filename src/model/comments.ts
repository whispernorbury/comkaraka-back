import mysql, { RowDataPacket } from "mysql2/promise";
import { AdminPool } from "../utilities/db";

class Comments {
  userID?: string;
  articleID?: string;
  content?: string;
  commentID?: number;

  static getUser = async (
    commentID: number
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getQuery: string = `SELECT user_id FROM comments WHERE comment_id = ?`;
        const [author] = await connect.query<RowDataPacket[]>(getQuery, [ commentID ]);
        return author[0].user_id;
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
    if (this.articleID === undefined) throw new Error('articleID missing');
    if (this.userID === undefined) throw new Error('userID missing');
    if (this.content === undefined) throw new Error('content missing');

    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        // Post
        const makeCommentQuery: string = `INSERT INTO comments (article_id, user_id, content, is_removed) VALUES (?, ?, ?, 0)`;
        await connect.query(makeCommentQuery, [ this.articleID, this.userID, this.content ]);
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  }

  remove = async () => {
    // Check properties
    if (this.userID === undefined) throw new Error('userID missing');
    if (this.commentID === undefined) throw new Error('commentID missing');

    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getCommentQuery: string = `SELECT user_id, is_removed FROM comments WHERE comment_id = ?`;
        const [comment] = await connect.query<RowDataPacket[]>(getCommentQuery, [this.commentID]);

        // Check comment status, Check Owner
        if (comment.length === 0 || comment[0].is_removed === 1) throw new Error("Comment doesn't exist");
        if (this.userID != comment[0].user_id) throw new Error("You are not writer");

        // Remove
        const delCommentQuery: string = `UPDATE comments SET is_removed = 1 WHERE comment_id = ?`;
        await connect.query(delCommentQuery, [this.commentID]);
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

export = Comments;
