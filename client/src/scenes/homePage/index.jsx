import React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
  IconButton,
  Modal,
  LinearProgress,
} from "@mui/material";
import NavBar from "scenes/navbar";
import CurrentUserCard from "scenes/widgets/CurrentUserCard";
import LogClimbForm from "scenes/widgets/LogClimbForm";
import Posts from "scenes/widgets/Posts";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import CurrentUserStats from "scenes/widgets/CurrentUserStats";
import { QUERY_KEYS } from "queryKeys";
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Week from "scenes/widgets/Week.jsx";
import SideDrawer from "scenes/drawer/SideDrawer.jsx";
import EditAccount from "scenes/widgets/EditAccount.jsx";
import useAuthenticatedUser from "data/useAuthenticatedUser.js";
import goToLogin from "goToLogin.js";
import getCidFromToken from "auth/getCidFromToken.js";
import { enqueueSnackbar } from "notistack";
import CollapsibleWidgetWrapper from "components/CollapsibleWidgetWrapper.jsx";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const queryClient = useQueryClient();

  /**
   * Exchanges the auth code for tokens, sets the tokens in local storage.
   */
  const exchangeCodeMutation = useMutation({
    mutationKey: ["exchangeCode"],
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
      console.log(data);

      // invalid grant will make access_token and id_token undefined.
      if (access_token && id_token) {
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("id_token", id_token);
      }

      // Refetch user profile with the new token
      queryClient.invalidateQueries(QUERY_KEYS.CURRENT_USER);

      // TODO display success message
      console.log("Successfully got new tokens.!", { access_token, id_token });
    },
    onError: (error) => {
      console.error("Error exchanging auth code", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("id_token");
    },
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

    // console.log("Authorization code extracted: ", authorizationCode)

    if (authorizationCode && !(await userHasValidToken())) {
      exchangeCodeMutation.mutate(authorizationCode);
    }
  };

  // extract authorization code from the url
  useEffect(() => {
    getTokensFromAuthCode();
  }, []);

  const { isSuccess, isLoading, isError, error, data } = useAuthenticatedUser();

  // after we have gotten the user profile
  const [needToSetupUserProfile, _] = useState(
    isSuccess && !(!data?.firstName || !data?.lastName)
  );

  // make sure state occurs before early return, or else hooks will be out of order.
  const [editAccountOpen, setEditAccountOpen] = useState(
    needToSetupUserProfile
  );

  if (isLoading) {
    return (
      <>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography>Loading user profile...</Typography>
            <CircularProgress />
          </Box>
        </Box>
      </>
    );
  }
  if (isError) {
    return (
      <>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography>
              Error tryinng to fetch user profile. Please try again later
            </Typography>
          </Box>
        </Box>
        {/* {queryClient.removeQueries({ queryKey: QUERY_KEYS.CURRENT_USER })} */}
        {console.log("Error trying to fetch user profile", error)}
      </>
    );
  }

  if (needToSetupUserProfile) {
    //console.log("User profile not set up.")
  }

  const handleEditAccountOpen = () => {
    setEditAccountOpen(true);
  };

  const handleEditAccountClose = (event, reason) => {
    if (needToSetupUserProfile) {
      if (reason && reason === "backdropClick") {
        enqueueSnackbar("Please complete profile setup to continue.");
        return;
      }
    }
    setEditAccountOpen(false);
  };

  if (isNonMobileScreens) {
    // Desktop layout
    return (
      <>
        <EditAccount
          open={editAccountOpen}
          onClose={handleEditAccountClose}
          firstTime={needToSetupUserProfile}
        />
        <Box>
          <Box
            width="100%"
            padding="2rem"
            display={"flex"}
            gap="2rem"
            justifyContent="space-between"
          >
            <SideDrawer />
            <Box
              flexGrow={3}
              display="flex"
              flexDirection="column"
              alignItems={"center"}
              gap="2rem"
            >
              {isSuccess && (
                <CollapsibleWidgetWrapper label="Week" defaultExpanded>
                  <Week style={{ width: "100%" }} />
                </CollapsibleWidgetWrapper>
              )}

              <Posts />
            </Box>
            {/* Flex basis defines the starting size, flex grow defines how much it grows past */}
            <Box
              //flexBasis={isNonMobileScreens ? "30%" : undefined}
              flexGrow={2}
            >
              {isSuccess && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      position: "sticky",
                      top: "1rem",
                      gap: "2rem",
                      minWidth: "300px",
                    }}
                  >
                    <CurrentUserCard
                      handleEditAccount={handleEditAccountOpen}
                    />
                    <CurrentUserStats />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </>
    );
  } else {
    // Mobile layout
    return (
      <>
        <EditAccount
          open={editAccountOpen}
          onClose={handleEditAccountClose}
          firstTime={needToSetupUserProfile}
        />
        <Box m="0 1rem">
          <Box
            width="100%"
            // widgets will be on top of eachother on mobile
            display={"block"}
          >
            <SideDrawer />
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
                  <CurrentUserCard handleEditAccount={handleEditAccountOpen} />
                  <CollapsibleWidgetWrapper label="Stats">
                    <CurrentUserStats showTitle={false} />
                  </CollapsibleWidgetWrapper>

                  <CollapsibleWidgetWrapper label="Week">
                    <Week></Week>
                  </CollapsibleWidgetWrapper>
                </>
              )}

              <Posts />
            </Box>
          </Box>
        </Box>
      </>
    );
  }
};

export default HomePage;
