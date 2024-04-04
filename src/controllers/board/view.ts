import { Request, Response } from "express";
import Articles from "../../model/articles";

const listController = async (
  req: Request,
  res: Response,
) => {
  // Parse Request
  const userID: string = String(req.query.userid);
  const category: string = String(req.query.cg);
  const catevalue: string = String(req.query.cv);
  const startIdx: number = Number(req.query.si);
  const numberToGet: number = Number(req.query.nb);
  const str: string = String(req.query.search);

  Articles
    .getList(userID, category, catevalue, startIdx, numberToGet, str)
    .then((obj) => res.json({
      articles: obj,
    }))
    .catch((e) => res.send(e.message));
};

const viewController = (
  req: Request,
  res: Response,
) => {
  // Parse Reqeust
  const articleID = Number(req.params.articleid);

  // Select Article
  Articles
    .select(articleID)
    .then((data) => res.send(data))
    .catch((e) => res.send(e.message));
};

export = { listController, viewController };
