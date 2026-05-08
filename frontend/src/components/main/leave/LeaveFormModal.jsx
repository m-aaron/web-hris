import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import InputForm from "../../InputForm";
import SelectForm from "../../SelectForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";
import { leaveApplicationSchema } from "../../../schemas/leaveSchema";

const DEFAULT_FORM = {
    employee_id: "",
    leave_type_id: "",
    date_filed: "",
    date_from: "",
    date_to: "",
    number_of_days: "",
    reason: "",
};

const calculateDays = (from, to) => {
    if (!from || !to) return "";
    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    if (end < start) return "";
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff + 1;
};

const LeaveFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    employees = [],
    leaveTypes = [],
}) => {
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [isDaysManual, setIsDaysManual] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(leaveApplicationSchema),
        mode: "onChange",
        defaultValues: DEFAULT_FORM,
    });

    const dateFrom = watch("date_from");
    const dateTo = watch("date_to");
    const numberOfDays = watch("number_of_days");

    useEffect(() => {
        if (!isOpen) return;
        reset(DEFAULT_FORM);
        setEmployeeSearch("");
        setIsDaysManual(false);
        setShowConfirm(false);
        setPendingData(null);
    }, [isOpen, reset]);

    useEffect(() => {
        if (!dateFrom || !dateTo) return;

        const computed = calculateDays(dateFrom, dateTo);

        if (!isDaysManual || !numberOfDays) {
            setValue("number_of_days", computed, { shouldValidate: true });
            setIsDaysManual(false);
        }
    }, [dateFrom, dateTo, isDaysManual, numberOfDays, setValue]);

    const employeeOptions = useMemo(() => {
        const normalizedSearch = employeeSearch.trim().toLowerCase();

        return employees
            .filter((employee) => {
                if (!normalizedSearch) return true;
                const displayName = `${employee.employee_no || ""} ${employee.first_name || ""} ${employee.last_name || ""}`;
                return displayName.toLowerCase().includes(normalizedSearch);
            })
            .map((employee) => {
                const fullName = employee.display_name || employee.full_name || "";
                const display = fullName
                    ? `${employee.employee_no || ""} - ${fullName}`
                    : employee.employee_no || "";

                return {
                    value: String(employee.id),
                    label: display || "N/A",
                };
            });
    }, [employees, employeeSearch]);

    const leaveTypeOptions = useMemo(() => {
        return [
            { value: "", label: "Select leave type" },
            ...leaveTypes.map((type) => ({
                value: String(type.id),
                label: type.name,
            })),
        ];
    }, [leaveTypes]);

    const handleRequestSubmit = (data) => {
        setPendingData(data);
        setShowConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        if (!pendingData) return;
        await onSubmit?.(pendingData);
        setShowConfirm(false);
        setPendingData(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-grey/40 backdrop-blur-sm z-60 px-4">
            <motion.div
                className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
            >
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-heading">File Leave</h2>
                    <button
                        onClick={onClose}
                        className="text-sm text-muted hover:text-heading"
                    >
                        Close
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(handleRequestSubmit)}
                    className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto scrollbar"
                >
                    <div className="border border-border rounded-xl p-4 space-y-4">
                        <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
                            Leave Details
                        </h4>

                        <div className="grid grid-cols-1 mb-8 gap-4">
                            <div className="space-y-2">
                                <SelectForm
                                    label="Employee"
                                    required
                                    message={errors.employee_id?.message}
                                    {...register("employee_id")}
                                    options={[
                                        { value: "", label: "Select employee" },
                                        ...employeeOptions,
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <SelectForm
                                label="Leave Type"
                                required
                                message={errors.leave_type_id?.message}
                                {...register("leave_type_id")}
                                options={leaveTypeOptions}
                            />

                            <InputForm
                                label="Date Filed (optional)"
                                type="date"
                                message={errors.date_filed?.message}
                                {...register("date_filed")}
                            />

                            <InputForm
                                label="Date From"
                                type="date"
                                required
                                message={errors.date_from?.message}
                                {...register("date_from")}
                            />

                            <InputForm
                                label="Date To"
                                type="date"
                                required
                                message={errors.date_to?.message}
                                {...register("date_to")}
                            />

                            <InputForm
                                label="Number of Days"
                                type="number"
                                required
                                message={errors.number_of_days?.message}
                                value={numberOfDays}
                                onChange={(event) => {
                                    setIsDaysManual(true);
                                    setValue("number_of_days", event.target.value, { shouldValidate: true });
                                }}
                            />
                        </div>
                    </div>

                    <div className="border border-border rounded-xl p-4 space-y-4">
                        <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
                            Reason
                        </h4>

                        <div>
                            <label className="text-sm text-muted">Reason (optional)</label>
                            <textarea
                                className="mt-1 w-full rounded-xl border border-border bg-card p-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                                {...register("reason")}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            size="small"
                            className="flex-1 sm:flex-none"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="small"
                            className="flex-1 sm:flex-none"
                            loading={isSubmitting}
                            loadingText="Saving..."
                        >
                            File Leave
                        </Button>
                    </div>
                </form>
            </motion.div>

            {showConfirm && (
                <ConfirmModal
                    title="Submit leave application?"
                    description="This will file the leave application and notify the approvers."
                    action="Submit"
                    onCancel={() => setShowConfirm(false)}
                    onConfirm={handleConfirmSubmit}
                />
            )}
        </div>
    );
};

export default LeaveFormModal;
