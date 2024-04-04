import { Request, Response } from "express";
import { SessionInterface } from "../../../middleware/session";
import Articles from "../../../model/articles";
import Comments from "../../../model/comments";
import FCMTokens from "../../../model/fcm";
import FCMService from "../../../utilities/fcm";

const postController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userID: string = String(req.session.user?.userID);
  const { articleID, content } = req.body;

  // Create new Comment model
  const comment: Comments = new Comments();
  comment.userID = userID;
  comment.articleID = articleID;
  comment.content = content;
  
  // Post
  comment
    .post()
    .then(() => res.json({
      status: 0,
      message: `comment posted`,
    }))
    .then(async () => {
      const authorID = await Articles.getUser(articleID);
      const tokens = await FCMTokens.getTokens(authorID);

      if (tokens) {
        tokens.map((i) => {
          console.log(i.value);
          FCMService.PushNoti({
            to: i.value,
            title: "New comment!",
            body: "New comment written.",
            categorygory: "individual",
            catvaluelue: "none",
          });
        });
      }
    })
    .catch((e) => res.send(e.message));
};

const deleteController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userID: string = String(req.session.user?.userID);
  const commentID = Number(req.params.commentid);

  // Create Comment model
  const comment: Comments = new Comments();
  comment.userID = userID;
  comment.commentID = commentID;

  // Remove
  comment
    .remove()
    .then(() => res.json({
      status: 0,
      message: `comment removed`,
    }))
    .catch((e) => res.send(e.message));
};

export = { postController, deleteController };
