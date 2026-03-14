import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import StatusBadge from "../ui/StatusBadge"

import ProgressBar from "../ui/ProgressBar"
import { calculateEmployeeProgress } from "../../../helpers/progressHelper"

export default function EmployeeHeader({ employee, mode = "edit" }) {
  
  const navigate = useNavigate()
  const progress = calculateEmployeeProgress(employee);

  const employeeData = employee.employee;
  const personalData = employee.personal;
  const employmentData = employee.employment;

  const { employee_no, employment_type, photo_url } = employeeData;
  const { last_name, first_name, middle_name } = personalData;
  const { employment_status } = employmentData;

  const fullName = `${last_name}, ${first_name} ${middle_name ? middle_name[0] + "." : ""}`;

  return (

    <div className="bg-card">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/employees")}
            className="p-2 rounded-lg hover:bg-grey transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-lg font-semibold">
              {mode === "edit" ? "Edit Employee" : "Create Employee"}
            </h1>

            <p className="text-xs text-muted">
              Manage employee information
            </p>
          </div>

        </div>

        {employment_status && (
          <StatusBadge status={employment_status} />
        )}

      </div>

      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 px-6 pt-6 pb-4">

        {/* Avatar */}
        <div className="relative">

          {photo_url ? (
            <img
              src={`${import.meta.env.VITE_BASE_URL}${photo_url}`}
              alt="Employee"
              className="w-20 h-20 object-cover rounded-xl shadow"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-green flex items-center justify-center text-xl font-semibold text-card">
              {first_name?.[0]}
              {last_name?.[0]}
            </div>
          )}

        </div>

        {/* Info */}
        <div className="text-center sm:text-left">

          <h2 className="text-xl text-heading font-semibold leading-tight">
            {fullName}
          </h2>

          <p className="text-sm text-muted mt-2">
            Employee No: <span className="text-heading font-medium">{employee_no}</span>
          </p>

          <p className="text-sm text-muted">
            Employment Type: <span className="text-heading font-medium">{employment_type.replace("_", "-")}</span>
          </p>

        </div>

      </div>

      <ProgressBar progress={progress} />

    </div>
    
  )
}

