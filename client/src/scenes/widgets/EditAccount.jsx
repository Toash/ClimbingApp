import { Dialog, DialogTitle, FormControl, InputLabel, TextField, Input, Typography, useTheme, Divider } from "@mui/material";
import { Box } from "@mui/system";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function EditAccount({ open, onClose, firstTime = true, data }) {
    const [userName, setUserName] = useState(data?.userName || "");
    const [profilePicturePath, setProfilePicturePath] = useState(data?.profilePicturePath || "")

    const { palette } = useTheme();

    const onDrop = useCallback((acceptedFiles) => {

    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth>
            <DialogTitle sx={{ fontSize: "1.5rem" }} align="center">
                {firstTime ? "Welcome! " : "Edit user info"}

            </DialogTitle>
            <Divider />
            <FormControl sx={{ margin: "1.5rem ", gap: "2rem" }}>
                <Box>
                    <TextField
                        label="Username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        fullWidth
                    ></TextField>
                </Box>

                <Box sx={{ cursor: "pointer", padding: "1rem", outline: `solid ${palette.primary.main}` }} {...getRootProps()}>
                    <Input {...getInputProps()} />
                    {
                        <Typography>Drag and Drop or Click to Browse</Typography>
                    }
                </Box>
            </FormControl>


        </Dialog>
    )
}