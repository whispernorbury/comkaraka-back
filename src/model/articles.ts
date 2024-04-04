import mysql, { RowDataPacket } from "mysql2/promise";
import { AdminPool } from "../utilities/db";
import { CONTENT_MAX_LENGTH } from "../config/env";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/typesWithBodyKey";
import { elasticCli } from "../config/elastic";

class Articles {
  articleID?: number;
  userID?: string;
  title?: string;
  category?: string;
  catevalue?: string;
  content?: string;

  static getUser = async (
    articleID: string
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const getQuery: string = `SELECT user_id FROM articles WHERE article_id = ?`;
        const [author] = await connect.query<RowDataPacket[]>(getQuery, [ articleID ]);
        return author[0].user_id;
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
    category: string,
    catevalue: string,
    startIdx: number,
    numberToGet: number,
    str: string,
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        let articles: RowDataPacket[] = [];
        if (str == "") {
          // Just SQL (search nothing)
          let GetQuery: string = `SELECT * FROM articles WHERE 1=1`;
          const QueryParam = [];
          if (userID != "") {
            GetQuery += ` AND user_id = ?`;
            QueryParam.push(userID);
          }
          if (category != "") {
            GetQuery += ` AND category = ?`;
            QueryParam.push(category);
          }
          if (catevalue != "") {
            GetQuery += ` AND catevalue = ?`;
            QueryParam.push(catevalue);
          }
          GetQuery += ` ORDER BY posted_date DESC LIMIT ?, ?`;
          QueryParam.push(startIdx, numberToGet);
          [articles] = await connect.query<RowDataPacket[]>(GetQuery, QueryParam);
        } else {
          const filterArr = [];
          if (userID != "") {
            filterArr.push({ term: { user_id: userID }});
          }
          if (category != "") {
            filterArr.push({ term: { category: category }});
            filterArr.push({ term: { catevalue: catevalue }});
          }
          const elaQuery: QueryDslQueryContainer = {
            bool: {
              must: {
                multi_match: {
                  query: str,
                  type: "most_fields",
                  fields: [ "title", "content" ],
                  operator: "AND",
                }
              },
              filter: filterArr,
            }
          }
          const search = (await elasticCli.search({
            index: `articles`,
            query: elaQuery,
          })).hits.hits;
          if (search.length !== 0) {
            const ArticleArr = search.map((obj) => obj._id);
            const GetQuery: string = `SELECT * FROM articles WHERE article_id IN (?) ORDER BY posted_date DESC LIMIT ?, ?`;
            [articles] = await connect.query<RowDataPacket[]>(GetQuery, [ArticleArr, startIdx, numberToGet]);
          }
        }
        // Add user_name, compress articles
        const GetAuthorQuery: string = `SELECT user_name FROM users WHERE user_id = ?`;
        const GetCommentsQuery: string = `SELECT comment_id FROM comments WHERE article_id = ?`;
        const GetRepliesQuery: string = `SELECT reply_id FROM replies WHERE comment_id IN (?)`;
        await Promise.all(
          articles.map(async (arti) => {
            // get comment count
            const [comments] = await connect.query<RowDataPacket[]>(GetCommentsQuery, [arti.article_id]);
            let replies: RowDataPacket[] = [];
            if (comments.length !== 0) [replies] = await connect.query<RowDataPacket[]>(GetRepliesQuery, comments.map((c) => c.comment_id));
            arti.commentCNT = comments.length + replies.length;

            // compress content
            arti.content = arti.content
              .replace(/<\/?[\w\s="'-\/\.:;#]*>/g, '') // html tag skip
              .replace(/\n+/g, "\n") // empty line deletion
              .split("\n") 
              .slice(0, 2)
              .join("\n");
            if (arti.content.length >= CONTENT_MAX_LENGTH) {
              arti.content = arti.content.slice(0, CONTENT_MAX_LENGTH) + "...";
            }
            
            // get author of article
            const [author] = await connect.query<RowDataPacket[]>(GetAuthorQuery, arti.user_id);
            arti.user_name = author[0].user_name;

            return arti;
          })
        );
        return articles;
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  }

  static select = async (
    articleID: number,
  ) => {
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const GetArticleQuery: string = `SELECT * FROM articles WHERE article_id = ?`;
        const GetCommentsQuery: string = `SELECT * FROM comments WHERE article_id = ?`;
        const GetRepliesQuery: string = `SELECT * FROM replies WHERE comment_id IN (?)`;
        const GetAuthorQuery: string = `SELECT user_name FROM users WHERE user_id = ?`;
        const [articles] = await connect.query<RowDataPacket[]>(GetArticleQuery, [articleID]);
        // Handle Exception
        if (articles.length === 0) throw new Error(`article doesn't exist`);

        // Add author
        const [author] = (await connect.query<RowDataPacket[]>(GetAuthorQuery, articles[0].user_id));
        articles[0].user_name = author[0].user_name;

        // Get comments, replies
        const [comments] = await connect.query<RowDataPacket[]>(GetCommentsQuery, [articleID]);
        let replies: RowDataPacket[] = [];
        if (comments.length !== 0) [replies] = await connect.query<RowDataPacket[]>(GetRepliesQuery, comments.map((c) => c.comment_id));

        // Get author of comments, replies
        await Promise.all([
          Promise.all(
            comments.map(async (com) => {
              const [author] = await connect.query<RowDataPacket[]>(GetAuthorQuery, com.user_id);
              com.user_name = author[0].user_name;
              return com;
            }),
          ),
          Promise.all(
            replies.map(async (rep) => {
              const [author] = await connect.query<RowDataPacket[]>(GetAuthorQuery, rep.user_id);
              rep.user_name = author[0].user_name;
              return rep;
            })
          ),
        ]);

        return {
          article: articles[0],
          comments: comments,
          replies: replies,
        }
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
    if (this.title === undefined) throw new Error("title missing");
    if (this.content === undefined) throw new Error("content missing");
    if (this.category === undefined) throw new Error("category missing");
    if (this.catevalue === undefined) throw new Error("catevalue missing");

    // Post
    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        const makeAriticleQuery: string = `INSERT INTO articles (user_id, title, category, catevalue, content) VALUES (?, ?, ?, ?, ?)`;
        await connect.query(makeAriticleQuery, [ this.userID, this.title, this.category, this.catevalue, this.content ]);
      } catch (e) {
        throw e;
      } finally {
        if (connect) connect.release();
      }
    } catch (e) {
      throw e;
    }
  };

  update = async () => {
    // Check properties
    if (this.userID === undefined) throw new Error("userID missing");
    if (this.title === undefined) throw new Error("title missing");
    if (this.content === undefined) throw new Error("content missing");
    if (this.category === undefined) throw new Error("category missing");
    if (this.catevalue === undefined) throw new Error("catevalue missing");

    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        // Check Owner
        const [author] = await connect.query<RowDataPacket[]>(`SELECT user_id FROM articles WHERE article_id = ?`, [this.articleID]);
        if (this.userID != author[0].user_id) throw new Error(`You are not writer`);

        // Update
        const updateAriticleQuery: string = `UPDATE articles SET title = ?, content = ?, catevalue = ? WHERE article_id = ?`;
        await connect.query(updateAriticleQuery, [ this.title, this.content, this.catevalue, this.articleID ]);
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
    if (this.articleID === undefined) throw new Error("articleID missing");

    try {
      const connect: mysql.PoolConnection = await AdminPool.getConnection();
      try {
        // Check Owner, Check existence
        const [author] = await connect.query<RowDataPacket[]>( `SELECT user_id FROM articles WHERE article_id = ?`, [this.articleID]);
        if (author.length === 0) throw new Error(`Article doesn't exist`);
        if (this.userID != author[0].user_id) throw new Error(`You are not writer`);

        // Remove
        const delAriticleQuery: string = `DELETE FROM articles WHERE article_id = ?`;
        const foundCommentsQuery: string = `SELECT * FROM comments WHERE article_id = ?`;
        const delReplyQuery: string = `DELETE FROM replies WHERE comment_id IN (?)`;
        const delCommentQuery: string = `DELETE FROM comments WHERE article_id = ?`;
        const [foundComments] = await connect.query<RowDataPacket[]>(foundCommentsQuery, [this.articleID]);
        await Promise.all([
          connect.query<RowDataPacket[]>(delAriticleQuery, [this.articleID]),
          connect.query<RowDataPacket[]>(delReplyQuery, [foundComments.map((c) => c.comment_id)]),
          connect.query<RowDataPacket[]>(delCommentQuery, [this.articleID]),
          elasticCli.delete({
            index: `articles`,
            id: String(this.articleID),
          }),
        ]);
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

export = Articles;
