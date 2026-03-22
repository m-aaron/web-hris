import API from "../api/axios";

export const getMyProfile = async () => {
    const response = await API.get("/auth/me");
    return response.data;
};

export const updateMyEmail = async (payload) => {
    const response = await API.patch("/auth/me/email", payload);
    return response.data;
};

export const updateMyPassword = async (payload) => {
    const response = await API.patch("/auth/me/password", payload);
    return response.data;
};
