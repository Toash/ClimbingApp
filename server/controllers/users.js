import User from "../models/User.js";

//helpers
const createUser = async ({ cid, firstName, lastName, picturePath }) => {

  const newUser = new User({
    cid,
    firstName,
    lastName,
    picturePath: picturePath || ""
  })

  await newUser.save();
  console.log(`A new user with user id ${cid} has been created. `)
}


/* READ */
// get user from mongodb database
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ cid: userId });
    if (!user) {
      // why isnt this running whenb there is no user?
      res.status(404).json({ message: "Could not find the associated user." })
    }
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

  const { create } = req.query; // if user already exists for the given cid then a new one wont be created.
  const { userId } = req.params;
  const { firstName, lastName, mediaPath } = req.body;

  if (!firstName || !lastName) {
    res.status(400).json({ message: "First and last name must be specified when editing user." })
  }

  const user = await User.findOne({ cid: userId })


  // check if we should create a new user instead of editing one.
  if (!user) {
    if (create === "true") {
      await createUser({ cid: userId, firstName, lastName, mediaPath: mediaPath || "" })
      res.status(200).json({ message: "User Successfully created." })
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  }

  let message = "User successfully edited. "
  user.firstName = firstName;
  user.lastName = lastName;


  // if we have receieved a mediaPath then update or create the new profile image
  if (mediaPath) {
    user.picturePath = mediaPath;
    message += "Profile picture updated. "
  }

  await user.save();
  res.status(200).json({ message })

}

