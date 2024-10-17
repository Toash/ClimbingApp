import React from "react";
import { useEffect } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import NavBar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import YourStats from "scenes/widgets/YourStats";
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
   * Get user profile from cognito profile
   * needs id token
   * @returns {object} user object
   */
  const { isSuccess, isError, error, isPending, data, } = useQuery(
    {
      enabled: !!localStorage.getItem("id_token"), // only run query if token is available
      queryKey: [QUERY_KEYS.CURRENT_USER],
      queryFn: () => async () => {
        // decode id_token to get sub attribute.
        const id_token = localStorage.getItem("id_token")

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
        const data = await response.json();
        return data;
      },
    }
  );

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
                <UserWidget userId={data.cid} picturePath={picturePath} />
                <FriendListWidget userId={cid} />
                <YourStats userId={cid}></YourStats>
              </>
            )}
          </Box>
          <Box
            flexBasis={isNonMobileScreens ? "70%" : undefined}
            flexGrow={3}
            // margin for mobile since widgets are stacked
            mt={isNonMobileScreens ? undefined : "2rem"}
          >
            {loggedIn && <MyPostWidget picturePath={picturePath} />}
            <PostsWidget userId={cid} />
          </Box>
        </Box>
      </Box >
    );
  }
};

export default HomePage;
