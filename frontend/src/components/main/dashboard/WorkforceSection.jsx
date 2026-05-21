import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  UserMinus
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import { STATUSES } from "../../../constants/employeeConstant";

export const WorkforceSection = ( { summary } ) => {
  const navigate = useNavigate();

  const handleCardClick = (status) => {
    const filterParams = new URLSearchParams();
    filterParams.set("status", status);
    navigate(`/employees?${filterParams.toString()}`);
  };

  return (
    <section className="space-y-4 pb-10">
      <h2 className="text-xl font-semibold text-heading">Workforce Overview</h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-5">
        <KpiCard 
          title="Total Employees" 
          value={ summary.total_employees } 
          icon={Users} 
          variant="primary"
          onClick={() => navigate("/employees")}
        />
        <KpiCard
          title="Regular"
          value={ summary.total_regular }
          icon={UserCheck}
          variant="success"
          onClick={() => handleCardClick(STATUSES.REGULAR)}
        />
        <KpiCard
          title="Active Probation"
          value={ summary.total_active_probation }
          icon={UserPlus}
          variant="warning"
          onClick={() => handleCardClick(STATUSES.PROBATIONARY)}
        />
        <KpiCard
          title="Contractual"
          value={ summary.total_contractual }
          icon={Briefcase}
          onClick={() => handleCardClick(STATUSES.CONTRACTUAL)}
        />
        <KpiCard
          title="Resigned"
          value={ summary.total_resigned }
          icon={UserMinus}
          variant="danger"
          onClick={() => handleCardClick(STATUSES.RESIGNED)}
        />
      </div>
    </section>
  );
};
