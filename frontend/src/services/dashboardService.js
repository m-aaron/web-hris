import API from "../api/axios.js";

export const getDashboardSummary = async () => {
    const response = await API.get("/dashboard/summary");
    console.log("Dashboard Summary Response:", response.data);
    return response.data;
};