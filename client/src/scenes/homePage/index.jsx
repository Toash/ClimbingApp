import React from "react";
import { useEffect } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import NavBar from "scenes/navbar";
import CurrentUserCard from "scenes/widgets/CurrentUserCard";
import CreatePost from "scenes/widgets/CreatePost";
import Posts from "scenes/widgets/Posts";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import CurrentUserStats from "scenes/widgets/CurrentUserStats";
import { jwtDecode } from "jwt-decode";
import { QUERY_KEYS } from "queryKeys";


const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  /**
   * Exchanges the auth code for tokens, sets the tokens in local storage.
   */
  const exchangeCodeMutation = useMutation(
    async (authorizationCode) => {
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + `/auth/exchange-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorizationCode }),
        }
      );
      return await response.json();
    },
    {
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
    const id_token = localStorage.getItem("id_token")
    if (!id_token) return false;

    const response = await fetch(
      process.env.REACT_APP_API_BASE_URL + "/auth/check-token",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${id_token}` },
      }
    );
    const { status } = await response.json();
    return status;
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
  const { isSuccess, isError, error, isPending, data, } = useQuery(
    {
      enabled: !!localStorage.getItem("id_token"), // only run query if token is available
      queryKey: [QUERY_KEYS.CURRENT_USER],
      queryFn: async () => {
        // Define the user in the cache.
        // decode id_token to get sub attribute.
        const id_token = localStorage.getItem("id_token")
        if (!id_token) {
          throw new Error("id token is not in localStorage.")
        }

        const decoded = jwtDecode(id_token);
        console.log("Decoded id_token: ", decoded)
        const cid = decoded.sub;

        const response = await fetch(
          process.env.REACT_APP_API_BASE_URL + `/users/${cid}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${id_token}` },
          }
        );
        return await response.json();
      },
      staleTime: Infinity,
    }
  )

  if (isPending) {
    return <Typography>Fetching user profile....</Typography>
  }

  if (isError) {
    return <Typography>Error trying to fetch user profile. {error}</Typography>
  }


  if (isSuccess) {
    return (
      <Box>
        < NavBar ></NavBar >
        <Box
          width="100%"
          padding="2rem 6%"
          // widgets will be on top of eachother on mobile
          display={isNonMobileScrewens ? "flex" : "block"}
          gap="1rem"
          justifyContent="space-between"
        >
          {/* Flex basis defines the starting size, flex grow defines how much it grows past */}
          <Box
            flexBasis={isNonMobileScreens ? "26%" : undefined}
            flexGrow={1}
          >
            {loggedIn && (
              <>
                <CurrentUserCard userId={data.cid} picturePath={picturePath} />
                <FriendListWidget userId={cid} />
                <CurrentUserStats userId={cid}></CurrentUserStats>
              </>
            )}
          </Box>
          <Box
            flexBasis={isNonMobileScreens ? "70%" : undefined}
            flexGrow={3}
            // margin for mobile since widgets are stacked
            mt={isNonMobileScreens ? undefined : "2rem"}
          >
            {loggedIn && <CreatePost picturePath={picturePath} />}
            <Posts userId={cid} />
          </Box>
        </Box>
      </Box >
    );
  }
};

export default HomePage;
