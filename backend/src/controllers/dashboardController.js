import asyncHandler from "express-async-handler";
import {
    getDashboardSummary,
    getEmployeesBecomingRegularSoon,
    getRegularizationForecast,
} from "../services/dashboardService.js";


// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
export const dashboardSummary = asyncHandler(async (req, res) => {

    const [
        summary,
        becomingRegular,
        forecast
    ] = await Promise.all([
        getDashboardSummary(),
        getEmployeesBecomingRegularSoon(),
        getRegularizationForecast()
    ]);

    res.status(200).json({ success: true, summary, becomingRegular, forecast });
});