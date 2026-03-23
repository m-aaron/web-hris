import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Card } from "../../components/main/ui/Card";
import EmployeeHeader from "../../components/main/employeeForm/EmployeeHeader";

import SectionDrawer from "../../components/main/employeeView/SectionDrawer";

import IdentityView from "../../components/main/employeeView/IdentityView";
import PersonalView from "../../components/main/employeeView/PersonalView";
import FamilyView from "../../components/main/employeeView/FamilyView";
import EmploymentView from "../../components/main/employeeView/EmploymentView";
import EducationView from "../../components/main/employeeView/EducationView";
import ExaminationView from "../../components/main/employeeView/ExaminationView";
import TrainingView from "../../components/main/employeeView/TrainingView";
import HistoryView from "../../components/main/employeeView/HistoryView";
import OtherInfoView from "../../components/main/employeeView/OtherInfoView";
import ReferenceView from "../../components/main/employeeView/ReferenceView";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/main/ui/EmptyState";
import PageHeader from "../../components/main/ui/PageHeader";

import { getEmployeeById } from "../../services/employeeService";

const EmployeeView = () => {
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

  if (loading) return <LoadingState label="Loading employee details..." className="min-h-[60vh]" />;
  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        description="The employee record may have been removed or is no longer available."
        className="mt-8"
      />
    );
  }

  return (
    <div className="bg-background sm:min-h-screen sm:p-6">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 pt-2">
        <PageHeader
          title="Employee Details"
          description="Review complete employee records across identity, employment, and supporting sections."
        />

        <Card className="shadow-xl">
          <div className="sticky top-0 z-20 bg-card border-b border-border rounded-t-xl overflow-hidden">
            <EmployeeHeader employee={employee} mode="view" />
          </div>

          <div className="p-4 space-y-6 sm:p-6">
            <SectionDrawer title="Identity" hasData={!!employee?.employee}>
              <IdentityView employee={employee} />
            </SectionDrawer>

            <SectionDrawer title="Personal Data" hasData={!!employee?.personal}>
              <PersonalView employee={employee} />
            </SectionDrawer>

            <SectionDrawer title="Family Background" hasData={!!employee?.family}>
              <FamilyView employee={employee} />
            </SectionDrawer>

            <SectionDrawer title="Employment Data" hasData={!!employee?.employment}>
              <EmploymentView employee={employee} />
            </SectionDrawer>

            <SectionDrawer
              title="Education Qualifications"
              hasData={employee?.education?.length > 0}
            >
              <EducationView employee={employee} />
            </SectionDrawer>

            <SectionDrawer
              title="Examinations Taken"
              hasData={employee?.examinations?.length > 0}
            >
              <ExaminationView employee={employee} />
            </SectionDrawer>

            <SectionDrawer
              title="Training Programs / Seminars Attended"
              hasData={employee?.trainings?.length > 0}
            >
              <TrainingView employee={employee} />
            </SectionDrawer>

            <SectionDrawer
              title="Employment History"
              hasData={employee?.history?.length > 0}
            >
              <HistoryView employee={employee} />
            </SectionDrawer>

            <SectionDrawer
              title="Other Information"
              hasData={!!employee?.other_information}
            >
              <OtherInfoView employee={employee} />
            </SectionDrawer>

            <SectionDrawer
              title="References"
              hasData={employee?.references?.length > 0}
            >
              <ReferenceView employee={employee} />
            </SectionDrawer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeView;
