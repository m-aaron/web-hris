import { RegularizationForecastChart } from "./analytics/RegularizationForecastChart";
import { EmployeeTypeChart } from "./analytics/EmployeeTypeChart";
import { GenderDistributionChart } from "./analytics/GenderDistributionChart";

import {
    forecastData,
    employeeTypeData,
    genderData,
} from "./analytics/data";

export const AnalyticsSection = () => {
    return (
        <section className="space-y-6">
            <h2 className="text-xl font-semibold text-heading">Analytics Overview</h2>

            <div className="grid">
                <RegularizationForecastChart data={forecastData} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <EmployeeTypeChart data={employeeTypeData} />
                <GenderDistributionChart data={genderData} />
            </div>
        </section>
    );
}
