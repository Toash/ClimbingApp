import React from "react";
import { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Menu,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import logout from "auth/logout";
import checkAuthenticatedUser from "data/checkAuthenticatedUser";
import getAuthenticatedUser from "data/getAuthenticatedUser";
import { QUERY_KEYS } from "queryKeys";
import { jwtDecode } from "jwt-decode";

const NavBar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const navigate = useNavigate();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const signInButton = (
    <Button onClick={() => window.location.href = process.env.REACT_APP_LOGIN_URL}>
      Sign Up!
    </Button>
  );


  let fullName

  const { data, isPending, isSuccess: loggedIn } = useQuery({
    enabled: !!localStorage.getItem("id_token"),
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: async () => {
      const cid = jwtDecode(localStorage.getItem("id_token")).sub
      const response = await fetchWithRetry(
        process.env.REACT_APP_API_BASE_URL + `/users/${cid}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("id_token")}` },
        }
      );
      const data = await response.json();
      return data;
    }
  })
  if (loggedIn) {
    fullName = data.firstName + data.lastName;
  }

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem,2rem,2.25rem)"
          color="primary"
          onClick={() => navigate("/")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          BoulderStat
        </Typography>
      </FlexBetween>
      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <FormControl variant="standard" value={fullName}>
            {loggedIn ? (
              <Select
                value={fullName}
                sx={{
                  backGroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase></InputBase>}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => logout()}>
                  Log Out
                </MenuItem>
              </Select>
            ) : (
              signInButton
            )}
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu></Menu>
        </IconButton>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close> </Close>
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backGroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase></InputBase>}
              >
                {loggedIn ? (
                  <>
                    <MenuItem value={fullName}>
                      <Typography>{fullName}</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => logout()}>
                      Log Out
                    </MenuItem>
                  </>
                ) : (
                  signInButton
                )}
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
};


export default NavBar;
