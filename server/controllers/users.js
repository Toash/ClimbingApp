import User from "../models/User.js";

/* READ */
// get user from mongodb database
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ cid: userId });
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ cid: userId });

    const friends = await Promise.all(
      user.friends.map((userId) => User.findById(userId))
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, picturePath }) => {
        return { _id, firstName, lastName, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const user = await User.findOne({ cid: userId });
    const friend = await User.findOne({ cid: friendId });

    if (user.friends.includes(friendId)) {
      //remove
      user.friends = user.friends.filter((userId) => userId !== friendId);
      friend.friends = friend.friends.filter((userId) => userId !== userId); // id is shadowing? one is from the user
    } else {
      //add, no confirm from other user
      user.friends.push(friendId);
      friend.friends.push(userId);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((userId) => User.findById(userId))
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, picturePath }) => {
        return { _id, firstName, lastName, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};




/* UPDATE */


/**
 * Edits the user info (firstname, lastname, and profile picture.)
 * 
 * const { userId } = req.params;
 * 
 * const { firstName, lastName, mediaPath } = req.body;
 */
export const editUser = async (req, res) => {

  const { userId } = req.params;
  const { firstName, lastName, mediaPath } = req.body;

  if (!firstName || !lastName) {
    res.status(400).json({ message: "First and last name must be specified when editing user." })
  }

  const user = await User.findOne({ cid: userId })

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  let message = "User successfully edited. "

  // if we have receieved a mediaPath then update or create the new profile image
  if (mediaPath) {
    user.picturePath = mediaPath;
    message += "Profile picture updated. "
  }

  await user.save();
  res.status(200).json({ message })

}

