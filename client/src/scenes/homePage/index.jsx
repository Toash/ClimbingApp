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
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { useDispatch } from "react-redux";
import { setLogin, setLoading, setLogout } from "state";

import ErrorFallback from "scenes/errors/ErrorFallback";
import fetchWithRetry from "fetchWithRetry";
import { isAllOf } from "@reduxjs/toolkit";

const HomePage = () => {
  const dispatch = useDispatch();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const loading = useSelector((state) => state.loading)
  const loggedIn = useSelector((state) => state.token);
  const token = useSelector((state) => state.token);

  // if cid and picturePath are null, we will get them when fetching the user.
  // this doesnt work as expected, will be null even when token is defiend (maybe user is null?)
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
      let userProfile;
      try {
        dispatch(setLoading(true));
        if (!await userHasValidToken()) {
          let access_token;
          let id_token;
          ({ access_token, id_token } = await extractTokensFromCode());

          //guest
          if (!access_token || !id_token) {
            console.log(
              "No access token and authorization code, user is a guest."
            );
            dispatch(setLoading(false));
            return;
          }

          // set token and user

          ({ userProfile } = await getUser(access_token, id_token));
          console.log("Here is the fetched user profile: ", userProfile);
          dispatch(setLogin({ user: userProfile, token: id_token }));


          setCid(userProfile.cid);
          setPicturePath(userProfile.picturePath);

          if (userProfile && userProfile.firstName && userProfile.lastName) {
            //setIsProfileComplete(true);
          }
        } else {
          // assuming that if valid token then user in state is also defined.
          console.log("User already has a valid token. Skipping token setup.");
          // for some reason we need to set these again. Although user should be defined?
          if (userProfile) {
            setCid(userProfile.cid);
            setPicturePath(userProfile.picturePath);
          }
        }
      } catch (error) {
        console.error("Error checking profile", error);
      } finally {
        dispatch(setLoading(false));
        //setSetupComplete(true);
      }

      async function getUser(access_token, id_token) {
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
        const response = await fetchWithRetry(
          process.env.REACT_APP_API_BASE_URL + `/users/${cognitoUserId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${id_token}` },
          },
          dispatch
        );

        const userProfile = await response.json();
        return { userProfile };
      }

      async function extractTokensFromCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get("code");
        let id_token;
        let access_token;

        if (!authorizationCode) {
          return { access_token: null, id_token: null };
        }

        console.log(
          "User does not have a valid token. Exchanging an authorization code."
        );
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
          // store the necessary tokens in redux

          console.log("Successfully exchanged auth token!");
          console.log("Here are the tokens received: ", JSON.stringify(tokens));
        } catch (error) {
          console.log("Error: Could not exchange auth code. ", error);
          // sign out
          dispatch(setLoading(false));
          dispatch(setLogout());
        }
        return { access_token, id_token };
      }


      async function userHasValidToken() {
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

          return true;
        } else {
          return false;
        }
      }
    }

    checkProfile();
  }, []);

  return (
    <Box>
      <NavBar></NavBar>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* when loading changes, these components will rerender. */}
        {!loading ? (
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
          </Box>)
          : (<Typography>Loading!</Typography >)
        }

      </ErrorBoundary>
    </Box>
  );
};

export default HomePage;
