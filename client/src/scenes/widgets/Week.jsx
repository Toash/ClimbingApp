
import { Typography, useTheme } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper.jsx";


const Week = () => {
    const { palette } = useTheme();
    return (<WidgetWrapper sx={{ width: "100%" }}>
        <Typography
            variant="h6"
            sx={{
                fontSize: "2rem",
                color: palette.neutral.main,
            }}
        >Week</Typography>
    </WidgetWrapper>)
}

export default Week