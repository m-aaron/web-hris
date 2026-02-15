import React from "react";
import { Card } from "../../ui/Card";
import { CardContent } from "../CardContent";
import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label
} from "recharts";

export const EmployeeTypeChart = ({ summary }) => {

    if (!summary) return null;

    const employeeTypeData = [
        {
            name: "Teaching",
            value: Number(summary.total_teaching) || 0,
            fill: "#3b82f6"
        },
        {
            name: "Non-Teaching",
            value: Number(summary.total_non_teaching) || 0,
            fill: "#10b981"
        }
    ];

    const totalEmployees = employeeTypeData.reduce(
        (acc, curr) => acc + curr.value,
        0
    );

    const hasData = totalEmployees > 0;

    return (
        <Card className="rounded-2xl shadow-sm bg-card hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6" style={{ height: 340 }}>
                <h3 className="text-heading text-lg font-semibold mb-6">
                    Employee Type Distribution
                </h3>

                {hasData ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={employeeTypeData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={75}
                                outerRadius={105}
                                paddingAngle={4}
                            >
                                <Label
                                    content={(props) => {
                                        const { viewBox } = props || {};
                                        if (!viewBox) return null;
                                        const { cx, cy } = viewBox;

                                        return (
                                            <text
                                                x={cx}
                                                y={cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={cx}
                                                    dy="-5"
                                                    fill="var(--heading)"
                                                    fontSize="20"
                                                    fontWeight="600"
                                                >
                                                    {totalEmployees}
                                                </tspan>
                                                <tspan
                                                    x={cx}
                                                    dy="18"
                                                    fill="var(--muted)"
                                                    fontSize="12"
                                                >
                                                    Employees
                                                </tspan>
                                            </text>
                                        );
                                    }}
                                />
                            </Pie>

                            <Tooltip />
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted">
                        No data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
