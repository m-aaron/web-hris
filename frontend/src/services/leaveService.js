import API from "../api/axios";

export const getLeaveTypes = async () => {
    const response = await API.get("/leave/types");
    return response.data;
};

export const getLeaveApplications = async (params) => {
    const response = await API.get("/leave/applications", { params });
    return response.data;
};

export const createLeaveApplication = async (payload) => {
    const response = await API.post("/leave/applications", payload);
    return response.data;
};

export const approveLeaveApplication = async (id, payload = {}) => {
    const response = await API.patch(`/leave/applications/${id}/approve`, payload);
    return response.data;
};

export const rejectLeaveApplication = async (id, payload) => {
    const response = await API.patch(`/leave/applications/${id}/reject`, payload);
    return response.data;
};

export const getLeaveBalances = async (params) => {
    const response = await API.get("/leave/balances", { params });
    return response.data;
};

export const updateLeaveBalance = async (id, payload) => {
    const response = await API.patch(`/leave/balances/${id}`, payload);
    return response.data;
};

export const getLeaveSummary = async (employeeId) => {
    const response = await API.get(`/leave/summary/${employeeId}`);
    return response.data;
};
