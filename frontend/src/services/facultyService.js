import API from "../api/axios";

export const getFaculties = (params) => {
  return API.get("/faculties", { params });
};

export const createFaculty = async (payload) => {
  const res = await API.post("/faculties", payload);
  return res.data;
};

export const updateFaculty = async (id, payload) => {
  const res = await API.put(`/faculties/${id}`, payload);
  return res.data;
};

export const deleteFaculty = async (id) => {
  const res = await API.delete(`/faculties/${id}`);
  return res.data;
};

export const getFacultyById = async (id) => {
  const res = await API.get(`/faculties/${id}`);
  return res.data;

};

export const getDepartments = (params) => {
  return API.get("/departments");
};
