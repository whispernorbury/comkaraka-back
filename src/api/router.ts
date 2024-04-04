import { Router } from "express";
import { checkSession } from "../middleware/session";

import boardViewController from "../controllers/board/view";
import boardEditArticleController = require("../controllers/board/edit/articles");
import boardEditCommentsController = require("../controllers/board/edit/comments");
import boardEditRepliesController = require("../controllers/board/edit/replies");
import usersAuthController = require("../controllers/users/auth");
import usersViewController = require("../controllers/users/view");

const router: Router = Router();

const BOARDS = "boards";
const VIEW = "view";
const EDIT = "edit";
const ARTICLES = "articles";
const COMMENTS = "comments";
const REPLIES = "replies";
const USERS = "users";
const AUTH = "auth";

router.get(   `/${BOARDS}/${VIEW}/list`, checkSession, boardViewController.listController,);
router.get(   `/${BOARDS}/${VIEW}/:articleid`, checkSession, boardViewController.viewController,);
router.post(  `/${BOARDS}/${EDIT}/${ARTICLES}/`, checkSession, boardEditArticleController.postController,);
router.put(   `/${BOARDS}/${EDIT}/${ARTICLES}/:articleid`, checkSession, boardEditArticleController.putControler,);
router.delete(`/${BOARDS}/${EDIT}/${ARTICLES}/:articleid`, checkSession, boardEditArticleController.deleteController,);
router.post(  `/${BOARDS}/${EDIT}/${COMMENTS}/`, checkSession, boardEditCommentsController.postController,);
router.delete(`/${BOARDS}/${EDIT}/${COMMENTS}/:commentid`, checkSession, boardEditCommentsController.deleteController,);
router.post(  `/${BOARDS}/${EDIT}/${REPLIES}/`, checkSession, boardEditRepliesController.postController,);
router.delete(`/${BOARDS}/${EDIT}/${REPLIES}/:replyid`, checkSession, boardEditRepliesController.deleteController,);

router.post(  `/${USERS}/${AUTH}/signin`, usersAuthController.signinController);
router.post(  `/${USERS}/${AUTH}/signup`, usersAuthController.signupController);
router.put(   `/${USERS}/${AUTH}/edit`, checkSession, usersAuthController.editController,);
router.put(   `/${USERS}/${AUTH}/changepasswd`, checkSession, usersAuthController.changePasswordController,);
router.delete(`/${USERS}/${AUTH}/delete`, checkSession, usersAuthController.deleteController,);
router.get(   `/${USERS}/${VIEW}/profile/:userid`, checkSession, usersViewController.getController,);
router.get(   `/${USERS}/${VIEW}/who`, checkSession, usersViewController.whoControler);

export = router;
