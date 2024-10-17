
/**
 * Contains keys for querys, strsings in arrays or functions that take a parameter and return an array.
 */
export const QUERY_KEYS = {
    CURRENT_USER: ["currentUser"], // attrubites of current user.
    USER_BY_ID: (id) => ["otherUser", id], // attributes of another user.


}