import API from "../api/axios";

// Get Employees with optional filters
export const getEmployees = (params) => {
    return API.get("/employees", { params });
};

// Archive Employee
export const archiveEmployee = async (id) => {
    const response = await API.put(`/employees/${id}/archive`);
    
    return response.data;
};

// Bulk Archive Employees
export const bulkArchiveEmployees = async (ids) => {
    const response = await API.put("/employees/bulk-archive", {
        ids,
    });

    return response.data;
};

// Change Employee Status
export const changeEmployeeStatus = async (id, status) => {
    const response = await API.put(`/employees/${id}/status`, {
        newStatus: status,
    });

    return response.data;
};

// Export Employees to Excel
export const exportEmployeesExcel = async (query) => {
    return await API.get("/employees/export", {
        params: query,
        responseType: "blob",
    });
};

// Export Selected Employees to Excel
export const exportSelectedEmployeesExcel = async (ids) => {
    return await API.post("/employees/export-selected", 
        { ids }, 
        { responseType: "blob" }
    );
};

// Get Employee by ID
export const getEmployeeById = async (id) => {
    const response = await API.get(`/employees/${id}`);
    return response.data;
}


// IDENTITY SECTION
export const updateEmployeeType = async (id, payload) => {
    const res = await API.put(`/employees/${id}`, payload);
    return res.data
}

export const updateEmployeePhoto = async (id, formData) => {
    const res = await API.put(`/employees/${id}/photo`, formData,
        {
            headers: { "Content-Type": "multipart/form-data" }
        }
    )
    return res.data
}


// Update Employee Personal Data
export const updatePersonalData = async (id, personalData) => {
    const response = await API.put(`/employees/${id}/personal/update`, personalData);
    return response.data;
}

export const updateFamilyData = async (id, familyData) => {
    const response = await API.put(`/employees/${id}/family/update`, familyData);
    return response.data;
}


// CHILDREN SECTION
export const saveChildrenData = async (id, childrenData) => {
    const response = await API.post(`/employees/${id}/children`, childrenData);
    return response.data;
}

export const updateChildrenData = async (employeeId, childId, childrenData) => {
    const response = await API.put(`/employees/${employeeId}/children/${childId}`, childrenData);
    return response.data;
}

export const deleteChildrenData = async (employeeId, childId) => {
    const response = await API.delete(`/employees/${employeeId}/children/${childId}`);
    return response.data;
}



export const updateEmploymentData = async (id, employmentData) => {
    const response = await API.put(`/employees/${id}/employment/update`, employmentData);
    return response.data;
}



export const getAllPositions = async () => {
    const response = await API.get("/employees/positions");
    return response.data;
}

export const getAllDesignations = async () => {
    const response = await API.get("/employees/designations");
    return response.data;
}