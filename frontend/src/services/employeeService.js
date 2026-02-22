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