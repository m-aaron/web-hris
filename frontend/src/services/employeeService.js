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



// PERSONAL SECTION
export const updatePersonalData = async (id, personalData) => {
    const response = await API.put(`/employees/${id}/personal/update`, personalData);
    return response.data;
}



// FAMILY SECTION
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



// EMPLOYMENT SECTION
export const updateEmploymentData = async (id, employmentData) => {
    const response = await API.put(`/employees/${id}/employment/update`, employmentData);
    return response.data;
}



// EDUCATION SECTION
// Qualification
export const saveQualificationData = async (id, qualificationData) => {
    const response = await API.post(`/employees/${id}/education`, qualificationData);
    return response.data;
}

export const updateQualificationData = async (employeeId, qualificationID, qualificationData) => {
    const response = await API.put(`/employees/${employeeId}/education/${qualificationID}`, qualificationData);
    return response.data;
}

export const deleteQualificationData = async (employeeId, qualificationID) => {
    const response = await API.delete(`/employees/${employeeId}/education/${qualificationID}`);
    return response.data;
}

// Major
export const saveMajorData = async (educationId, majorData) => {
    const response = await API.post(`/employees/${educationId}/major`, majorData);
    return response.data;
}

export const updateMajorData = async (educationId, majorId, majorData) => {
    const response = await API.put(`/employees/${educationId}/major/${majorId}`, majorData);
    return response.data;
}

export const deleteMajorData = async (educationId, majorId) => {
    const response = await API.delete(`/employees/${educationId}/major/${majorId}`);
    return response.data;
}

// Minor
export const saveMinorData = async (educationId, minorData) => {
    const response = await API.post(`/employees/${educationId}/minor`, minorData);
    return response.data;
}

export const updateMinorData = async (educationId, minorId, minorData) => {
    const response = await API.put(`/employees/${educationId}/minor/${minorId}`, minorData);
    return response.data;
}

export const deleteMinorData = async (educationId, minorId) => {
    const response = await API.delete(`/employees/${educationId}/minor/${minorId}`);
    return response.data;
}

// Honor
export const saveHonorData = async (educationId, honorData) => {
    const response = await API.post(`/employees/${educationId}/honor`, honorData);
    return response.data;
}

export const updateHonorData = async (educationId, honorId, honorData) => {
    const response = await API.put(`/employees/${educationId}/honor/${honorId}`, honorData);
    return response.data;
}

export const deleteHonorData = async (educationId, honorId) => {
    const response = await API.delete(`/employees/${educationId}/honor/${honorId}`);
    return response.data;
}

// Scholarship
export const saveScholarshipData = async (educationId, scholarshipData) => {
    const response = await API.post(`/employees/${educationId}/scholarship`, scholarshipData);
    return response.data;
}

export const updateScholarshipData = async (educationId, scholarshipId, scholarshipData) => {
    const response = await API.put(`/employees/${educationId}/scholarship/${scholarshipId}`, scholarshipData);
    return response.data;
}

export const deleteScholarshipData = async (educationId, scholarshipId) => {
    const response = await API.delete(`/employees/${educationId}/scholarship/${scholarshipId}`);
    return response.data;
}



// EXAM SECTION
export const saveExaminationTaken = async (employeeId, examinationData) => {
    const response = await API.post(`/employees/${employeeId}/examination-taken`, examinationData);
    return response.data;
}

export const updateExaminationTaken = async (employeeId, examId, examinationData) => {
    const response = await API.put(`/employees/${employeeId}/examination-taken/${examId}`, examinationData);
    return response.data;
}

export const deleteExaminationTaken = async (employeeId, examId) => {
    const response = await API.delete(`/employees/${employeeId}/examination-taken/${examId}`);
    return response.data;
}



// TRAINING SECTION
export const saveTrainingProgram = async (employeeId, trainingData) => {
    const response = await API.post(`/employees/${employeeId}/training`, trainingData);
    return response.data;
}

export const updateTrainingProgram = async (employeeId, trainingId, trainingData) => {
    const response = await API.put(`/employees/${employeeId}/training/${trainingId}`, trainingData);
    return response.data;
}

export const deleteTrainingProgram = async (employeeId, trainingId) => {
    const response = await API.delete(`/employees/${employeeId}/training/${trainingId}`);
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