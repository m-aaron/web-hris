import React from "react";
import { Card } from "../../ui/Card";
import { CardContent } from "../CardContent";
import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

export const EmployeeTypeChart = ({ data  }) => {
    return (
        <Card className="rounded-2xl shadow-sm transition-all duration-300 bg-card hover:shadow-lg">
            <CardContent className="p-6 h-80 flex flex-col">
                <h3 className="text-heading text-lg font-semibold mb-4">
                    Employee Type Distribution
                </h3>

                <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={87}
                        cx="50%"
                        cy="45%"
                        label={false}
                        isAnimationActive
                    />
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
