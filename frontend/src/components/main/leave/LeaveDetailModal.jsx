import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Button from "../../Button";
import ViewField from "../ui/ViewField";
import ConfirmModal from "../ui/ConfirmModal";
import { formatPHDate } from "../../../helpers/dateHelper";
import {
  formatEmployeeDisplayName,
  formatEnum,
} from "../../../helpers/employeeHelper";

const statusStyles = {
  PENDING: "bg-light-yellow text-yellow border border-yellow",
  APPROVED: "bg-light-green text-green border border-green",
  DISAPPROVED: "bg-light-red text-red border border-red",
};

const LeaveDetailModal = ({ isOpen, onClose, application }) => {
  useEffect(() => {}, [isOpen, application]);

  if (!isOpen || !application) return null;

  const app = application.application || application;
  const leaveTypes = application.leave_types || application.leaveTypes || [];

  const statusClass =
    statusStyles[app.status] || "bg-grey text-muted border border-muted";
  const fullName = formatEmployeeDisplayName(app, "N/A");

  const subjects = app.subjects_covered || [];

  const totalDays = leaveTypes.reduce(
    (sum, lt) => sum + Number(lt.number_of_days || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-60 px-0 sm:px-4 flex items-start sm:items-center justify-center bg-grey/40 backdrop-blur-sm">
      <motion.div
        className="bg-card w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl rounded-none sm:rounded-2xl shadow-xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Leave Details</h2>
          <button
            onClick={onClose}
            className="text-sm text-muted hover:text-heading"
          >
            Close
          </button>
        </div>

        <div className="flex-1 min-h-0 px-6 py-5 space-y-5 overflow-y-auto scrollbar">
          <div className="border border-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Personal Details
            </h3>
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ViewField label="Employee No" value={app.employee_no || "-"} />
              <ViewField label="Employee" value={fullName} />
              <ViewField label="Position" value={app.position || app.job_title || "-"} />
              <ViewField label="Employment Type" value={app.employment_type || "-"} />
              <ViewField label="Department Unit" value={app.department_unit || "-"} />
            </div>

          </div>

          <div className="border border-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Application Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ViewField label="Date Filed" value={formatPHDate(app.date_filed)} />
              {String(app.employment_type || "").toUpperCase() !== "TEACHING" && (
                <ViewField label="Substitute" value={app.substitute_name || "-"} />
              )}

              <ViewField label="Status" 
                value={
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium border ${statusClass}`}
                    >
                      {app.status}
                    </span>
                  </div> } 
              />
            </div>

            <ViewField className="col-span-1 md:col-span-3" label="Reason" value={app.reason || "-"} />

                      <div className="mt-10 space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Leave Types
            </h3>

            <div className="space-y-3">
              {leaveTypes.map((lt, i) => (
                <div key={i} className="border border-border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5 lg:col-span-4">
                    <ViewField label="Leave Type" value={lt.leave_type_name || lt.name} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <ViewField label="From" value={formatPHDate(lt.date_from)} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <ViewField label="To" value={formatPHDate(lt.date_to)} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <ViewField label="Days" value={String(lt.number_of_days || 0)} />
                  </div>
                  <div className="sm:col-span-12">
                    <ViewField label="Details" value={lt.other_leave_details || "-"} />
                  </div>
                </div>
              ))}

              <div className="text-sm">
                <strong>Total Days:</strong> {totalDays}
              </div>

              {app.status_history && app.status_history.length > 0 && (
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Approval History</h3>
                  <div className="space-y-2">
                    {app.status_history.map((h, idx) => (
                      <div key={idx} className="text-sm grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>{formatPHDate(h.date) || h.date || '-'}</div>
                        <div>{h.status || '-'}</div>
                        <div className="text-muted">{h.by || h.approved_by || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>

          {subjects && subjects.length > 0 && (
            <div className="space-y-3">
              <div className="border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                Subjects Covered
              </h3>
                {subjects.map((s, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                  >
                    <div className="sm:col-span-5">
                      <ViewField label="Subject" value={s.subject} />
                    </div>
                    <div className="sm:col-span-2">
                      <ViewField label="Day" value={s.day} />
                    </div>
                    <div className="sm:col-span-2">
                      <ViewField label="Time" value={s.time} />
                    </div>
                    <div className="sm:col-span-3">
                      <ViewField label="Substitute" value={s.substitute_name || '-'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Remarks
            </h3>
            <p className="text-sm text-heading">{app.remarks || "—"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaveDetailModal;
