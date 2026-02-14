import { useState } from "react";
import { Card } from "../../ui/Card";
import { CardContent } from "../CardContent";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

export const RegularizationForecastChart = ({ data }) => {
    const [chartType, setChartType] = useState("bar");

    return (
        <Card className="rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg bg-card">
            <CardContent className="p-6 h-80 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-heading">
                        Regularization Forecast
                    </h3>

                    {/* Toggle Buttons */}
                    <div className="flex gap-2 bg-card p-1 rounded-xl">
                        <button
                            onClick={() => setChartType("bar")}
                            className={`
                            px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                            cursor-pointer
                            ${
                                chartType === "bar"
                                ? "bg-primary text-card shadow-sm"
                                : "text-muted hover:bg-grey"
                            }
                            `}
                        >
                            Bar
                        </button>

                        <button
                            onClick={() => setChartType("line")}
                            className={`
                                px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                                cursor-pointer
                            ${
                                chartType === "line"
                                ? "bg-primary text-card shadow-sm"
                                : "text-muted hover:bg-grey"
                            }
                            `}
                        >
                            Line
                        </button>
                    </div>

                </div>

                {/* Chart */}
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "bar" ? (
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grey)" />
                                <XAxis dataKey="month" stroke="var(--muted)" />
                                <YAxis stroke="var(--muted)" />
                                <Tooltip />

                                <Bar
                                    dataKey="teaching"
                                    name="Teaching"
                                    radius={[8, 8, 0, 0]}
                                    fill="var(--blue)"
                                />

                                <Bar
                                    dataKey="non_teaching"
                                    name="Non-Teaching"
                                    radius={[8, 8, 0, 0]}
                                    fill="var(--border)"
                                />
                            </BarChart>
                        ) : (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grey)" />
                                <XAxis dataKey="month" stroke="var(--muted)" />
                                <YAxis stroke="var(--muted)" />
                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="teaching"
                                    name="Teaching"
                                    stroke="var(--blue)"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="non_teaching"
                                    name="Non-Teaching"
                                    stroke="var(--border)"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
