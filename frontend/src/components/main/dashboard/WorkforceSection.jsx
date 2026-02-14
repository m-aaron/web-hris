import {
  Users,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { KpiCard } from "./KpiCard";

export const WorkforceSection = () => {
  return (
    <section className="space-y-4 pb-10">
      <h2 className="text-xl font-semibold text-heading">Workforce Overview</h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <KpiCard title="Total Employees" value={120} icon={Users} />
        <KpiCard
          title="Active Probation"
          value={15}
          icon={UserPlus}
          variant="warning"
        />
        <KpiCard
          title="Regular Employees"
          value={105}
          icon={UserCheck}
          variant="success"
        />
      </div>
    </section>
  );
};
