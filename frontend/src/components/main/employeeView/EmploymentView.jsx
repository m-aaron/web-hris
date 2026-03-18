import { useEffect, useState } from "react";
import ViewField from "../ui/ViewField";
import { formatPHDate } from "../../../helpers/dateHelper";
import {
  getAllPositions,
  getAllDesignations,
} from "../../../services/employeeService";


const EmploymentView = ({ employee }) => {

  const e = employee?.employment;
  const [positionName, setPositionName] = useState("");
  const [designationName, setDesignationName] = useState("");

  useEffect(() => {
    let active = true;

    const fetchEmploymentNames = async () => {
      try {
        const [positionsRes, designationsRes] = await Promise.all([
          getAllPositions(),
          getAllDesignations(),
        ]);

        if (!active) return;

        const matchedPosition = positionsRes?.positions?.find(
          (p) => String(p.id) === String(e?.position_id),
        );
        const matchedDesignation = designationsRes?.designations?.find(
          (d) => String(d.id) === String(e?.designation_id),
        );

        setPositionName(matchedPosition?.name?.replaceAll("_", "-") || "");
        setDesignationName(matchedDesignation?.name?.replaceAll("_", "-") || "");
      } catch (error) {
        console.error("Error fetching position/designation names:", error);
      }
    };

    if (e) {
      fetchEmploymentNames();
    }

    return () => {
      active = false;
    };
  }, [e, e?.designation_id, e?.position_id]);


  if (!e) {
    return (
      <p className="text-sm text-muted">No employment records available.</p>
    );
  }


  return (
    
    <div className="space-y-10">

      {/* EMPLOYMENT DETAILS */}
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Employment Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <ViewField label="Date Hired" value={formatPHDate(e.date_hired)} />
          <ViewField label="Position" value={positionName || e.position_id} />
          <ViewField label="Designation" value={designationName || e.designation_id} />

        </div>

      </div>

      {/* GOVERNMENT IDENTIFICATION */}
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Government Identification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <ViewField label="SSS" value={e.sss} />
          <ViewField label="Pag-IBIG" value={e.pagibig} />
          <ViewField label="Tax (TIN)" value={e.tax} />
          <ViewField label="PhilHealth" value={e.philhealth} />
          <ViewField label="PERAA" value={e.peraa} />

        </div>

      </div>

      {/* WORK SCHEDULE */}
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Employment Classification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <ViewField label="Employment Status" value={e.employment_status} />
          <ViewField label="Employment Basis" value={e.employment_basis?.replaceAll("_", "-")} />
          <ViewField label="Official Working Hours" value={e.official_working_hours} />

        </div>

      </div>

      {/* OTHER EMPLOYMENT */}

      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Other Employment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <ViewField label="Other Employment" value={e.other_employment} />
          <ViewField label="Working Hours" value={e.other_employment_working_hours} />

        </div>

      </div>

    </div> 

  ); 

};

export default EmploymentView;
