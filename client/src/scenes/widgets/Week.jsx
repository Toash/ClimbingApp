
import { Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from "@mui/material";
import { Box, Container } from "@mui/system";
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
    const { data: userData, isLoading: isUserLoading, isError: isUserError, isSuccess: loggedIn } = useAuthenticatedUser();
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


    /**
     * Groups climbs by day based on the provided week dates.
     *
     * @param {Array} weeklyPosts - An array of climb objects, each containing a `createdAt` property.
     * @param {Array} weekDates - An array of Date objects representing the days of the week.
     * @returns {Array} An array of objects, each containing a `date` and an array of `climbs` for that date.
     */
    const groupClimbsByDay = (weeklyPosts, weekDates) => {
        return weekDates.map((date) => ({
            date,
            climbs: (weeklyPosts || []).filter((climb) => isSameDay(new Date(climb.createdAt), date)),

        }));
    };


    const climbsByDay = groupClimbsByDay(weeklyPosts || [], weekDates);
    const weeklyPostsLength = weeklyPosts?.length || 0;

    if (loggedIn) {
        return (<WidgetWrapper sx={{ width: "100%" }}>
            <Typography
                variant="h6"
                sx={{
                    fontSize: "1.5rem",
                    color: palette.neutral.main,
                }}
            >Your week so far</Typography>
            <Divider />
            <Typography>Grade Breakdown</Typography>
            <Typography>Angle Preference</Typography>
            <Typography>Style preference</Typography>
            {/* Table for weekly climbs */}
            <TableContainer component={WidgetWrapper} sx={{ marginTop: "1rem" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {weekDates.map((day) => (

                                <TableCell key={day} align="center" sx={{
                                    "outline": isSameDay(day, new Date()) ? 3 : null,
                                    "borderRadius": isSameDay(day, new Date()) ? 3 : null,
                                    "outlineColor": isSameDay(day, new Date()) ? palette.primary.main : null
                                }}>
                                    <Typography variant="h6">{format(day, "EEEE")}</Typography>
                                    <Typography variant="subtitle2">{format(day, "MMM d")}</Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/*Create empty array of specified length, map each entry to a TableRow. 
                        Number of rows are based on the max number of climbs in a given day for the week.  */}
                        {Array.from({ length: Math.max(...climbsByDay.map(day => day.climbs.length), 1) }).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {/* Create a cell for each day in the current row */}
                                {climbsByDay.map((day, colIndex) => (

                                    <TableCell key={colIndex} align="center" >
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

            {/*Proportions*/}

        </WidgetWrapper>)
    }
}

export default Week