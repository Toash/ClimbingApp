
import { Typography, useTheme } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper.jsx";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";
import { startOfWeek, endOfWeek } from "date-fns";
import { useEffect } from "react";

/**
 * 
 * @returns returns start and end dates for the current week.
 */
const getCurrentWeek = () => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    return { start, end }
}




const Week = () => {
    const { data } = useAuthenticatedUser();
    useEffect(() => {
        const { start, end } = getCurrentWeek();

        const fetchWeeklyClimes = async () => {
        }

    }, []);


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