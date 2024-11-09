import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import { IconButton, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import UploadIcon from '@mui/icons-material/Upload';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CreatePost from 'scenes/widgets/CreatePost.jsx';
import useAuthenticatedUser from 'data/useAuthenticatedUser.ts';
import { Box, Typography } from '@mui/material';
import logout from "auth/logout.js"
import signin from 'auth/signin.js';
import MenuIcon from '@mui/icons-material/Menu';
import CircleIcon from '@mui/icons-material/Circle';



export default function SideDrawer() {

    const { palette } = useTheme();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);


    const toggleMobileDrawer = (open) => {
        console.log("Opening side drawer for mobile view")
        setDrawerOpen(open);
    }

    const handleHomeButton = () => { window.location.href = "/"; };
    const handleOpenDialog = () => { setDialogOpen(true) };
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setDrawerOpen(false);
    };

    const ClimbIcon = () => <SvgIcon>
        {/* credit: https://www.svgrepo.com/svg/124252/climbing */}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 304.515 304.515"
        >
            <path d="m148.078,256.816l-25.964-18.122-10.657-1.392 15.756,56.255c2.236,7.983 10.519,12.631 18.49,10.398 7.977-2.234 12.633-10.513 10.399-18.49l-8.024-28.649z" />
            <circle cx="62.034" cy="61.041" r="25.907" />
            <path d="m187.079,232.819l-46.337-32.342c-1.975-1.379-4.253-2.261-6.642-2.574l-59.266-7.744c2.483,5.066 10.024,17.088 0.728,30.351l51.015,6.665 43.33,30.244c6.808,4.751 16.154,3.064 20.886-3.715 4.742-6.793 3.079-16.143-3.714-20.885z" />
            <path d="m277.617,0h-179.556c-1.313,0-2.467,0.867-2.833,2.128s0.145,2.611 1.254,3.314l8.584,5.441-.975,56.237-23.316,25.842-30.97,3.172c-9.615,0.985-16.611,9.578-15.627,19.193l.912,8.902 13.95-14.214-26.716,44.352c-2.114,3.622-2.269,8.053-0.43,11.805l22.403,45.75c3.08,6.285 10.641,8.706 16.726,5.722 6.228-3.052 8.749-10.552 5.722-16.726l-19.031-38.825 23.973-41.053-10.414,37.143-.768,2.741 12.829,26.172 34.443-3.016-7.701-75.191 25.73-28.517c2.033-2.254 3.178-5.17 3.219-8.204l.612-45.104c3.917,3.635 6.836,8.259 8.415,13.433l10.505,34.42c1.42,4.654 3.935,8.9 7.333,12.382l36.043,36.93c5.928,6.074 9.052,14.346 8.62,22.822l-2.874,56.391c-0.293,5.751 1.05,11.467 3.874,16.486l25.059,44.532c3.008,5.345 7.56,9.658 13.06,12.373l35.164,17.359c1.947,0.961 4.252,0.849 6.095-0.297 1.844-1.146 2.965-3.163 2.965-5.334v-282.281c0.001-3.468-2.811-6.28-6.279-6.28z" />
        </svg>
    </SvgIcon>

    const { isSuccess: loggedIn } = useAuthenticatedUser();
    const isNonMobileScreens = useMediaQuery("(min-width: 1500px)");

    const drawerWidth = 300;


    return (
        <>
            {/* Hamburger button */}
            {!isNonMobileScreens &&
                <Box position="fixed" top=".7rem" left=".7rem" sx={{ zIndex: 1 }}>
                    <IconButton onClick={() => toggleMobileDrawer(true)} sx={{ minWidth: "70px", minHeight: "70px" }}>
                        <CircleIcon sx={{ position: "absolute", minWidth: "60px", minHeight: "60px", color: "rgba(0, 0, 0, 0)" }} />
                        <MenuIcon sx={{ position: "relative", minWidth: "30px", minHeight: "30px" }} />
                    </IconButton>
                </Box >}


            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant={isNonMobileScreens ? "permanent" : undefined}
                anchor="left"
                open={drawerOpen}
                onClose={() => toggleMobileDrawer(false)}
            >



                <Box sx={{ padding: '1rem' }}>
                    <Typography
                        fontWeight="bold"
                        fontSize="clamp(1rem,2rem,2.25rem)"
                        color="primary"
                        ml="2rem"
                    >
                        BoulderStat
                    </Typography>
                </Box>

                <Divider />
                <List>
                    <ListItem key={"Home"} disablePadding>
                        <ListItemButton onClick={handleHomeButton}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary={"Home"} />
                        </ListItemButton>
                    </ListItem>
                    {loggedIn &&
                        <>
                            <ListItem key={"Log Climb"} disablePadding>
                                <ListItemButton onClick={handleOpenDialog} >
                                    <ListItemIcon>
                                        <UploadIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={"Log Climb"} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem key={"Log Project"} disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <StarIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={"Log Project"} />
                                </ListItemButton>
                            </ListItem>
                        </>
                    }
                </List>
                <Divider />
                <Box sx={{ flexGrow: 1 }} />
                <Divider />
                <List>
                    {loggedIn ?
                        <ListItem key={"Sign Out"} disablePadding>
                            <ListItemButton onClick={logout}>
                                <ListItemIcon>
                                    <ExitToAppIcon />
                                </ListItemIcon>
                                <ListItemText primary={"Sign Out"} />
                            </ListItemButton>
                        </ListItem>
                        : <ListItem key={"Sign In \ Sign Up"} disablePadding>
                            <ListItemButton onClick={signin}>
                                <ListItemIcon>

                                </ListItemIcon>
                                <ListItemText primary={"Sign In"} />
                            </ListItemButton>
                        </ListItem>}



                </List>
            </Drawer>

            <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <CreatePost onSubmit={handleCloseDialog} />
            </Dialog>
        </>
    );
}

