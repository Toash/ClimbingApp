import express from "express";
import multer from "multer";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  editUser,
} from "../controllers/users.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* READ */
router.get("/:userId", getUser);
router.get("/:userId/friends", getUserFriends);

/* UPDATE */
router.patch("/:userId/friend/:friendId", addRemoveFriend);
router.patch("/:userId/edit", upload.none(), editUser);

// cannot differentiate between the two urls. For example /users/123/edit, is edit the edit endpoint, or is it a friendId?
// router.patch("/:userId/:friendId", addRemoveFriend);
// router.patch("/:userId/edit", editUser);

export default router;
