import React from "react";
import { Card } from "../ui/Card";
import { CardContent } from "./CardContent";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell,
} from "../ui/Table";
import { formatPHDate } from "../../../helpers/dateHelper";
import { formatEmployeeDisplayName } from "../../../helpers/employeeHelper";

export const RegularizationPreviewTable = ({ becomingRegular }) => {
    return (
        <Card className="rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-heading">
            Employees Becoming Regular Soon
            </h3>

            <Table>
            <TableHead>
                <TableRow className="text-heading">
                <TableHeaderCell>No.</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Regularization Date</TableHeaderCell>
                <TableHeaderCell>Days Remaining</TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {becomingRegular.map((row, index) => (
                <TableRow
                    key={index}
                    className="text-muted hover:bg-[rgba(66,73,77,0.1)] transition"
                >
                    {(() => {
                    const normalizedName = {
                        last_name: row.last_name ?? row.lastName,
                        first_name: row.first_name ?? row.firstName,
                        middle_name: row.middle_name ?? row.middleName,
                        name_extension: row.name_extension ?? row.nameExtension,
                    };
                    const displayName =
                        formatEmployeeDisplayName(normalizedName, "") ||
                        row.full_name ||
                        row.fullName ||
                        "N/A";

                    return (
                    <>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{displayName}</TableCell>
                    <TableCell>{row.employment_type.replace("_", "-")}</TableCell>
                    <TableCell>{formatPHDate(row.regularization_date)}</TableCell>
                    <TableCell className="text-amber-600 font-medium">
                    {row.days_remaining}
                    </TableCell>
                    </>
                    );
                    })()}
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    );
};
