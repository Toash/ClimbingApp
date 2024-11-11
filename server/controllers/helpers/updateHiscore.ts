import Post from "../../models/Post.js";
import User from "../../models/User.js";

/**
 * Updates the hiscore for the provided user.
 * @param userId The id of the user to update the hiscore
 */
export default async function updateHiscore(userId: string) {
    if (!userId) {
        console.log("userId not defined")
        throw new Error("User id not specified for updateHIscore function! Did you include it in the params or body for the request?")
    }
    console.log("Trying to update hiscore for user: " + userId);
    // Find all posts associated with a user, and sort them by v grade is descending. Pick the first one
    const post = await Post.find({ cid: userId }).sort({ vGrade: -1 }).limit(1);
    const vGrade = post[0]?.vGrade;


    if (vGrade !== undefined) {
        console.log("Updating hiscore for user: " + userId + " with vGrade: " + vGrade);
        await User.findOneAndUpdate({ cid: userId }, { vGrade: vGrade });
    } else {
        // no posts, set hiscore to null
        console.log("No posts found for user: " + userId);
        await User.findOneAndUpdate({ cid: userId }, { vGrade: null });
    }
}