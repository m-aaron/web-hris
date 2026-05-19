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

export const getLeaveApplication = async (id) => {
    const response = await API.get(`/leave/applications/${id}`);
    return response.data;
};

export const updateLeaveStatus = async (id, payload) => {
    const response = await API.patch(`/leave/applications/${id}/status`, payload);
    return response.data;
};

export const deleteLeaveApplication = async (id) => {
    const response = await API.delete(`/leave/applications/${id}`);
    return response.data;
};

export const getLeaveSummary = async (employeeId) => {
    const response = await API.get(`/leave/summary/${employeeId}`);
    return response.data;
};

export const getLeaveOverview = async () => {
    const response = await API.get(`/leave/overview`);
    return response.data;
};

export const updateLeaveApplication = async (id, payload) => {
    const response = await API.patch(`/leave/applications/${id}`, payload);
    return response.data;
};
