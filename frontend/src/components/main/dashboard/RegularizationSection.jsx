import { Calendar, CalendarClock, AlertTriangle } from "lucide-react";
import { RegularizationPreviewTable } from "./RegularizationTable";
import { KpiCard } from "./KpiCard";

export const RegularizationSection = ( { summary, becomingRegular } ) => {
  return (
    <section className="space-y-4 pb-10">
      <h2 className="text-xl font-semibold text-heading">Regularization Monitoring</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Upcoming Regular (This Month)"
          value={ summary.total_upcoming_regular_this_month }
          icon={Calendar}
        />
        <KpiCard
          title="Upcoming Regular (This Year)"
          value={ summary.total_upcoming_regular_this_year }
          icon={CalendarClock}
        />
        <KpiCard
          title="Near Regularization (30 Days)"
          value={ summary.total_near_regularization_30_days }
          icon={AlertTriangle}
          variant="warning"
        />
        <KpiCard
          title="Overdue Regularization"
          value={ summary.total_overdue_regularization }
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      <RegularizationPreviewTable becomingRegular={ becomingRegular } />
      
    </section>
  );
};
