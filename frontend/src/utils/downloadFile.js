export const downloadFile = async (response, filename) => {
    const contentType = response.headers["content-type"];

    // If backend accidentally returned JSON error
    if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.message || "Export failed.");
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};