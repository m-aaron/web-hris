import { Calendar, CalendarClock, AlertTriangle } from "lucide-react";
import { RegularizationPreviewTable } from "./RegularizationTable";
import { KpiCard } from "./KpiCard";

export const RegularizationSection = () => {
  return (
    <section className="space-y-4 pb-10">
      <h2 className="text-xl font-semibold text-heading">Regularization Monitoring</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Upcoming Regular (This Month)"
          value={4}
          icon={Calendar}
        />
        <KpiCard
          title="Upcoming Regular (This Year)"
          value={18}
          icon={CalendarClock}
        />
        <KpiCard
          title="Near Regularization (30 Days)"
          value={6}
          icon={AlertTriangle}
          variant="warning"
        />
        <KpiCard
          title="Overdue Regularization"
          value={2}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      <RegularizationPreviewTable />
      
    </section>
  );
};
