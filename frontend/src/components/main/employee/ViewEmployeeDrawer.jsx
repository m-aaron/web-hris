import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import EmployeeDetailItem from "./EmployeeDetailItem";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../../Button";
import SelectField from "../ui/SelectField";

import {
  formatEnum,
  calculateAge,
} from "../../../helpers/employeeHelper";
import { formatPHDate } from "../../../helpers/dateHelper";
import { archiveEmployee, changeEmployeeStatus, restoreEmployee } from "../../../services/employeeService";
import { STATUSES, RECORD_STATUSES } from "../../../constants/employeeConstant";

const ViewEmployeeDrawer = ({ employee, onClose, onEmployeeArchived, onStatusUpdated }) => {

  const [displayEmployee, setDisplayEmployee] = useState(employee);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [status, setStatus] = useState(employee?.employment_status);
  const [recordStatus, setRecordStatus] = useState(employee?.record_status || employee?.status);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();


  const isOpen = !!employee;
  const activeEmployee = employee || displayEmployee;


  useEffect(() => {
    if (employee) {
      setDisplayEmployee(employee);
    }
  }, [employee]);


  useEffect(() => {
    if (!activeEmployee) return;

    setStatus(activeEmployee.employment_status);
    setRecordStatus(activeEmployee.record_status || activeEmployee.status);
    setPendingStatus(null);
  }, [activeEmployee]);


  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);


  if (!activeEmployee) return null;

  const formatDateOrNA = (value) => {
    if (!value) return "N/A";
    return formatPHDate(value);
  };


  const lastName = activeEmployee.last_name || "";
  const firstName = activeEmployee.first_name || "";
  const middleName = activeEmployee.middle_name || "";
  const nameExt = activeEmployee.name_extension || "";

  const initials = (firstName?.[0] || "") + (lastName?.[0] || "");

  const fullName = `${lastName}, ${firstName} ${middleName ? `${middleName[0]}.` : ""} ${nameExt}`.replace(/\s+/g, " ").trim();
  const displayName = fullName === "," || fullName === ", " ? "N/A" : fullName;
  const canChangeEmploymentStatus = Boolean(activeEmployee.employment_status);
  const effectiveEmploymentStatus = status || activeEmployee.employment_status;
  const effectiveRecordStatus = recordStatus || activeEmployee.record_status || activeEmployee.status;
  const isArchivedRecord = effectiveRecordStatus === "ARCHIVED";

  const statusColors = {
    REGULAR: "bg-light-green text-green border border-green",
    PROBATIONARY: "bg-light-yellow text-yellow border border-yellow",
    CONTRACTUAL: "bg-grey text-muted border border-muted",
    ARCHIVED: "bg-light-red text-red border border-red",
  };

  const recordStatusColors = {
    DRAFT: "bg-light-yellow text-yellow border border-yellow",
    ARCHIVED: "bg-light-red text-red border border-red",
    SUBMITTED: "bg-light-green text-green border border-green",
  };


  const handleArchive = async () => {
    try {
      setLoading(true);
      const res = await archiveEmployee(activeEmployee.id);
      setRecordStatus(RECORD_STATUSES.ARCHIVED);
      
      if (onEmployeeArchived) {
        onEmployeeArchived(activeEmployee.id);
      };

      toast.success("Employee archived successfully.");
    } catch (error) {
      console.error("Archive failed:", error);
      toast.error(error.response?.data?.message || "Failed to archive employee. Please try again.");
    } finally {
      setShowArchiveModal(false);
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const res = await restoreEmployee(activeEmployee.id);
      const nextRecordStatus = res?.recordStatus || RECORD_STATUSES.DRAFT;

      setRecordStatus(nextRecordStatus);

      if (onEmployeeArchived) {
        onEmployeeArchived(activeEmployee.id);
      }

      toast.success(`Employee restored as ${nextRecordStatus}.`);
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error(error.response?.data?.message || "Failed to restore employee. Please try again.");
    } finally {
      setShowArchiveModal(false);
      setLoading(false);
    }
  };

  
  const handleConfirmStatusChange = async () => {
    try {
      setLoading(true);
      const res = await changeEmployeeStatus(activeEmployee.id, pendingStatus);

      setStatus(pendingStatus);

      if (onStatusUpdated) {
        onStatusUpdated({ ...activeEmployee, employment_status: pendingStatus });
      };

      toast.success("Employee status updated successfully.");
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update employee status. Please try again.");
    } finally {
      setPendingStatus(null);
      setShowStatusModal(false);
      setLoading(false);
    }
  };


  return (

    <AnimatePresence>
      {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-grey/40 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          className="fixed top-0 right-0 h-full w-full sm:w-105 bg-card shadow-2xl z-50 flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* Sticky Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-5 flex items-center gap-3 z-10">

            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-lg hover:bg-muted transition"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="text-base font-semibold">
              Employee Details
            </h2>

          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Profile Section */}
            <div className="flex items-center gap-4">

              {activeEmployee.photo_url ? (

                <img
                  src={`${import.meta.env.VITE_BASE_URL}${activeEmployee.photo_url}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-xl object-cover"
                />

              ) : (

                <div className="w-20 h-20 rounded-xl bg-green text-card flex items-center justify-center font-semibold text-lg">
                  {initials}
                </div>

              )}

              <div className="flex-1">

                <h3 className="text-lg text-heading font-semibold leading-tight">
                  {displayName}
                </h3>

                <p className="text-sm text-muted">
                  {activeEmployee.employee_no}
                </p>

                <span
                  className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    statusColors[effectiveEmploymentStatus] ||
                    "bg-grey text-muted border border-muted"
                  }`}
                >
                  {formatEnum(effectiveEmploymentStatus)}
                </span>

                {effectiveRecordStatus && (
                  <span
                    className={`ml-2 inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      recordStatusColors[effectiveRecordStatus] ||
                      "bg-grey text-muted border border-muted"
                    }`}
                  >
                    {formatEnum(effectiveRecordStatus)}
                  </span>
                )}

              </div>

            </div>

            {/* Details Card */}
            <div className="bg-card rounded-2xl p-5 space-y-5 border border-border">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">

                <EmployeeDetailItem
                  label="Employment Type"
                  value={formatEnum(activeEmployee.employment_type)}
                />

                <EmployeeDetailItem
                  label="Employment Basis"
                  value={formatEnum(activeEmployee.employment_basis)}
                />

                <EmployeeDetailItem
                  label="Gender"
                  value={formatEnum(activeEmployee.sex)}
                />

                <EmployeeDetailItem
                  label="Birth Date"
                  value={formatDateOrNA(activeEmployee.birth_date)}
                />

                <EmployeeDetailItem
                  label="Age"
                  value={`${calculateAge(activeEmployee.birth_date)} yrs old`}
                />

                <EmployeeDetailItem
                  label="Date Hired"
                  value={formatDateOrNA(activeEmployee.date_hired)}
                />

                <EmployeeDetailItem
                  label="Regularization Date"
                  value={formatDateOrNA(activeEmployee.regularization_date)}
                />

              </div>

            </div>

            {/* Status Section */}
            <div className="space-y-3">

              <SelectField
              label="Change Status"
              value={pendingStatus ?? status}
              onChange={(newValue) => {
                if (newValue === status) {
                  setPendingStatus(null);
                } else {
                  setPendingStatus(newValue);
                }
              }}
              options={[
                { value: STATUSES.REGULAR, label: "Regular" },
                { value: STATUSES.PROBATIONARY, label: "Probationary" },
                { value: STATUSES.CONTRACTUAL, label: "Contractual" },
                { value: STATUSES.RESIGNED, label: "Resigned" }
              ]}
              disabled={loading || !canChangeEmploymentStatus}
            />

              {!canChangeEmploymentStatus && (
                <p className="text-xs text-muted">
                  Complete employment details first before changing employment status.
                </p>
              )}

              {/* Apply Button appears only if changed */}
              {pendingStatus && canChangeEmploymentStatus && (
                <Button
                  size="small"
                  onClick={() => setShowStatusModal(true)}
                  disabled={loading}
                  className="w-full"
                >
                  Apply Status Change
                </Button>
              )}

            </div>

          </div>

          {/* Footer */}
          <div className="grid grid-cols-3 gap-2 border-t border-border bg-card p-4">

            <Button
              size="small"
              onClick={() => navigate(`/employees/${activeEmployee.id}/edit`)}
              disabled={loading}
            >
              Edit
            </Button>

            <Button
              size="small"
              variant="secondary"
              onClick={() => navigate(`/employees/${activeEmployee.id}/view`)}
              disabled={loading}
            >
              View
            </Button>

            <Button
              size="small"
              variant={isArchivedRecord ? "secondary" : "danger"}
              onClick={() => setShowArchiveModal(true)}
              disabled={loading}
            >
              {isArchivedRecord ? "Restore" : "Archive"}
            </Button>

          </div>

        </motion.div>

        {showArchiveModal && (
          <ConfirmModal
            title={isArchivedRecord ? "Restore Employee?" : "Archive Employee?"}
            description={
              isArchivedRecord
                ? "This action will restore the employee to SUBMITTED if complete, otherwise to DRAFT."
                : "This action will archive the employee record. You can restore it later."
            }
            primaryButtonVariant={isArchivedRecord ? "primary" : "solidDanger"}
            action={isArchivedRecord ? "Restore" : "Archive"}
            onCancel={() => setShowArchiveModal(false)}
            onConfirm={isArchivedRecord ? handleRestore : handleArchive}
          />
        )}

        {showStatusModal && (
          <ConfirmModal
            title="Confirm Status Change"
            description={`Are you sure you want to change status to ${pendingStatus}?`}
            primaryButtonVariant="primary"
            action="Confirm"
            onCancel={() => setShowStatusModal(false)}
            onConfirm={handleConfirmStatusChange}
          />
        )}

      </>
      )}

    </AnimatePresence>

  );
};

export default ViewEmployeeDrawer;