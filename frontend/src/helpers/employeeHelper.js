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

export const formatFullName = (name) => {
    if (!name) return null

        const lastName = name.last_name?.trim()
        const firstName = name.first_name?.trim()
        const middleName = name.middle_name?.trim()
        const extension = name.name_extension?.trim()

        const left = lastName || ""
        const rightParts = [firstName, middleName, extension].filter(
            (part) => part !== null && part !== undefined && String(part).trim() !== ""
        )
        const right = rightParts.join(" ")

        if (left && right) return `${left}, ${right}`
        if (left) return left
        return right || null
    }

export const formatAddress = (address) => {
    if (!address) return null

    const parts = [
        address.house_no,
        address.street,
        address.barangay,
        address.city,
        address.province,
        address.zip,
    ].filter((part) => part !== null && part !== undefined && String(part).trim() !== "")

    return parts.length > 0 ? parts.join(", ") : null
}