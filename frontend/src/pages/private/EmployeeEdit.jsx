import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/main/ui/Card";
import EmployeeHeader from "../../components/main/employeeForm/EmployeeHeader";
import EmployeeTabs from "../../components/main/employeeForm/EmployeeTabs";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/main/ui/EmptyState";
import { getEmployeeById } from "../../services/employeeService";

const EmployeeEdit = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await getEmployeeById(id);
        setEmployee(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) return <LoadingState label="Loading employee record..." className="min-h-[60vh]" />;
  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        description="We could not load this employee record for editing."
        className="mt-8"
      />
    );
  }

  return (
    <div className="bg-background sm:min-h-screen sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="w-full sm:max-w-7xl">
        <Card className="w-full flex flex-col shadow-xl h-screen sm:h-[90vh] rounded-none sm:rounded-xl overflow-hidden">
          <div className="shrink-0 sticky top-0 z-20 bg-card border-b border-border rounded-none sm:rounded-t-xl overflow-hidden">
            <EmployeeHeader employee={employee} mode="edit" />
          </div>

          <div className="flex-1 min-h-0 rounded-none sm:rounded-b-xl overflow-hidden">
            <EmployeeTabs employee={employee} setEmployee={setEmployee} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeEdit;
