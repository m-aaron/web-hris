const hasValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;

    if (typeof value === "object") {
        return Object.values(value).some(hasValue);
    }

    return false;
};

export const getEmployeeSectionStatus = (employee) => {

    if (!employee) return {};

    return {

        employee: hasValue(employee.employee),
        personal: hasValue(employee.personal),
        family: hasValue(employee.family),
        children: employee.children?.length > 0,
        employment: hasValue(employee.employment),
        education: employee.education?.length > 0,
        examinations: employee.examinations?.length > 0,
        trainings: employee.trainings?.length > 0,
        history: employee.history?.length > 0,
        otherInfo: hasValue(employee.other_information),
        references: employee.references?.length > 0
    };

};


export const calculateEmployeeProgress = (employee) => {

    const status = getEmployeeSectionStatus(employee);
    const sections = Object.values(status);
    if (sections.length === 0) return 0;

    const completed = sections.filter(Boolean).length;

    return Math.round((completed / sections.length) * 100);

};