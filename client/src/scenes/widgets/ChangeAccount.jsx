import { Dialog, DialogTitle, TextField } from "@mui/material";

export default function ChangeAccount({ open, onClose }) {
    return (
        <Dialog
            open={true}
            onClose={onClose}>
            <DialogTitle
            >
                {"Welcome to BoulderStat!"}
            </DialogTitle>
            <TextField></TextField>
        </Dialog>
    )
}