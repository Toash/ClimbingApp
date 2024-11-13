import { Dialog, DialogTitle, DialogContent, Typography, Link, Box } from "@mui/material";

export default function Attributions() {

    return (
        <>
            <DialogTitle>
                Attributions
            </DialogTitle>
            <DialogContent dividers>

                <Box>
                    <Link
                        href="https://www.flaticon.com/free-icons/radio-cassette"
                        title="radio cassette icons"
                        target="_blank"
                        rel="noopener"
                    >Radio cassette icons created by PIXARTIST - Flaticon</Link>
                </Box>
                <Box>
                    <Link
                        href="https://www.flaticon.com/free-icons/salute"
                        title="salute icons"
                        target="_blank"
                        rel="noopener"
                    >Salute icons created by msidiqf - Flaticon</Link>
                </Box>

            </DialogContent>
        </>
    )
}