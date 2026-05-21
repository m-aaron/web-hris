import API from "../api/axios";

export const getDepartments = async () => {
    const response = await API.get("/departments");
    return response.data;
}