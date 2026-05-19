import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "../../Button";
import SelectField from "../ui/SelectField";
import ConfirmModal from "../ui/ConfirmModal";

const LeaveStatusModal = ({ isOpen, onClose, application, onUpdate }) => {
  const [status, setStatus] = useState(application?.status || "PENDING");
  const [remarks, setRemarks] = useState(application?.remarks || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStatus(application?.status || "PENDING");
    setRemarks(application?.remarks || "");
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const handleSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await onUpdate?.({ status, remarks });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-grey/40 backdrop-blur-sm z-60 px-4">
      <motion.div
        className="bg-card w-full max-w-xl rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Update Leave Status</h2>
          <button onClick={onClose} className="text-sm text-muted hover:text-heading">Close</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <SelectField
              label="Status"
              value={status}
              onChange={(v) => setStatus(v)}
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "DISAPPROVED", label: "Disapproved" },
              ]}
            />

            <div>
              <label className="text-xs text-muted">Remarks</label>
              <textarea
                className="mt-1 w-full rounded-xl border border-border bg-card p-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button size="small" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="small"
              onClick={() => setShowConfirm(true)}
              loading={loading}
              loadingText="Updating..."
            >
              Update
            </Button>
          </div>
        </div>
      </motion.div>

      {showConfirm && (
        <ConfirmModal
          title="Update leave status?"
          description="This action will update the leave application's status."
          action="Update"
          primaryButtonVariant="primary"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  );
};

export default LeaveStatusModal;
