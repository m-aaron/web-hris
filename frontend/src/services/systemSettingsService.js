import API from "../api/axios";

export const getPositions = async () => {
    const response = await API.get("/positions");
    return response.data;
};

export const createPosition = async (payload) => {
    const response = await API.post("/positions", payload);
    return response.data;
};

export const updatePosition = async (id, payload) => {
    const response = await API.patch(`/positions/${id}`, payload);
    return response.data;
};

export const deletePosition = async (id) => {
    const response = await API.delete(`/positions/${id}`);
    return response.data;
};

export const getDesignations = async () => {
    const response = await API.get("/designations");
    return response.data;
};

export const createDesignation = async (payload) => {
    const response = await API.post("/designations", payload);
    return response.data;
};

export const updateDesignation = async (id, payload) => {
    const response = await API.patch(`/designations/${id}`, payload);
    return response.data;
};

export const deleteDesignation = async (id) => {
    const response = await API.delete(`/designations/${id}`);
    return response.data;
};

export const getLeaveTypes = async () => {
    const response = await API.get("/leave/types");
    return response.data;
};

export const createLeaveType = async (payload) => {
    const response = await API.post("/leave/types", payload);
    return response.data;
};

export const updateLeaveType = async (id, payload) => {
    const response = await API.patch(`/leave/types/${id}`, payload);
    return response.data;
};

export const deleteLeaveType = async (id) => {
    const response = await API.delete(`/leave/types/${id}`);
    return response.data;
};
