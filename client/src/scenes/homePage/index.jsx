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
    async function checkProfile() {
      dispatch(setLoading(true));
      console.log("Redirect URI:", process.env.REACT_APP_REDIRECT_URL); // Check if this is correct

      try {
        // get authorization code in url
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get("code");

        // get tokens
        let response = await fetch(
          "https://climbing-app.auth.us-east-2.amazoncognito.com/oauth2/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              client_id: "6e718pu7haefgts8vp0hveoaa4",
              code: authorizationCode,
              redirect_uri: process.env.REACT_APP_REDIRECT_URL,
            }),
          }
        );
        const token = await response.json();
        console.log("Here are the tokens: ", token);

        // store the necessary tokens in redux
        dispatch(setLogin({ user: null, token: token.id_token }));

        const getUserCommand = new GetUserCommand(token);
        const userData = await cognitoClient.send(getUserCommand);

        console.log(userData);
        const cognitoUserId = userData.UserAttributes.sub;

        response = await fetch(
          process.env.REACT_APP_API_BASE_URL + `/users/${cognitoUserId}`
        );
        const userProfile = await response.json();

        if (userProfile && userProfile.firstName && userProfile.lastName) {
          setIsProfileComplete(true);
        }
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
      <ErrorBoundary fallback={<div>Something went wrong :(</div>}>
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
