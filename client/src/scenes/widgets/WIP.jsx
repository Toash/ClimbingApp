import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";

export default function WIP() {

    return (
        <>
            <DialogTitle>
                Upcoming features:
            </DialogTitle>
            <DialogContent dividers>

                <br />
                <Typography gutterBottom>
                    - Logging sessions (keep track of hrs per week)
                </Typography>
                <br />
                <Typography gutterBottom>
                    - Set goals
                </Typography>
                <br />
                <Typography gutterBottom>
                    - Graph based on performance
                </Typography>
                <br />
                <Typography gutterBottom>
                    - Logging Projects
                    <br />Specify crux(es)
                    <br />Log links (based off of total moves in the climb.)

                </Typography>
                <br />
                <Typography gutterBottom>
                    - Logging Injuries
                </Typography>
            </DialogContent>
        </>
    )
}