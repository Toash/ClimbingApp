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
import WIP from 'scenes/widgets/WIP.jsx';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';


export default function SideDrawer({ onPostButtonClicked, onPostCreateResolved }) {

    const { palette } = useTheme();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleMobileDrawer = (open) => {
        console.log("Opening side drawer for mobile view")
        setDrawerOpen(open);
    }

    const handleHomeButton = () => { window.location.href = "/"; };

    // CREATE POST COMPONENT
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);
    const handleOpenCreatePost = () => { setCreatePostOpen(true) };


    const handleCloseCreatePost = () => {
        setCreatePostOpen(false);
        setDrawerOpen(false);
    }


    // WIP COMPONENT
    const [isWIPOpen, setWIPOpen] = useState(false);
    const handleOpenWIP = () => { setWIPOpen(true) }
    const handleCloseWIP = () => { setWIPOpen(false) }

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
                                <ListItemButton onClick={handleOpenCreatePost} >
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
                <List>
                    <ListItemButton onClick={handleOpenWIP}>
                        <ListItemIcon>
                            <QuestionMarkIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Upcoming features"} />
                    </ListItemButton>
                </List>
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

            <Dialog open={isCreatePostOpen} onClose={handleCloseCreatePost} fullWidth maxWidth="md">
                <CreatePost onPostButtonClicked={() => {
                    handleCloseCreatePost();
                    onPostButtonClicked();
                }} onPostCreateResolved={onPostCreateResolved} />
            </Dialog>
            <Dialog open={isWIPOpen} onClose={handleCloseWIP}>
                <WIP></WIP>
            </Dialog>
        </>
    );
}

