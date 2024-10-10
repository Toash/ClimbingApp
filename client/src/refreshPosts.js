import { setPosts } from "state";

/**
 * Gets posts and updates the state with new posts.
 * @param {string} token 
 * @param {*} dispatch 
 */
export const refreshPosts = async (token, dispatch) => {
    const postsResponse = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/posts",
        {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    const postsData = await postsResponse.json();

    console.log("Setting new data (here is the new data):");
    console.log(postsData);
    dispatch(setPosts({ posts: postsData }));
}