import React from "react";
import Post from "./Post";
import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";



const Posts = () => {

  const { data, isSuccess, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEYS.POSTS,
    queryFn: async () => {
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/posts",
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log("Posts retrieved: ", data);
      return data;
    }
  });


  if (isError) {
    return <Typography>Oops! Something went wrong while loading posts. Please try again later.</Typography>
  }

  if (isLoading) {
    return <Typography>Loading posts...</Typography>
  }

  if (isSuccess && data.length > 0) {
    return (
      <>
        {data.map(
          ({
            _id,
            cid,
            createdAt,
            // ----- user stuff -----
            firstName,
            lastName,
            picturePath,
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
            <Post
              createdAt={createdAt}
              key={_id}
              postId={_id}
              postUserId={cid}
              // ----- user stuff -----
              name={`${firstName} ${lastName}`}
              picturePath={picturePath}
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
        }
      </>
    );
  }
};

export default Posts;
