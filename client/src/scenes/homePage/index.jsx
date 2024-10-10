import React from "react";
import { useState, useEffect, Suspense } from "react";
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
import { setLogin, setLoading, setLogout } from "state";

import ErrorFallback from "scenes/errors/ErrorFallback";
import fetchWithRetry from "fetchWithRetry";

const HomePage = () => {
  const dispatch = useDispatch();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const loggedIn = useSelector((state) => state.user);

  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const loading = useSelector((state) => state.loading);
  const token = useSelector((state) => state.token);
  const [setupComplete, setSetupComplete] = useState(false);

  // if cid and picturePath are null, we will get them when fetching the user.
  const [cid, setCid] = useState(useSelector((state) => state.user?.cid));
  const [picturePath, setPicturePath] = useState(
    useSelector((state) => state.user?.picturePath)
  );

  useEffect(() => {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: "us-east-2",
    });
    // async allows us to pause execution with "await."
    async function checkProfile() {
      try {
        // TODO: check if the user is signed in (invalid token or no token), if not get a token

        console.log("Checking to see if the user is signed in.");
        let response = await fetch(
          process.env.REACT_APP_API_BASE_URL + "/auth/check-token",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { status } = await response.json();
        if (status) {
          console.log("User already has a valid token. Skipping token setup.");
          return;
        } else {
          console.log(
            "User does not have a valid token. Exchanging an authorization code."
          );
        }

        // get authorization code in url
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get("code");
        let id_token;
        let access_token;

        if (!authorizationCode) {
          console.log(
            "No access token and authorization code, user is a guest."
          );
          // sign out
          dispatch(setLogout());
        }

        try {
          // we get id and access tokens
          response = await fetch(
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
          // store the necessary tokens in redux
          dispatch(setLogin({ token: id_token }));
          console.log("Successfully exchanged auth token!");
          console.log("Here are the tokens received: ", JSON.stringify(tokens));
        } catch (error) {
          console.log("Error: Could not exchange auth code. ", error);
          // sign out
          dispatch(setLogout());
        }

        console.log("Getting cognito user.");
        const getUserCommand = new GetUserCommand({
          AccessToken: access_token,
        });
        const userData = await cognitoClient.send(getUserCommand);

        console.log("Here is the userData: ", userData);
        const cognitoUserId = userData.UserAttributes.find(
          (data) => data.Name === "sub"
        ).Value;
        console.log("extracted cognito user id: ", cognitoUserId);

        console.log("Attempting to fetch user profile in mongodb database.");
        response = await fetchWithRetry(
          process.env.REACT_APP_API_BASE_URL + `/users/${cognitoUserId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${id_token}` },
          },
          dispatch
        );

        const userProfile = await response.json();

        console.log("Here is the fetched user profile: ", userProfile);

        dispatch(setLogin({ user: userProfile }));
        setCid(userProfile.cid);
        setPicturePath(userProfile.picturePath);

        if (userProfile && userProfile.firstName && userProfile.lastName) {
          setIsProfileComplete(true);
        }
      } catch (error) {
        console.error("Error checking profile", error);
      } finally {
        dispatch(setLoading(false));
        setSetupComplete(true);
      }
    }

    checkProfile();
  }, [dispatch, token]);

  return (
    <Box>
      <NavBar></NavBar>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Typography>Loading!</Typography>}>
          <Box
            width="100%"
            padding="2rem 6%"
            // widgets will be on top of eachother on mobile
            display={isNonMobileScreens ? "flex" : "block"}
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
                  <UserWidget userId={cid} picturePath={picturePath} />
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
        </Suspense>

      </ErrorBoundary>
    </Box>
  );
};

export default HomePage;
