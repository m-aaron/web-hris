import { Eye, CheckCircle, XCircle } from "lucide-react";

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell,
} from "../ui/Table";
import Button from "../../Button";
import Skeleton from "../../Skeleton";
import EmptyState from "../ui/EmptyState";
import { formatPHDate } from "../../../helpers/dateHelper";
import { formatEmployeeDisplayName, formatEnum } from "../../../helpers/employeeHelper";

const statusStyles = {
    PENDING: "bg-light-yellow text-yellow border border-yellow",
    APPROVED: "bg-light-green text-green border border-green",
    REJECTED: "bg-light-red text-red border border-red",
};

const truncateText = (value, max = 36) => {
    if (!value) return "-";
    if (value.length <= max) return value;
    return `${value.slice(0, max)}...`;
};

const LeaveTable = ({
    applications,
    loading = false,
    onView,
    onApprove,
    onReject,
}) => {
    const formatName = (row) => {
        return formatEmployeeDisplayName(row, "N/A");
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell className="w-[1%]">No.</TableHeaderCell>
                        <TableHeaderCell className="w-[17%]">Employee</TableHeaderCell>
                        <TableHeaderCell className="w-[12%]">Leave Type</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Date From</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Date To</TableHeaderCell>
                        <TableHeaderCell className="w-[6%]">Days</TableHeaderCell>
                        <TableHeaderCell className="w-[25%]">Reason</TableHeaderCell>
                        <TableHeaderCell className="w-[9%]">Status</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Actions</TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {loading && Array.from({ length: 6 }).map((_, rowIndex) => (
                        <TableRow key={`leave-row-${rowIndex}`}>
                            {Array.from({ length: 9 }).map((__, cellIndex) => (
                                <TableCell key={`leave-cell-${rowIndex}-${cellIndex}`}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {!loading && applications.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="py-8">
                                <EmptyState
                                    title="No leave applications found"
                                    description="Try adjusting your filters or date range."
                                    className="max-w-none"
                                />
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && applications.map((row, index) => {
                        const statusClass = statusStyles[row.status] || "bg-grey text-muted border border-muted";

                        return (
                            <TableRow key={row.id} className="text-muted hover:bg-soft-surface/80 transition">
                                <TableCell>{index + 1}</TableCell>

                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-heading">
                                            {formatName(row)}
                                        </span>
                                        <span className="text-xs text-muted">{row.employee_no || "-"}</span>
                                    </div>
                                </TableCell>

                                <TableCell>{row.leave_type || "-"}</TableCell>
                                <TableCell>{formatPHDate(row.date_from)}</TableCell>
                                <TableCell>{formatPHDate(row.date_to)}</TableCell>
                                <TableCell>{row.number_of_days || "-"}</TableCell>
                                <TableCell title={row.reason || ""}>
                                    {truncateText(row.reason)}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium border ${statusClass}`}>
                                        {formatEnum(row.status)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Eye
                                            className="w-6 h-6 text-blue cursor-pointer"
                                            onClick={() => onView?.(row)}
                                        />
                                        {row.status === "PENDING" && (
                                            <>
                                                <CheckCircle
                                                    className="w-5 h-5 text-green cursor-pointer"
                                                    onClick={() => onApprove?.(row)}
                                                />
                                                <XCircle
                                                    className="w-5 h-5 text-red cursor-pointer"
                                                    onClick={() => onReject?.(row)}
                                                />
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default LeaveTable;
