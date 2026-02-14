import React from "react";

/* Wrapper */
export const Table = ({ children, className = "" }) => {
    return (
        <div className={`w-full overflow-x-auto ${className}`}>
        <table className="w-full text-sm text-left border-collapse">
            {children}
        </table>
        </div>
    );
}

/* Head */
export const TableHead = ({ children }) => {
    return (
        <thead className="border-b bg-gray-50">
        {children}
        </thead>
    );
}

/* Body */
export const TableBody = ({ children }) => {
    return <tbody>{children}</tbody>;
}

/* Row */
export const TableRow = ({ children, className = "" }) => {
    return (
        <tr className={`border-b last:border-0 ${className}`}>
        {children}
        </tr>
    );
}

/* Header Cell */
export const TableHeaderCell = ({ children }) => {
    return (
        <th className="px-4 py-3 font-semibold text-gray-600">
        {children}
        </th>
    );
}

/* Data Cell */
export const TableCell = ({ children, className = "" }) => {
    return (
        <td className={`px-4 py-3 ${className}`}>
        {children}
        </td>
    );
}