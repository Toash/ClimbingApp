import { QueryKey } from "@tanstack/react-query";

/**
 * Contains keys for querys, strsings in arrays or functions that take a parameter and return an array.
 */
export const QUERY_KEYS = {
    CURRENT_USER: ["currentUser"] as [string], // attrubites of current user.
    USER_BY_ID: (id: string) => ["otherUser", id], // attributes of another user.

    POSTS: ["posts"],
    USER_POSTS: ["userPosts"],
    WEEKLY_USER_POSTS: ["weeklyUserPosts"]
}