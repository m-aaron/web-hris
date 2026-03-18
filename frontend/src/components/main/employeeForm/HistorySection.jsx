import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
    saveEmploymentHistory,
    updateEmploymentHistory,
    deleteEmploymentHistory
} from "../../../services/employeeService";

import { historySchema } from "../../../schemas/historySchema";
import { formatPHDate } from "../../../helpers/dateHelper";

import InputForm from "../../InputForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";


const HistorySection = ({ employee, setEmployee, onPrevious, onNext }) => {

    const [saveIndex, setSaveIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [savingRow, setSavingRow] = useState(null);

    const methods = useForm({
        resolver: zodResolver(historySchema),
        mode: "onChange",
        defaultValues: {
        history: employee?.history || [],
        },
    });

    const {
        register,
        control,
        watch,
        reset,
        trigger,
        formState: { errors, dirtyFields },
    } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "history",
    });


    useEffect(() => {
        if (!employee) return;

        reset({
        history: (employee.history || []).map((history) => ({
            ...history,
            start_date: formatPHDate(history.start_date),
            end_date: formatPHDate(history.end_date),
        })),
        });
    }, [employee, reset]);


    const histories = watch("history") || [];


    const handleSaveHistory = async (index) => {
        const isValid = await trigger(`history.${index}`);

        if (!isValid) {
            toast.error("Please fix validation errors");
            return;
        }

        const history = histories[index];

        const payload = {
        startDate:
            history.start_date && history.start_date !== "-"
            ? history.start_date
            : null,

        endDate:
            history.end_date && history.end_date !== "-" ? history.end_date : null,

        position: history.position || "",
        employer: history.employer || "",
        salary: history.salary || null,
        reasonForLeaving: history.reason_for_leaving || "",
        };

        try {
            setSavingRow(index);

            let res;

            if (history.id) {
                res = await updateEmploymentHistory(
                employee.employee.id,
                history.id,
                payload,
                );
            } else {
                res = await saveEmploymentHistory(employee.employee.id, payload);
            }

            const updated = [...(employee.history || [])];

            if (history.id) {
                const i = updated.findIndex((h) => h.id === history.id);

                if (i !== -1) updated[i] = res.employmentHistory;
            } else {
                updated.push(res.employmentHistory);
            }

            setEmployee((prev) => ({
                ...prev,
                history: updated,
            }));

            toast.success("Employment history saved");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save employment history");
        } finally {
            setSavingRow(null);
        }
    };


    const openSaveConfirm = (index) => {
        setSaveIndex(index);
    };


    const confirmSaveHistory = async () => {
        if (saveIndex === null) return;

        await handleSaveHistory(saveIndex);

        setSaveIndex(null);
    };


    const confirmDelete = async () => {
        const history = histories[deleteIndex];

        if (!history?.id) {
            toast.info("Please save the record first before deleting.");
            setDeleteIndex(null);
            return;
        }

        try {
            await deleteEmploymentHistory(employee.employee.id, history.id);

            remove(deleteIndex);

            setEmployee((prev) => ({
                ...prev,
                history: prev.history.filter((h) => h.id !== history.id),
            }));

            toast.success("Employment history deleted");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }

        setDeleteIndex(null);
    };


    const handleAddHistory = () => {
        append({
        id: undefined,
        start_date: "",
        end_date: "",
        position: "",
        employer: "",
        salary: "",
        reason_for_leaving: "",
        });
    };


    return (
        <FormProvider {...methods}>
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                        Employment History
                    </h3>

                    <Button type="button" size="small" onClick={handleAddHistory}>
                        + Add History
                    </Button>
                </div>

                {fields.length === 0 && (
                    <p className="text-sm text-muted">
                        No employment history added yet. Click + Add History to create one.
                    </p>
                )}

                <AnimatePresence>
                    {fields.map((field, index) => {
                    const isDirty = !!dirtyFields?.history?.[index];

                    return (
                        <motion.div
                        key={field.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className={`border rounded-lg p-4 space-y-4 ${
                            isDirty ? "border-yellow bg-yellow/5" : "border-border"
                        }`}
                        >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                Employment {index + 1}
                                {isDirty && (
                                    <span className="text-xs text-yellow">Unsaved</span>
                                )}
                            </h4>

                            <div className="flex w-full sm:w-auto flex-wrap gap-2">
                                <Button
                                    type="button"
                                    size="small"
                                    onClick={() => openSaveConfirm(index)}
                                    disabled={savingRow === index}
                                >
                                    {savingRow === index ? "Saving..." : "Save"}
                                </Button>

                                <Button
                                    type="button"
                                    size="small"
                                    variant="outline"
                                    onClick={() => setDeleteIndex(index)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputForm
                                label="Start Date"
                                type="date"
                                required
                                message={errors.history?.[index]?.start_date?.message}
                                {...register(`history.${index}.start_date`)}
                            />

                            <InputForm
                                label="End Date"
                                type="date"
                                message={errors.history?.[index]?.end_date?.message}
                                {...register(`history.${index}.end_date`)}
                            />

                            <InputForm
                                label="Position"
                                required
                                message={errors.history?.[index]?.position?.message}
                                {...register(`history.${index}.position`)}
                            />

                            <InputForm
                                label="Employer"
                                required
                                message={errors.history?.[index]?.employer?.message}
                                {...register(`history.${index}.employer`)}
                            />

                            <InputForm
                                label="Salary"
                                message={errors.history?.[index]?.salary?.message}
                                {...register(`history.${index}.salary`)}
                            />

                            <InputForm
                                label="Cause of Separation"
                                {...register(`history.${index}.reason_for_leaving`)}
                            />
                        </div>
                        </motion.div>
                    );
                    })}
                </AnimatePresence>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-4 sm:px-6 py-4 flex gap-2">
            <Button
                type="button"
                size="medium"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={onPrevious}
            >
                Previous
            </Button>

            <Button
                type="button"
                size="medium"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={onNext}
            >
                Next
            </Button>
            </div>
        </div>

        {saveIndex !== null && (
            <ConfirmModal
            title="Save Employment History"
            description="Are you sure you want to save this record?"
            action="Save"
            primaryButtonVariant="primary"
            onCancel={() => setSaveIndex(null)}
            onConfirm={confirmSaveHistory}
            />
        )}

        {deleteIndex !== null && (
            <ConfirmModal
            title="Delete Employment History"
            description="Are you sure you want to remove this record?"
            action="Delete"
            primaryButtonVariant="solidDanger"
            onCancel={() => setDeleteIndex(null)}
            onConfirm={confirmDelete}
            />
        )}
        </FormProvider>
    );
};

export default HistorySection;
