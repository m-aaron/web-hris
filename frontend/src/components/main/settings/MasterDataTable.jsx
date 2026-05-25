import Button from "../../Button";
import Skeleton from "../../Skeleton";
import EmptyState from "../ui/EmptyState";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell,
} from "../ui/Table";

const StatusBadge = ({ isActive }) => (
    <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
                ? "bg-green-500/10 text-green-600"
                : "bg-red-500/10 text-red-500"
        }`}
    >
        <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
                isActive ? "bg-green-500" : "bg-red-500"
            }`}
        />
        {isActive ? "Active" : "Inactive"}
    </span>
);

const MasterDataTable = ({
    rows,
    loading = false,
    showDescriptions = false,
    onEdit,
    onToggleActive,
    onDelete,
    emptyTitle,
    emptyDescription,
}) => {
    // Columns: No. | Name | [Description] | Status | Actions
    const colCount = showDescriptions ? 5 : 4;

    return (
        <div className="flex-1 overflow-y-auto">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell className="w-[5%]">No.</TableHeaderCell>
                        <TableHeaderCell className={showDescriptions ? "w-[25%]" : "w-[45%]"}>
                            Name
                        </TableHeaderCell>
                        {showDescriptions && (
                            <TableHeaderCell className="w-[30%]">
                                Description
                            </TableHeaderCell>
                        )}
                        <TableHeaderCell className="w-[10%]">Status</TableHeaderCell>
                        <TableHeaderCell className={showDescriptions ? "w-[30%]" : "w-[40%]"}>
                            Actions
                        </TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {loading && Array.from({ length: 6 }).map((_, rowIndex) => (
                        <TableRow key={`master-skeleton-${rowIndex}`}>
                            {Array.from({ length: colCount }).map((__, cellIndex) => (
                                <TableCell key={`master-cell-${rowIndex}-${cellIndex}`}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {!loading && rows.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={colCount} className="py-8">
                                <EmptyState
                                    title={emptyTitle}
                                    description={emptyDescription}
                                    className="max-w-none"
                                />
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && rows.map((row, index) => (
                        <TableRow
                            key={row.id}
                            className={`text-muted transition ${
                                row.is_active === false
                                    ? "opacity-60 hover:opacity-80 hover:bg-soft-surface/50"
                                    : "hover:bg-soft-surface/80"
                            }`}
                        >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium text-heading">
                                {row.name || "-"}
                            </TableCell>
                            {showDescriptions && (
                                <TableCell>{row.descriptions || "-"}</TableCell>
                            )}
                            <TableCell>
                                <StatusBadge isActive={row.is_active !== false} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        size="small"
                                        variant="outline"
                                        onClick={() => onEdit?.(row)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        variant={row.is_active !== false ? "danger" : "secondary"}
                                        onClick={() => onToggleActive?.(row)}
                                    >
                                        {row.is_active !== false ? "Deactivate" : "Activate"}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="ghost"
                                        onClick={() => onDelete?.(row)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default MasterDataTable;
