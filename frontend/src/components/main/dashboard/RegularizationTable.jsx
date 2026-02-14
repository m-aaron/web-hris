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

export const RegularizationPreviewTable = () => {
    return (
        <Card className="rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-heading">
                    Employees Becoming Regular Soon
                </h3>

                <Table>
                    <TableHead>
                        <TableRow className="text-heading">
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Type</TableHeaderCell>
                            <TableHeaderCell>Regularization Date</TableHeaderCell>
                            <TableHeaderCell>Days Remaining</TableHeaderCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        <TableRow className="text-muted hover:bg-[rgba(66,73,77,0.1)] transition">
                            <TableCell>Juan Dela Cruz</TableCell>
                            <TableCell>Teaching</TableCell>
                            <TableCell>March 15, 2026</TableCell>
                            <TableCell className="text-amber-600 font-medium">
                                30
                            </TableCell>
                        </TableRow>

                        <TableRow className="text-muted hover:bg-[rgba(66,73,77,0.1)] transition">
                            <TableCell>Maria Santos</TableCell>
                            <TableCell>Non-Teaching</TableCell>
                            <TableCell>March 28, 2026</TableCell>
                            <TableCell className="text-red-600 font-medium">
                                12
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}