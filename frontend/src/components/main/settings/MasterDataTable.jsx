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

const MasterDataTable = ({
    rows,
    loading = false,
    showDescriptions = false,
    onEdit,
    onDelete,
    emptyTitle,
    emptyDescription,
}) => {
    const colCount = showDescriptions ? 4 : 3;

    return (
        <div className="flex-1 overflow-y-auto">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell className="w-[5%]">No.</TableHeaderCell>
                        <TableHeaderCell className={showDescriptions ? "w-[30%]" : "w-[70%]"}>
                            Name
                        </TableHeaderCell>
                        {showDescriptions && (
                            <TableHeaderCell className="w-[45%]">
                                Descriptions
                            </TableHeaderCell>
                        )}
                        <TableHeaderCell className={showDescriptions ? "w-[20%]" : "w-[25%]"}>
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
                        <TableRow key={row.id} className="text-muted hover:bg-soft-surface/80 transition">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium text-heading">
                                {row.name || "-"}
                            </TableCell>
                            {showDescriptions && (
                                <TableCell>{row.descriptions || "-"}</TableCell>
                            )}
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
                                        variant="danger"
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
