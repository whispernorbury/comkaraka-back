import { Request, Response } from "express";
import { SessionInterface } from "../../middleware/session";
import Users from "../../model/users";
import FCMService from "../../utilities/fcm";
import isCSID from "../../utilities/checkid";

const signinController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const { userID, userPW, fcmToken } = req.body;

  // Sign In
  Users
    .signIn(userID, userPW, fcmToken)
    .then((data) => {
      req.session.user = {
        userID: userID,
        userPW: userPW,
      };
      res.json({
        status: 0,
        userID: userID,
        admin: Boolean(data.isAdmin),
      });
    })
    // Cloud Messaging
    .then(() => {
      FCMService.subscribeToTopic(fcmToken, "announcement");

      let year: number;
      if (userID.length === 8) year = Number(userID.slice(0, 2));
      else year = Number(userID.slice(2, 4));
      
      // news from diff-3 generation
      FCMService.subscribeToTopic(fcmToken, "news" + `${year - 3}`);
      FCMService.subscribeToTopic(fcmToken, "news" + `${year - 2}`);
      FCMService.subscribeToTopic(fcmToken, "news" + `${year - 1}`);
      FCMService.subscribeToTopic(fcmToken, "news" + `${year    }`);
      FCMService.subscribeToTopic(fcmToken, "news" + `${year + 1}`);
      FCMService.subscribeToTopic(fcmToken, "news" + `${year + 2}`);
      FCMService.subscribeToTopic(fcmToken, "news" + `${year + 3}`);
    })
    .catch((e) => res.json({
      status: 1,
      message: e.message,
    }));
};

const signupController = async (
  req: Request,
  res: Response
) => {
  // Parse Request
  const { userID, userPW } = req.body;

  // Check ID expression
  if (isCSID(userID)) {
    // Sign up
    Users
      .signUp(userID, userPW)
      .then(() => res.json({
        status: 0,
        userID: userID,
        admin: false,
      }))
      .catch((e) => res.json({
        status: 1,
        message: e.message,
      }));
  } else {
    res.send(`${userID} is not available`);
  }
};

const editController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userid = req.session.user?.userID;
  const { userName, userAddInfo, userTEL, userEmail, userIMG, userID } = req.body;

  // Check ID validity
  if (userid != userID) {
    res.send("Invalid Request");
    return;
  }

  // Create model
  const user: Users = new Users();
  user.userName = userName;
  user.userAddInfo = userAddInfo;
  user.userTEL = userTEL;
  user.userEmail = userEmail;
  user.userIMG = userIMG;
  user.userID = userID;

  // Edit Information
  user
    .editInfo()
    .then(() => res.json({
      status: 0,
      message: `Successfully information edited`,
    }))
    .catch((e) => res.send(e.message));
};

const changePasswordController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userid = req.session.user?.userID;
  const { userID, newPW } = req.body;

  // Check userID eq targetID
  if (userid != userID) {
    res.send("Invalid Request");
    return;
  }

  // Change Passwd
  Users
    .changePW(userID, newPW)
    .then(() => {
      if (req.session.user) req.session.destroy(()=>{});
      res.json({
        status: 0,
        message: `passwd changed`,
      });
    })
    .catch((e) => res.send(e.message));
};

const deleteController = async (
  req: Request & { session: SessionInterface },
  res: Response,
) => {
  // Parse Request
  const userID: string = String(req.session.user?.userID);
  const userPW: string = String(req.session.user?.userPW);

  // Delete Account
  Users
    .delAccount(userID, userPW)
    .then(() => {
      // Destroy session
      if (req.session.user) req.session.destroy(() => {});
      res.json({
        status: 0,
        message: `Goodbye, ${userID}`,
      });
    })
    .catch((e) => res.send(e.message));
};

export = { signinController, signupController, editController, changePasswordController, deleteController, };
