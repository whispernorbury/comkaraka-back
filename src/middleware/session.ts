import { Request, Response, NextFunction } from "express";

export interface SessionInterface {
  user?: {
    userID: string;
    userPW: string;
  };
};

const checkSession = (
  req: Request & { session: SessionInterface },
  res: Response,
  next: NextFunction,
) => {
  if (!req.session || !req.session.user) {
    res.json({
      validity: false,
      message: `your session is not invalid.`,
    });
  } else {
    next();
  }
};

export { checkSession };