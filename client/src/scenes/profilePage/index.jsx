import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import NavBar from "scenes/navbar";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import UserWidget from "scenes/widgets/UserWidget";
import fetchWithRetry from "fetchWithRetry";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const { userId } = useParams(); //get id from url
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const getUser = async () => {
    const getUserURL = process.env.REACT_APP_API_BASE_URL + `/users/${userId}`;
    const getUserOptions = {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    };

    const response = await fetchWithRetry(getUserURL, getUserOptions, dispatch);
    const data = await response.json();
    setUser(data);
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!user) return null;

  return (
    <Box>
      <NavBar />
      <ErrorBoundary fallback={<div>Something went wrong :(</div>}>
        <Box
          width="100%"
          padding="2rem 6%"
          // widgets will be on top of eachother on mobile
          display={isNonMobileScreens ? "flex" : "block"}
          gap="2rem"
          justifyContent="center"
        >
          <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
            <UserWidget userId={userId} picturePath={user.picturePath} />
            <Box m="2rem 0" />
            <FriendListWidget userId={userId} />
          </Box>

          <Box
            flexBasis={isNonMobileScreens ? "42%" : undefined}
            // margin for mobile since widgets are stacked
            mt={isNonMobileScreens ? undefined : "2rem"}
          >
            {/*<MyPostWidget picturePath={user.picturePath} />*/}
            <Box m="2rem 0" />
            <PostsWidget userId={userId} isProfile />
          </Box>
        </Box>
      </ErrorBoundary>
    </Box>
  );
};

export default ProfilePage;
