import { Request, Response } from "express";
import { SessionInterface } from "../../../middleware/session";
import FCMService from "../../../utilities/fcm";
import Articles from "../../../model/articles";

const postController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userID: string = String(req.session.user?.userID);
  const { title, content, category, catevalue } = req.body;

  // Create new Article model
  const article: Articles = new Articles();
  article.userID = userID;
  article.title = title;
  article.content = content;
  article.category = category;
  article.catevalue = catevalue;

  // Post
  article
    .post()
    .then(() => res.send())
    .then(() => {
      if (
        category.slice(0, 4) === "news" ||
        category === "announcement" ||
        category === "year"
      ) {
        return FCMService.PushNoti({
          to: "non individual",
          title: "New article!",
          body: "New article uploaded.",
          categorygory: category,
          catvaluelue: catevalue,
        });
      } else {
        return;
      }
    })
    .catch((e) => res.send(e.message));
};

const putControler = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userID: string = String(req.session.user?.userID);
  const articleID: number = Number(req.params.articleid);
  const { title, content, catevalue } = req.body;
  
  // Create new Article model
  const article: Articles = new Articles();
  article.userID = userID;
  article.articleID = articleID;
  article.title = title;
  article.content = content;
  article.catevalue = catevalue;

  // Update
  article
    .update()
    .then(() => res.json({
      status: 0,
      message: `article updated`,
      articleID: articleID,
    }))
    .catch((e) => {
      res.send(e.message);
    });
};

const deleteController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse request
  const userID: string = String(req.session.user?.userID);
  const articleID: number = Number(req.params.articleid);

  // Craete new Article model
  const article: Articles = new Articles();
  article.userID = userID;
  article.articleID = articleID;

  // Remove
  article
    .remove()
    .then(() => res.send())
    .catch((e) => res.send(e.message));
};

export = { postController, putControler, deleteController };
