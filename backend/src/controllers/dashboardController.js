import asyncHandler from "express-async-handler";
import {
    getDashboardSummary,
    getEmployeesBecomingRegularSoon,
    getRegularizationForecast,
    getBirthdaysToday
} from "../services/dashboardService.js";


// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
export const dashboardSummary = asyncHandler(async (req, res) => {

    const [
        summary,
        becomingRegular,
        forecast,
        birthdaysToday
    ] = await Promise.all([
        getDashboardSummary(),
        getEmployeesBecomingRegularSoon(),
        getRegularizationForecast(),
        getBirthdaysToday()
    ]);

    res.status(200).json({ 
        success: true, 
        message: "Dashboard loaded successfully", 
        data: { summary, becomingRegular, forecast, birthdaysToday }
    });
});