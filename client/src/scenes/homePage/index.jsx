import { Box, useMediaQuery } from "@mui/material";
import NavBar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import { useSelector } from "react-redux";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);

  return (
    <Box>
      <NavBar></NavBar>

      <Box
        width="100%"
        padding="2rem 6%"
        // widgets will be on top of eachother on mobile
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={_id} picturePath={picturePath} />
        </Box>

        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          // margin for mobile since widgets are stacked
          mt={isNonMobileScreens ? undefined : "2rem"}
        ></Box>
        {isNonMobileScreens && <Box flexBasis="26%"></Box>}
      </Box>
    </Box>
  );
};

export default HomePage;
