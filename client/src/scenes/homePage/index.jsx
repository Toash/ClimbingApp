import { useState, useEffect } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import NavBar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import YourStats from "scenes/widgets/YourStats";

import { ErrorBoundary } from "react-error-boundary";
import ProfileCompletionModal from "./ProfileCompletionModal";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { useDispatch } from "react-redux";
import { setLogin, setLoading } from "state";

import ErrorFallback from "scenes/errors/ErrorFallback";
import refreshAccessToken from "refreshAccessToken";

const HomePage = () => {
  const dispatch = useDispatch();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const loggedIn = useSelector((state) => state.user);
  const _id = useSelector((state) => state.user?._id);
  const picturePath = useSelector((state) => state.user?.picturePath);

  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const cognitoClient = new CognitoIdentityProviderClient({
    region: "us-east-2",
  });

  const loading = useSelector((state) => state.loading);

  useEffect(() => {
    // async allows us to pause execution with "await."
    async function checkProfile() {
      try {
        // TODO: check if the user is signed in

        // get authorization code in url
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get("code");
        let id_token;
        let access_token;

        if (authorizationCode) {
          try {
            // we get id and access tokens
            const response = await fetch(
              process.env.REACT_APP_API_BASE_URL + `/auth/exchange-code`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ authorizationCode: authorizationCode }),
              }
            );
            const tokens = await response.json();
            id_token = tokens.id_token;
            access_token = tokens.access_token;
          } catch (error) {
            console.log("Error: Could not exchange auth code. ", error);
          }
        }

        // store the necessary tokens in redux
        dispatch(setLogin({ token: access_token }));

        console.log("Getting cognito user.");
        const getUserCommand = new GetUserCommand({
          AccessToken: access_token,
        });
        const userData = await cognitoClient.send(getUserCommand);

        console.log("Here is the userData:");
        console.log(userData);
        const cognitoUserId = userData.UserAttributes.find(
          (data) => data.Name === "sub"
        ).Value;

        console.log("extracted cognito user id: ", cognitoUserId);

        const response = await fetch(
          process.env.REACT_APP_API_BASE_URL + `/users/${cognitoUserId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${access_token})}`,
            },
          }
        );

        if (response.status == 401) {
          console.log("Unauthorized request... attempting to refresh token.");
          await refreshAccessToken(dispatch);
        }
        const userProfile = await response.json();

        if (userProfile && userProfile.firstName && userProfile.lastName) {
          setIsProfileComplete(true);
        }

        console.log("Extracted user profile: ");
        console.log(userProfile);
      } catch (error) {
        console.error("Error checking profile", error);
      } finally {
        dispatch(setLoading(false));
      }
    }

    checkProfile();
  }, []);

  return (
    <Box>
      <NavBar></NavBar>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {!loading ? (
          <Box
            width="100%"
            padding="2rem 6%"
            // widgets will be on top of eachother on mobile
            display={isNonMobileScreens ? "flex" : "block"}
            gap="0.5rem"
            justifyContent="space-between"
          >
            <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
              {loggedIn && (
                <>
                  <UserWidget userId={_id} picturePath={picturePath} />
                  <YourStats userId={_id}></YourStats>
                </>
              )}
            </Box>

            <Box
              flexBasis={isNonMobileScreens ? "42%" : undefined}
              // margin for mobile since widgets are stacked
              mt={isNonMobileScreens ? undefined : "2rem"}
            >
              {loggedIn && <MyPostWidget picturePath={picturePath} />}
              <PostsWidget userId={_id} />
            </Box>
            {isNonMobileScreens && (
              <Box flexBasis="26%">
                {loggedIn && <FriendListWidget userId={_id} />}
              </Box>
            )}
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </ErrorBoundary>
    </Box>
  );
};

export default HomePage;
