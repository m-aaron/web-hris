import asyncHandler from "express-async-handler";
import {
    getDashboardSummary,
    getEmployeesBecomingRegularSoon,
    getRegularizationForecast,
} from "../services/dashboardService.js";


export const dashboardSummary = asyncHandler(async (req, res) => {
    const summary = await getDashboardSummary();
    const becomingRegular = await getEmployeesBecomingRegularSoon();
    const forecast = await getRegularizationForecast();

    res.status(200).json({ success: true, summary, becomingRegular, forecast });
});