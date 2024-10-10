import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";
import { Typography } from "@mui/material";
import fetchWithRetry from "fetchWithRetry";

/**
 * Contains multiple posts
 * @param {string} userId id of user, works in conjunction with isProfile.
 * @param {boolean} isProfile if true, get post of userId, if false, get everyones posts
 * @returns
 */
const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);

  const getPosts = async () => {
    try {
      console.log("Getting all posts");
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/posts",
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log("Posts retrieved: ", data);
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.log("Could not get the posts: ", error);
    }
  };
  const getUserPosts = async () => {
    try {
      console.log(`Getting user posts of user id ${userId}`);
      const response = await fetchWithRetry(
        process.env.REACT_APP_API_BASE_URL + `/posts/user/${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      console.log("User posts retrieved: ", data);
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.log("Could not get posts from user: ", error);
    }
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, []);
  return (
    <>
      {Array.isArray(posts) && posts.length > 0 ? (
        posts.map(
          ({
            _id,
            cid,
            createdAt,
            // ----- user stuff -----
            firstName,
            lastName,
            userPicturePath,
            // ----- climbing stuff -----
            title,
            description,
            vGrade,
            attempts,
            // ----- media stuff -----
            mediaPath,

            likes,
            comments,
          }) => (
            <PostWidget
              createdAt={createdAt}
              key={_id}
              postId={_id}
              postUserId={cid}
              // ----- user stuff -----
              name={`${firstName} ${lastName}`}
              userPicturePath={userPicturePath}
              // ----- climbing stuff -----
              title={title}
              description={description}
              vGrade={vGrade}
              attempts={attempts}
              // ----- media stuff -----
              mediaPath={mediaPath}
              likes={likes}
              comments={comments}
            />
          )
        )
      ) : (
        <Typography>No posts avaliable :(</Typography>
      )}
    </>
  );
};

export default PostsWidget;
