import { Request, Response } from "express";
import { SessionInterface } from "../../../middleware/session";
import Comments from "../../../model/comments";
import Replies from "../../../model/replies";
import FCMTokens from "../../../model/fcm";
import FCMService from "../../../utilities/fcm";

const postController = (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userID: string = String(req.session.user?.userID);
  const { commentID, content } = req.body;

  // Create model
  const reply: Replies = new Replies();
  reply.commentID = commentID;
  reply.content = content;
  reply.userID = userID;

  // Post
  reply
    .post()
    .then(() => res.json({
      status: 0,
      message: `reply posted`,
    }))
    .then(async () => {
      const authorID = await Comments.getUser(commentID);
      const tokens = await FCMTokens.getTokens(authorID);

      if (tokens) {
        tokens.map((i) => {
          FCMService.PushNoti({
            to: i.value,
            title: "New reply!",
            body: "New reply written.",
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
  const replyID = Number(req.params.replyid);

  // Create model
  const reply: Replies = new Replies();
  reply.replyID = replyID;
  reply.userID = userID;

  // Remove
  reply
    .remove()
    .then(() => res.json({
      status: 0,
      message: `reply removed`,
    }))
    .catch((e) => res.send(e.message));
};

export = { postController, deleteController };
