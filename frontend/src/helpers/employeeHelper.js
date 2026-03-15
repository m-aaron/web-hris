export const calculateAge = (birthDate) => {
    if (!birthDate) return "-";

    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    
    return age;
};

export const formatEnum = (value) => {
    if (!value) return "-";

    return value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};


export const createEmployeeTemplate = () => ({
    employee: {},
    personal: {
        address: {}
    },
    family: {
        spouse: {},
        nearest_kin_name: {},
        nearest_kin_address: {}
    },
    children: [],
    employment: {},
    education: [],
    education_majors: [],
    education_minors: [],
    education_honors: [],
    education_scholarships: [],
    examination: [],
    training: [],
    history: [],
    other_information: {},
    reference: []
})