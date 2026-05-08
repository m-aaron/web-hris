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
  REJECTED: "bg-light-red text-red border border-red",
};

const LeaveDetailModal = ({
  isOpen,
  onClose,
  application,
  onApprove,
  onReject,
  defaultAction = null,
}) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(defaultAction);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setRemarks(application?.remarks || "");
    setError("");
    setLoading(false);
    setActionType(defaultAction);
    setShowConfirm(false);
    setConfirmAction(null);
  }, [isOpen, application, defaultAction]);

  if (!isOpen || !application) return null;

  const statusClass =
    statusStyles[application.status] ||
    "bg-grey text-muted border border-muted";
  const fullName = formatEmployeeDisplayName(
    application,
    application.employee_name || "N/A",
  );

  const executeApprove = async () => {
    setLoading(true);
    setActionType("approve");
    setError("");

    const success = await onApprove?.(remarks);
    setLoading(false);

    if (success) onClose();
  };

  const executeReject = async () => {
    setLoading(true);
    setActionType("reject");
    setError("");

    const success = await onReject?.(remarks.trim());
    setLoading(false);

    if (success) onClose();
  };

  const requestApprove = () => {
    setError("");
    setConfirmAction("approve");
    setShowConfirm(true);
  };

  const requestReject = () => {
    if (!remarks.trim()) {
      setError("Remarks are required for rejection.");
      return;
    }

    setError("");
    setConfirmAction("reject");
    setShowConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "approve") {
      await executeApprove();
    }

    if (confirmAction === "reject") {
      await executeReject();
    }

    setShowConfirm(false);
    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-grey/40 backdrop-blur-sm z-60 px-4">
      <motion.div
        className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
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

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto scrollbar">
          <div className="border border-border rounded-xl p-4 space-y-4">
            <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
              Application Details
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ViewField label="Employee" value={fullName} />
              <ViewField
                label="Employee No"
                value={application.employee_no || "-"}
              />
              <ViewField
                label="Leave Type"
                value={application.leave_type || "-"}
              />
              <ViewField
                label="Date Filed"
                value={formatPHDate(application.date_filed)}
              />
              <ViewField
                label="Date From"
                value={formatPHDate(application.date_from)}
              />
              <ViewField
                label="Date To"
                value={formatPHDate(application.date_to)}
              />
              <ViewField
                label="Number of Days"
                value={application.number_of_days}
              />
              <ViewField
                label="Status"
                value={formatEnum(application.status)}
              />
            </div>

            <div>
              <span
                className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium border ${statusClass}`}
              >
                {formatEnum(application.status)}
              </span>
            </div>
          </div>

          <div className="border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
              Reason
            </h4>
            <p className="text-sm text-heading">{application.reason || "—"}</p>
          </div>

          {application.status === "PENDING" ? (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
                Remarks
              </h4>
              <div>
                <label className="text-sm text-muted">Remarks</label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add optional remarks for approval or required remarks for rejection"
                />
                {error && <p className="text-xs text-red mt-1">{error}</p>}
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
                Remarks
              </h4>
              <p className="text-sm text-heading">
                {application.remarks || "—"}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-border flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {application.status === "PENDING" ? (
              <>
                <Button
                  type="button"
                  variant="danger"
                  size="small"
                  className="flex-1 sm:flex-none"
                  onClick={requestReject}
                  loading={loading && actionType === "reject"}
                  loadingText="Rejecting..."
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  size="small"
                  className="flex-1 sm:flex-none"
                  onClick={requestApprove}
                  loading={loading && actionType === "approve"}
                  loadingText="Approving..."
                >
                  Approve
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="small"
                className="flex-1 sm:flex-none"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {showConfirm && (
        <ConfirmModal
          title={
            confirmAction === "reject"
              ? "Reject leave application?"
              : "Approve leave application?"
          }
          description={
            confirmAction === "reject"
              ? "This action will reject the leave application."
              : "This action will approve the leave application."
          }
          action={confirmAction === "reject" ? "Reject" : "Approve"}
          primaryButtonVariant={
            confirmAction === "reject" ? "solidDanger" : "primary"
          }
          onCancel={() => {
            setShowConfirm(false);
            setConfirmAction(null);
          }}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
};

export default LeaveDetailModal;
