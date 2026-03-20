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

const UsersTable = ({ users, onEdit }) => {

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
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted">
                                No users found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user, index) => (
                            <TableRow key={user.id} className="text-muted hover:bg-[rgba(66,73,77,0.1)] transition">
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
