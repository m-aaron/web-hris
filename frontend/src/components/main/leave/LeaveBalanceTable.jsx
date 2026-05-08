import { useState } from "react";
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
import ConfirmModal from "../ui/ConfirmModal";
import { formatEmployeeDisplayName } from "../../../helpers/employeeHelper";

const getRemainingStyle = (remaining) => {
    if (remaining <= 0) return "text-red";
    if (remaining <= 5) return "text-yellow";
    return "text-green";
};

const LeaveBalanceTable = ({ balances, loading = false, onSave }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ total_entitlement: "", used_days: "" });
    const [confirmRow, setConfirmRow] = useState(null);

    const startEdit = (row) => {
        setEditingId(row.id);
        setEditValues({
            total_entitlement: row.total_entitlement,
            used_days: row.used_days,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({ total_entitlement: "", used_days: "" });
    };

    const handleSave = async (row) => {
        const success = await onSave?.(row.id, editValues);
        if (success) cancelEdit();
    };

    const requestSave = (row) => {
        setConfirmRow(row);
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell className="w-[5%]">No.</TableHeaderCell>
                        <TableHeaderCell className="w-[25%]">Employee</TableHeaderCell>
                        <TableHeaderCell className="w-[15%]">Leave Type</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Year</TableHeaderCell>
                        <TableHeaderCell className="w-[12%]">Total Entitlement</TableHeaderCell>
                        <TableHeaderCell className="w-[12%]">Used Days</TableHeaderCell>
                        <TableHeaderCell className="w-[12%]">Remaining</TableHeaderCell>
                        <TableHeaderCell className="w-[9%]">Actions</TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {loading && Array.from({ length: 6 }).map((_, rowIndex) => (
                        <TableRow key={`balance-row-${rowIndex}`}>
                            {Array.from({ length: 8 }).map((__, cellIndex) => (
                                <TableCell key={`balance-cell-${rowIndex}-${cellIndex}`}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {!loading && balances.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="py-8">
                                <EmptyState
                                    title="No leave balances found"
                                    description="Select a different year or employee to see balances."
                                    className="max-w-none"
                                />
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && balances.map((row, index) => {
                        const isEditing = editingId === row.id;
                        const remaining = Number(row.total_entitlement || 0) - Number(row.used_days || 0);

                        return (
                            <TableRow key={row.id} className="text-muted hover:bg-soft-surface/80 transition">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-heading">
                                            {formatEmployeeDisplayName(row, row.employee_name || "N/A")}
                                        </span>
                                        <span className="text-xs text-muted">{row.employee_no || "-"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{row.leave_type || "-"}</TableCell>
                                <TableCell>{row.year}</TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            className="w-24 rounded-xl border border-border bg-card px-2 py-1 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={editValues.total_entitlement}
                                            onChange={(event) =>
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    total_entitlement: event.target.value,
                                                }))
                                            }
                                        />
                                    ) : (
                                        row.total_entitlement
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            className="w-24 rounded-xl border border-border bg-card px-2 py-1 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                                            value={editValues.used_days}
                                            onChange={(event) =>
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    used_days: event.target.value,
                                                }))
                                            }
                                        />
                                    ) : (
                                        row.used_days
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className={`font-semibold ${getRemainingStyle(remaining)}`}>
                                        {Number.isFinite(remaining) ? remaining : "-"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    size="small"
                                                    onClick={() => requestSave(row)}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="secondary"
                                                    onClick={cancelEdit}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="small"
                                                variant="outline"
                                                onClick={() => startEdit(row)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {confirmRow && (
                <ConfirmModal
                    title="Save leave balance changes?"
                    description="This will update the employee leave balance for the selected year."
                    action="Save"
                    onCancel={() => setConfirmRow(null)}
                    onConfirm={async () => {
                        await handleSave(confirmRow);
                        setConfirmRow(null);
                    }}
                />
            )}
        </div>
    );
};

export default LeaveBalanceTable;
