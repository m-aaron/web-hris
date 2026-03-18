export const formatPHDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    }).format(date);
};

export const formatDateRange = (from, to) => {
    if (!from && !to) return "—"

    const formattedFrom = from ? formatPHDate(from) : ""
    const formattedTo = to ? formatPHDate(to) : "Present"

    return `${formattedFrom} - ${formattedTo}`
}