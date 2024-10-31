import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

/**
 * Get all dates for the week of a specified date.
 * @param {Date} date - Any date within the week you want to get.
 * @param {number} weekStartsOn - Day to start the week on (0 for Sunday, 1 for Monday).
 * @returns {Object} Contains startDate, endDate, and a list of formatted dates for the week.
 */
const getWeekDates = (date = new Date(), weekStartsOn = 1) => {
    const startDate = startOfWeek(date, { weekStartsOn });
    const endDate = endOfWeek(date, { weekStartsOn });

    // Get each day of the week as a formatted string (e.g., 'yyyy-MM-dd')
    const weekDates = eachDayOfInterval({ start: startDate, end: endDate })

    return {
        startDate,
        endDate,
        weekDates,
    };
};

export default getWeekDates;
