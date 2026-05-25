import { RegularizationForecastChart } from "./analytics/RegularizationForecastChart";
import { EmployeeTypeChart } from "./analytics/EmployeeTypeChart";
import { GenderDistributionChart } from "./analytics/GenderDistributionChart";

export const AnalyticsSection = ({ summary, forecast }) => {
    return (
        <section className="space-y-6">
            <h2 className="text-xl font-semibold text-heading">Analytics Overview</h2>

            <div className="grid">
                <RegularizationForecastChart data={forecast} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <EmployeeTypeChart summary={summary} />
                <GenderDistributionChart summary={summary} />
            </div>
        </section>
    );
}
