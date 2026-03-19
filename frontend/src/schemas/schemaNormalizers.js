export const normalizeNullToEmptyString = (value) =>
    value === null || value === undefined ? "" : value;

export const nullishToUndefined = (value) =>
    value === null || value === undefined || value === "" ? undefined : value;
