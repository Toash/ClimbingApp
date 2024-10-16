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


const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  /**
   * Get user profile from cognito profile
   * needs id token
   * @returns 
   */
  const getUserProfile = async () => {
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
  };


  const exchangeAuthCode = async (authorizationCode) => {
    const response = await fetch(
      process.env.REACT_APP_API_BASE_URL + `/auth/exchange-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorizationCode }),
      }
    );
    return await response.json();
  };

  // useMutation to exchange the authorization code for tokens
  const exchangeCodeMutation = useMutation(exchangeAuthCode, {
    onSuccess: (data) => {
      const { id_token, access_token } = data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("id_token", id_token)

      // Refetch user profile with the new token
      queryClient.invalidateQueries(['user']);

      // TODO display success message
      console.log("Successfully got user data!")
    },
    onError: (error) => {
      console.error('Error exchanging auth code', error);
      localStorage.removeItem("access_token")
      localStorage.removeItem("id_token")
    }
  });

  // Function to check if the user has a valid token
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

  // Function to handle authorization code exchange
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


  // useQuery to fetch user profile if the user has a token
  const { isSuccess, isError, error, isPending, data, } = useQuery(
    {
      enabled: !!localStorage.getItem("id_token"), // only run query if token is available
      queryKey: ["currentUser"],
      queryFn: () => getUserProfile(),
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
