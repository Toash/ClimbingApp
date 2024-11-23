import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
} from "../controllers/users.js";

const router = express.Router();

/* READ */
router.get("/:userId", getUser);
router.get("/:userId/friends", getUserFriends);

/* UPDATE */
router.patch("/:userId/:friendId", addRemoveFriend);
router.patch("/:userId/edit")

export default router;
