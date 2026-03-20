import API from "../api/axios";

export const getUsers = async () => {
    const response = await API.get("/users");
    return response.data;
};

export const getLinkableEmployees = async () => {
    const response = await API.get("/users/linkable-employees");
    return response.data;
};

export const createUser = async (payload) => {
    const response = await API.post("/users", payload);
    return response.data;
};

export const updateUser = async (userId, payload) => {
    const response = await API.patch(`/users/${userId}`, payload);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
};

export const linkUserToEmployee = async (userId, employeeId) => {
    const response = await API.patch(`/users/${userId}/link-employee`, { employeeId });
    return response.data;
};

export const activateUser = async (userId) => {
    const response = await API.patch(`/users/${userId}/activate`);
    return response.data;
};

export const deactivateUser = async (userId) => {
    const response = await API.patch(`/users/${userId}/deactivate`);
    return response.data;
};

export const unlinkUserFromEmployee = async (userId) => {
    const response = await API.patch(`/users/${userId}/unlink-employee`);
    return response.data;
};
