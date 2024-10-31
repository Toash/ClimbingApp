
import { Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import WidgetWrapper from "components/WidgetWrapper.jsx";
import useAuthenticatedUser from "data/useAuthenticatedUser.ts";
import { startOfWeek, endOfWeek, format, isSameDay } from "date-fns";
import getWeekDates from "utils/getWeekDates.js";




/**
 * Shows posts within the current week.
 * @returns 
 */
const Week = () => {
    const { data: userData, isLoading: isUserLoading, isError: isUserError } = useAuthenticatedUser();
    const { data: weeklyPosts, isLoading: isPostsLoading, isError: isPostError } = useQuery({
        enabled: !!userData?.cid,
        queryKey: ["weeklyPosts"],
        queryFn: async () => {
            const response = await fetch(import.meta.env.VITE_APP_API_BASE_URL + `/posts/user/${userData.cid}/weekly`)
            const data = await response.json();
            return data;
        }
    }
    )

    const { palette } = useTheme();
    const { weekDates, startDate, endDate } = getWeekDates();


    if (!startDate || !endDate) return <Typography>Invalid Date range</Typography>;
    if (isUserError) return <Typography>Error loading user</Typography>;
    if (isPostError) return <Typography>Error loading posts</Typography>;


    // Group climbs by day of the week
    const groupClimbsByDay = (weeklyPosts, weekDates) => {
        console.log("weekDates:", weekDates);
        return weekDates.map((date) => ({
            date,
            climbs: (weeklyPosts || []).filter((climb) => {
                console.log("climb date:", new Date(climb.createdAt), "the date:", date);
                return isSameDay(new Date(climb.createdAt), date);
            }),
        }));
    };

    const climbsByDay = groupClimbsByDay(weeklyPosts || [], weekDates);

    return (<WidgetWrapper sx={{ width: "100%" }}>
        <Typography
            variant="h6"
            sx={{
                fontSize: "1.5rem",
                color: palette.neutral.main,
            }}
        >Week</Typography>
        {/* Table for weekly climbs */}
        <TableContainer component={Paper} sx={{ marginTop: "1rem" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {weekDates.map((day) => (

                            <TableCell key={day} align="center">
                                <Typography variant="h6">{format(day, "EEEE")}</Typography>
                                <Typography variant="subtitle2">{format(day, "MMM d")}</Typography>
                            </TableCell>

                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Create rows based on the maximum number of climbs on any single day */}
                    {Array.from({ length: Math.max(...climbsByDay.map(day => day.climbs.length), 1) }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {/* Create a cell for each day in the current row */}
                            {climbsByDay.map((day, colIndex) => (
                                <TableCell key={colIndex} align="center">
                                    {/* Display the climb if available, or a dash if not */}
                                    {day.climbs[rowIndex] ? (
                                        <Typography variant="body2">
                                            {day.climbs[rowIndex].title} - V{day.climbs[rowIndex].vGrade}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: "grey.500" }}>
                                            -
                                        </Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </WidgetWrapper>)
}

export default Week