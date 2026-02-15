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
                            <TableRow key={index} className="text-muted hover:bg-[rgba(66,73,77,0.1)] transition">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{row.full_name}</TableCell>
                                <TableCell>{row.employment_type.replace("_", "-")}</TableCell>
                                <TableCell>{formatPHDate(row.regularization_date)}</TableCell>
                                <TableCell className="text-amber-600 font-medium">
                                    {row.days_remaining}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}