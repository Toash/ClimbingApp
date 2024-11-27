import React, { useEffect } from "react";
import Post from "./Post";
import { Button, CircularProgress, Divider, Typography, Box } from "@mui/material";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";
import CircleProgress from "@mui/material/CircularProgress";


const Posts = () => {


  const handleScroll = () => {

    //console.log({ innerHeight: window.innerHeight, scrollY: window.scrollY, scrollHeight: document.documentElement.scrollHeight })
    const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight

    if (bottom) {
      if (!isFetchingNextPage) {
        console.log("Fetching next page.")
        fetchNextPage();
      }
      console.log('at the bottom');
    }
  }

  // https://www.w3schools.com/jsref/obj_window.asp
  // https://stackoverflow.com/questions/63501757/check-if-user-reached-the-bottom-of-the-page-react/63502850
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });

    // cleanup, unsubscribe
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);



  // fetches the post based on the page number (pageParam)
  const fetchPosts = async ({ pageParam }) => {
    const res = await fetch(import.meta.env.VITE_APP_API_BASE_URL + "/posts?pageSize=2&pageNumber=" + pageParam)
    const data = await res.json();

    console.log("Data retrieved: ", data)
    return data;
  }

  /** 
    Infinite scrolling
    The query function fetches the post based on the pageParam (automatically supplied by the hook.)
    getNextPageParam will get the page number for the next time it fetches. will be null when at the end.
    
    data contains all of the pages and the posts contained within each page.
  */
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage, // retujrns true if getNextPageParam returns something other than undefined.
    isFetching,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    isError
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.POSTS],
    queryFn: fetchPosts,
    initialPageParam: 0,

    // determine if there is more data to load, and the information to fetch it.
    getNextPageParam: (lastPage, pages) => {
      return lastPage.nextPageNumber;
    },

  })


  if (isError || error) {
    return <Typography>Oops! Something went wrong while loading posts. Please try again later.</Typography>
  }

  if (isLoading) {
    return <CircleProgress />
  }

  console.log(data)
  //if (data.pages[0].data.length > 0) { 

  return (
    <React.Fragment>
      {/* Map through the pages */}
      {data.pages.map((page, i) => (
        <React.Fragment key={i}>
          {/* Map through the posts within the page. */}
          {page.data.map(({
            _id,
            cid,
            climbDate,
            // ----- user stuff -----
            firstName,
            lastName,
            picturePath,
            // ----- climbing stuff -----
            title,
            description,
            vGrade,
            attempts,
            angle,
            holds,
            styles,
            // ----- media stuff -----
            mediaPath,

            likes,
            comments,
          }) => (
            <Post
              climbDate={climbDate}
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
              angle={angle}
              holds={holds}
              styles={styles}
              // ----- media stuff -----
              mediaPath={mediaPath}
              likes={likes}
              comments={comments}
            />
          )
          )
          }
        </React.Fragment>
      ))}

      {/* {hasNextPage && <Button onClick={() => fetchNextPage()}>Fetch next posts</Button>} */}
      {!hasNextPage &&
        (
          <>
            <Typography>No more posts</Typography>
          </>
        )
      }
      {isFetchingNextPage && <CircularProgress />}
    </React.Fragment>
  );
}


export default Posts;
