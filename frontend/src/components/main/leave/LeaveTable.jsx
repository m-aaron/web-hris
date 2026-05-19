import { Eye, MoreHorizontal, Trash2, Edit } from "lucide-react";

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
    DISAPPROVED: "bg-light-red text-red border border-red",
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
    onStatus,
    onDelete,
    onEdit,
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
                        <TableHeaderCell className="w-[25%]">Employee</TableHeaderCell>
                        <TableHeaderCell className="w-[20%]">Leave Types</TableHeaderCell>
                        <TableHeaderCell className="w-[12%]">Date Filed</TableHeaderCell>
                        <TableHeaderCell className="w-[8%]">Total Days</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Status</TableHeaderCell>
                        <TableHeaderCell className="w-[12%]">Actions</TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {loading && Array.from({ length: 6 }).map((_, rowIndex) => (
                        <TableRow key={`leave-row-${rowIndex}`}>
                            {Array.from({ length: 7 }).map((__, cellIndex) => (
                                <TableCell key={`leave-cell-${rowIndex}-${cellIndex}`}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {!loading && applications.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="py-8">
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
                                        <span className="font-medium text-heading">{formatName(row)}</span>
                                        <span className="text-xs text-muted">{row.employee_no || "-"}</span>
                                    </div>
                                </TableCell>

                                <TableCell>{row.leave_types_display || "-"}</TableCell>
                                <TableCell>{formatPHDate(row.date_filed)}</TableCell>
                                <TableCell>{row.total_days ?? 0}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium border ${statusClass}`}>{row.status}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Eye className="w-6 h-6 text-blue cursor-pointer" onClick={() => onView?.(row)} />
                                        {/* <Edit className="w-6 h-6 text-muted cursor-pointer" onClick={() => onEdit?.(row)} /> */}
                                        <button className="text-sm text-muted hover:text-primary" onClick={() => onStatus?.(row)}>
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                        <button className="text-sm text-muted hover:text-red" onClick={() => onDelete?.(row)}>
                                            <Trash2 className="w-5 h-5" />
                                        </button>
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
