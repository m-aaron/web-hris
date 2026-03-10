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
import { archiveEmployee, changeEmployeeStatus } from "../../../services/employeeService";

const ViewEmployeeDrawer = ({ employee, onClose, onEmployeeArchived, onStatusUpdated }) => {

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [status, setStatus] = useState(employee?.employment_status);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setStatus(employee?.employment_status);
    setPendingStatus(null);
  }, [employee]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!employee) return null;

  const lastName = employee.last_name;
  const firstName = employee.first_name;
  const middleName = employee.middle_name;
  const nameExt = employee.name_extension;

  const initials = (firstName[0] || "") + (lastName[0] || "");

  const fullName = `${lastName}, ${firstName} ${middleName ? middleName[0] + "." : ""} ${nameExt || ""}`.trim();

  const statusColors = {
    REGULAR: "bg-light-green text-green border border-green",
    PROBATIONARY: "bg-light-yellow text-yellow border border-yellow",
    CONTRACTUAL: "bg-grey text-muted border border-muted",
    ARCHIVED: "bg-light-red text-red border border-red",
  };


  const handleArchive = async () => {
    try {
      setLoading(true);
      const res = await archiveEmployee(employee.id);
      
      if (onEmployeeArchived) {
        onEmployeeArchived(employee.id);
      };

      toast.success(res.message || "Employee archived successfully.");
    } catch (error) {
      console.error("Archive failed:", error);
      toast.error("Failed to archive employee. Please try again.");
    } finally {
      setShowArchiveModal(false);
      setLoading(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    try {
      setLoading(true);
      const res = await changeEmployeeStatus(employee.id, pendingStatus);

      setStatus(pendingStatus);

      if (onStatusUpdated) {
        onStatusUpdated({ ...employee, employment_status: pendingStatus });
      };

      toast.success(res.message || "Employee status updated successfully.");
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Failed to update employee status. Please try again.");
    } finally {
      setPendingStatus(null);
      setShowStatusModal(false);
      setLoading(false);
    }
  };


  return (

    <AnimatePresence>
      
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
          className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card shadow-2xl z-50 flex flex-col"
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

              {employee.photo_url ? (

                <img
                  src={`${import.meta.env.VITE_BASE_URL}${employee.photo_url}`}
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
                  {fullName}
                </h3>

                <p className="text-sm text-muted">
                  {employee.employee_no}
                </p>

                <span
                  className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    statusColors[employee.employment_status] ||
                    "bg-grey text-muted border border-muted"
                  }`}
                >
                  {formatEnum(employee.employment_status)}
                </span>

              </div>

            </div>

            {/* Details Card */}
            <div className="bg-card rounded-2xl p-5 space-y-5 border border-border">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">

                <EmployeeDetailItem
                  label="Employment Type"
                  value={formatEnum(employee.employment_type)}
                />

                <EmployeeDetailItem
                  label="Employment Basis"
                  value={formatEnum(employee.employment_basis)}
                />

                <EmployeeDetailItem
                  label="Gender"
                  value={formatEnum(employee.sex)}
                />

                <EmployeeDetailItem
                  label="Birth Date"
                  value={new Date(employee.birth_date).toLocaleDateString()}
                />

                <EmployeeDetailItem
                  label="Age"
                  value={`${calculateAge(employee.birth_date)} yrs old`}
                />

                <EmployeeDetailItem
                  label="Date Hired"
                  value={new Date(employee.date_hired).toLocaleDateString()}
                />

                <EmployeeDetailItem
                  label="Regularization Date"
                  value={new Date(employee.regularization_date).toLocaleDateString()}
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
                { value: "REGULAR", label: "Regular" },
                { value: "PROBATIONARY", label: "Probationary" },
                { value: "CONTRACTUAL", label: "Contractual" },
                { value: "RESIGNED", label: "Resigned" }
              ]}
              disabled={loading}
            />

              {/* Apply Button appears only if changed */}
              {pendingStatus && (
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
              onClick={() => navigate(`/employees/${employee.id}/edit`)}
              disabled={loading}
            >
              Edit
            </Button>

            <Button
              size="small"
              variant="secondary"
              onClick={() => toast.info("View feature not implemented yet")}
              disabled={loading}
            >
              View
            </Button>

            <Button
              size="small"
              variant="danger"
              onClick={() => setShowArchiveModal(true)}
              disabled={loading}
            >
              Archive
            </Button>

          </div>

        </motion.div>

        {showArchiveModal && (
          <ConfirmModal
            title="Archive Employee?"
            description="This action will archive the employee record. You can restore it later."
            primaryButtonVariant="solidDanger"
            action="Archive"
            onCancel={() => setShowArchiveModal(false)}
            onConfirm={handleArchive}
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

    </AnimatePresence>

  );
};

export default ViewEmployeeDrawer;