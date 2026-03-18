/* Wrapper */
export const Table = ({ children, className = "" }) => {
    return (
        <div className={`w-full overflow-x-auto ${className}`}>
            <table className="w-full text-sm text-left border-collapse">
                {children}
            </table>
        </div>
    );
};

/* Head */
export const TableHead = ({ children, className = "" }) => {
    return (
        <thead className={`text-xs border-b border-border bg-card ${className}`}>
            {children}
        </thead>
    );
};

/* Body */
export const TableBody = ({ children, className = "" }) => {
    return <tbody className={className}>{children}</tbody>;
};

/* Row */
export const TableRow = ({ children, className = "", ...props }) => {
    return (
        <tr className={`border-b border-border ${className}`} {...props}>
            {children}
        </tr>
    );
};

/* Header Cell */
export const TableHeaderCell = ({ children, className = "", ...props }) => {
    return (
        <th
        className={`px-4 py-3 font-semibold text-heading ${className}`}
        {...props}
        >
            {children}
        </th>
    );
};

/* Data Cell */
export const TableCell = ({ children, className = "", ...props }) => {
    return (
        <td className={`px-4 py-3 ${className}`} {...props}>
        {children}
        </td>
    );
};
