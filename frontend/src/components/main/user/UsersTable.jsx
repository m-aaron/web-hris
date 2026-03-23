import Button from "../../Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "../ui/Table";
import { formatEmployeeDisplayName } from "../../../helpers/employeeHelper";
import Skeleton from "../../Skeleton";
import EmptyState from "../ui/EmptyState";

const UsersTable = ({ users, onEdit, loading = false }) => {

    const formatName = (row) => {
        return formatEmployeeDisplayName(row, "N/A");
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-heading">
                Users
            </h3>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell className="w-[5%]">No.</TableHeaderCell>
                        <TableHeaderCell className="w-[30%]">Full Name</TableHeaderCell>
                        <TableHeaderCell className="w-[25%]">Email</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Employee No</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Role</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Status</TableHeaderCell>
                        <TableHeaderCell className="w-[10%]">Actions</TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody className="divide-y">
                    {loading && Array.from({ length: 6 }).map((_, rowIndex) => (
                        <TableRow key={`users-skeleton-${rowIndex}`}>
                            <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-16 rounded-xl" /></TableCell>
                        </TableRow>
                    ))}

                    {!loading && users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="py-8">
                                <EmptyState
                                    title="No users found"
                                    description="Create a new user or adjust account filters."
                                    className="max-w-none"
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        !loading && users.map((user, index) => (
                            <TableRow key={user.id} className="text-muted hover:bg-soft-surface/80 transition">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{formatName(user)}</TableCell>
                                <TableCell>{user.email || "-"}</TableCell>
                                <TableCell>{user.employee_no || "-"}</TableCell>
                                <TableCell>{user.role || "-"}</TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium border ${
                                            user.status === "active"
                                                ? "bg-light-green text-green border-green"
                                                : "bg-light-red text-red border-red"
                                        }`}
                                    >
                                        {user.status === "active" ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="small"
                                            variant="outline"
                                            onClick={() => onEdit(user)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default UsersTable;
