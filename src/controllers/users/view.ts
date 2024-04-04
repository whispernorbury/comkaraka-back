import { Request, Response } from "express";
import Users from "../../model/users";

const getController = (req: Request, res: Response) => {
  // Parse Request
  const userID: string = String(req.params.userid);

  Users
    .getFromID(userID)
    .then((obj) => res.json({
      status: 0,
      message: `Got information`,
      data: obj,
    }))
    .catch((e) => {
      res.json({
        status: 1,
        message: e.message,
      });
    });
};

const whoControler = (req: Request, res: Response) => {
  // Parse Request
  const userID: string = String(req.query.userid);
  const text: string = String(req.query.search);
  const startIdx: number = Number(req.query.si);
  const numberToGet: number = Number(req.query.nb);

  Users
    .getList(userID, text, startIdx, numberToGet)
    .then((obj) => res.json({
      status: 0,
      users: obj,
    }))
    .catch((e) => res.send(e.message));
};

export = { getController, whoControler };
