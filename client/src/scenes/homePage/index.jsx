import React from "react";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, useMediaQuery, IconButton, Modal, LinearProgress } from "@mui/material";
import NavBar from "scenes/navbar";
import CurrentUserCard from "scenes/widgets/CurrentUserCard";
import LogClimbForm from "scenes/widgets/LogClimbForm";
import Posts from "scenes/widgets/Posts";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import CurrentUserStats from "scenes/widgets/CurrentUserStats";
import { QUERY_KEYS } from "queryKeys";
import getCidFromToken from "auth/getCidFromToken";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Week from "scenes/widgets/Week.jsx";
import SideDrawer from "scenes/drawer/SideDrawer.jsx";
import ChangeAccount from "scenes/widgets/ChangeAccount.jsx";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";

const HomePage = () => {

  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const queryClient = useQueryClient();

  /**
   * Exchanges the auth code for tokens, sets the tokens in local storage.
   */
  const exchangeCodeMutation = useMutation(
    {
      mutationFn: async (authorizationCode) => {
        const response = await fetch(
          import.meta.env.VITE_APP_API_BASE_URL + `/auth/exchange-code`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authorizationCode }),
          }
        );
        return await response.json();
      },
      onSuccess: (data) => {
        const { id_token, access_token } = data;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("id_token", id_token)

        // Refetch user profile with the new token
        queryClient.invalidateQueries(QUERY_KEYS.CURRENT_USER);

        // TODO display success message
        console.log("Successfully got user data!")
      },
      onError: (error) => {
        console.error('Error exchanging auth code', error);
        localStorage.removeItem("access_token")
        localStorage.removeItem("id_token")
      }
    });

  /**
   * 
   * @returns {boolean} true if user has valid token, false otherwise
   */
  const userHasValidToken = async () => {
    const id_token = localStorage.getItem("id_token");
    if (!id_token) return false;

    try {
      const response = await fetch(
        import.meta.env.VITE_APP_API_BASE_URL + "/auth/check-token",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${id_token}` },
        }
      );
      if (!response.ok) {
        throw new Error("Token is invalid or expired");
      }
      const { status } = await response.json();
      return status;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };



  /**
   * If there is a code in url and user does not already have a token, attempt to get them.
   */
  const getTokensFromAuthCode = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get("code");

    if (authorizationCode && !await userHasValidToken()) {
      exchangeCodeMutation.mutate(authorizationCode); // Trigger the mutation
    }
  };


  // extract authorization code from the url
  useEffect(() => {
    getTokensFromAuthCode();
  }, []);


  /**
   * Extract tokens and get the associated user.
   */
  // const { isSuccess, isLoading, isError, error, data } = useQuery(
  //   {
  //     enabled: !!localStorage.getItem("id_token"), // only run query if token is available
  //     queryKey: QUERY_KEYS.CURRENT_USER,
  //     queryFn: async () => {

  //       const cid = getCidFromToken();

  //       const response = await fetch(
  //         import.meta.env.VITE_APP_API_BASE_URL + `/users/${cid}`,
  //         {
  //           method: "GET",
  //           headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
  //         }
  //       );
  //       return await response.json();
  //     },
  //     staleTime: Infinity,
  //   }
  // )



  const { isSuccess, isLoading, isError, error, data } = useAuthenticatedUser({ redirect: false, required: false });



  if (isError) {
    return <><Typography>Error trying to fetch user profile.</Typography>{console.log(error)}</>
  }

  if (isNonMobileScreens) {
    // Desktop layout
    return (
      <>
        <Box>
          <Box
            width="100%"
            padding="2rem"
            display={"flex"}
            gap="2rem"
            justifyContent="space-between"
          >
            <SideDrawer
            />
            <Box
              flexGrow={3}
              display="flex"
              flexDirection="column"
              alignItems={"center"}
              gap="2rem"
            >
              <Week style={{ width: "100%" }}></Week>
              <Posts />
            </Box>
            {/* Flex basis defines the starting size, flex grow defines how much it grows past */}
            <Box
              //flexBasis={isNonMobileScreens ? "30%" : undefined}
              flexGrow={2}
            >
              {isSuccess && (
                <>
                  <Box sx={{ display: "flex", flexDirection: "column", position: "sticky", top: "1rem", gap: "2rem", minWidth: "300px" }}>
                    <CurrentUserCard />
                    <CurrentUserStats />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box >
      </>
    );
  } else {
    // Mobile layout
    return (
      <>
        <Box m="0 1rem">
          <Box
            width="100%"
            // widgets will be on top of eachother on mobile
            display={"block"}
          >
            <SideDrawer
            />
            <Box
              //flexBasis={isNonMobileScreens ? "70%" : undefined}
              // margin for mobile since widgets are stacked
              mt="4rem"
              display="flex"
              flexDirection="column"
              alignItems={"center"}
              gap="1rem"
            >
              {isSuccess && (
                <>
                  <CurrentUserCard />
                  <CurrentUserStats />
                  <Week></Week>
                </>
              )}
              <Posts />
            </Box>
          </Box>
        </Box >
      </>
    );
  }
}


export default HomePage;
