import Post from "../../models/Post.js";
import User from "../../models/User.js";

/**
 * Updates the hiscore for the provided user.
 * @param userId The id of the user to update the hiscore
 */
export default async function updateHiscore(userId: string) {
    // Find all posts associated with a user, and sort them by v grade is descending. Pick the first one
    const post = await Post.find({ cid: userId }).sort({ vGrade: -1 }).limit(1);
    const vGrade = post[0]?.vGrade;

    await User.findOneAndUpdate({ cid: userId }, { vGrade: vGrade });
}