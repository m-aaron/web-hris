import {
  Users,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { KpiCard } from "./KpiCard";

export const WorkforceSection = ( { summary } ) => {
  return (
    <section className="space-y-4 pb-10">
      <h2 className="text-xl font-semibold text-heading">Workforce Overview</h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <KpiCard title="Total Employees" value={ summary.total_employees } icon={Users} />
        <KpiCard
          title="Active Probation"
          value={ summary.total_active_probation }
          icon={UserPlus}
          variant="warning"
        />
        <KpiCard
          title="Regular Employees"
          value={ summary.total_regular }
          icon={UserCheck}
          variant="success"
        />
      </div>
    </section>
  );
};
