import React from "react";
import { CircularProgress, Divider, Typography, useTheme, Box, useMediaQuery } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";
import useAuthenticatedUser from "data/useAuthenticatedUser.js";
import { PieChart } from "@mui/x-charts";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "queryKeys";

function CurrentUserStats({ showTitle = true }) {

  const { palette } = useTheme();

  const { data: userData, isSuccess, isLoading } = useAuthenticatedUser();

  // get posts from a user and cache
  const { data: posts, isLoading: isLoadingPosts, isSuccess: isSuccessPosts } = useQuery({
    enabled: !!userData?.cid,
    queryKey: QUERY_KEYS.USER_POSTS,
    queryFn: async () => {
      const response = await fetch(import.meta.env.VITE_APP_API_BASE_URL + `/posts/user/${userData.cid}`)
      const data = await response.json();
      return data;
    }
  })

  const getStyleCountsForPie = () => {
    if (isSuccessPosts) {
      let counts = {};
      posts.forEach((post) => {
        post.styles.forEach((style) => {
          if (style) {
            counts[style] = (counts[style] || 0) + 1;
          }
        })
      })

      let pieCount = [];
      if (counts) {
        for (const style in counts) {
          pieCount.push({ label: style, value: counts[style] });
        }
      }

      return pieCount;
    } else {
      throw new Error("No weekly posts available!");
    }
  }

  const getHoldCountsForPie = () => {
    if (isSuccessPosts) {
      let counts = {};
      posts.forEach((post) => {
        post.holds.forEach((hold) => {
          if (hold) {
            counts[hold] = (counts[hold] || 0) + 1;
          }
        })
      })

      let pieCount = [];

      if (counts) {
        for (const hold in counts) {
          pieCount.push({ label: hold, value: counts[hold] });
        }
      }

      return pieCount;
    } else {
      throw new Error("No weekly posts available!");
    }
  }

  if (isLoading || isLoadingPosts) {
    return <CircularProgress />;
  }




  if (isSuccess && isSuccessPosts) {
    const pieChartStyles = {
      highlightScope: { fade: 'global', highlight: 'item' },
      faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
    }

    return (

      <WidgetWrapper width="100%">

        {
          showTitle && <>        <Typography
            variant="h6"
            sx={{
              fontSize: "2rem",
              color: palette.neutral.main,
            }}
          >
            Stats
          </Typography>
            <Divider sx={{ marginBottom: "1rem" }}></Divider></>
        }
        {userData.vGrade &&
          <Typography sx={{ fontSize: "1rem" }}>
            {"Max Grade: " + `V${userData.vGrade}`}
          </Typography>
        }
        <Typography sx={{ fontSize: "1rem" }}>
          Total Climbs: {posts?.length}
        </Typography>
        {/* Statistics on posts */}

        <Box sx={{ display: "flex-column", justifyContent: "space-evenly", overflow: "auto" }}>

          <Box>
            <Typography align="center" fontSize={"1rem"}> Styles </Typography>
            <Divider />
            <PieChart
              series={[{
                data: getStyleCountsForPie(),
                ...pieChartStyles
              }]}
              width={400}
              height={225}

            />
          </Box>
          <Box>
            <Typography align="center" fontSize={"1rem"}> Holds used</Typography>
            <Divider />
            <PieChart
              series={[{
                data: getHoldCountsForPie(),
                ...pieChartStyles
              }]}
              width={400}
              height={225}
            />
          </Box>

        </Box>
      </WidgetWrapper>
    );
  }



};


export default CurrentUserStats;
