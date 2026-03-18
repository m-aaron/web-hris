import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
    saveTrainingProgram,
    updateTrainingProgram,
    deleteTrainingProgram
} from "../../../services/employeeService";

import { trainingSchema } from "../../../schemas/trainingSchema";
import { formatPHDate } from "../../../helpers/dateHelper";

import InputForm from "../../InputForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";


const TrainingSection = ({ employee, setEmployee, onPrevious, onNext }) => {

    const [saveIndex, setSaveIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [savingRow, setSavingRow] = useState(null);

    const methods = useForm({
        resolver: zodResolver(trainingSchema),
        mode: "onChange",
        defaultValues: {
        trainings: employee?.trainings || [],
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
        name: "trainings",
    });


    useEffect(() => {
        if (!employee) return;

        reset({
        trainings: (employee.trainings || []).map((training) => ({
            ...training,
            date_from: formatPHDate(training.date_from),
            date_to: formatPHDate(training.date_to),
        })),
        });
    }, [employee, reset]);


    const trainings = watch("trainings") || [];


    const handleSaveTraining = async (index) => {
        const isValid = await trigger(`trainings.${index}`);

        if (!isValid) {
            toast.error("Please fix validation errors");
            return;
        }

        const training = trainings[index];

        const payload = {
        title: training.title || "",
        place: training.place || "",
        dateFrom:
            training.date_from && training.date_from !== "-"
            ? training.date_from
            : null,
        dateTo:
            training.date_to && training.date_to !== "-" ? training.date_to : null,
        hours: training.hours || null,
        conductedBy: training.conducted_by || "",
        };

        try {
            setSavingRow(index);

            let res;

            if (training.id) {
                res = await updateTrainingProgram(
                employee.employee.id,
                training.id,
                payload,
                );
            } else {
                res = await saveTrainingProgram(employee.employee.id, payload);
            }

            const updated = [...(employee.trainings || [])];

            if (training.id) {
                const i = updated.findIndex((t) => t.id === training.id);

                if (i !== -1) updated[i] = res.trainingProgram;
            } else {
                updated.push(res.trainingProgram);
            }

            setEmployee((prev) => ({
                ...prev,
                trainings: updated,
            }));

            toast.success("Training saved");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save training");
        } finally {
            setSavingRow(null);
        }
    };


    const openSaveConfirm = (index) => {
        setSaveIndex(index);
    };


    const confirmSaveTraining = async () => {
        if (saveIndex === null) return;

        await handleSaveTraining(saveIndex);

        setSaveIndex(null);
    };


    const confirmDelete = async () => {
        const training = trainings[deleteIndex];

        if (!training?.id) {
            toast.info("Please save the training first before deleting.");
            setDeleteIndex(null);
            return;
        }

        try {
            await deleteTrainingProgram(employee.employee.id, training.id);

            remove(deleteIndex);

            setEmployee((prev) => ({
                ...prev,
                trainings: prev.trainings.filter((t) => t.id !== training.id),
            }));

            toast.success("Training deleted");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }

        setDeleteIndex(null);
    };


    const handleAddTraining = () => {
        append({
        id: undefined,
        title: "",
        place: "",
        date_from: "",
        date_to: "",
        hours: "",
        conducted_by: "",
        });
    };


    return (
        <FormProvider {...methods}>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Trainings Attended
                        </h3>

                        <Button type="button" size="small" onClick={handleAddTraining}>
                            + Add Training
                        </Button>
                    </div>

                    {fields.length === 0 && (
                        <p className="text-sm text-muted">
                            No trainings added yet. Click + Add Training to create one.
                        </p>
                    )}

                    <AnimatePresence>
                        {fields.map((field, index) => {
                        const isDirty = !!dirtyFields?.trainings?.[index];

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
                                    Training {index + 1}
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
                                    label="Title of Seminar / Training / Workshop"
                                    required
                                    message={errors.trainings?.[index]?.title?.message}
                                    {...register(`trainings.${index}.title`)}
                                />

                                <InputForm
                                    label="Place / Venue"
                                    required
                                    message={errors.trainings?.[index]?.place?.message}
                                    {...register(`trainings.${index}.place`)}
                                />

                                <InputForm
                                    label="Date From"
                                    type="date"
                                    required
                                    message={errors.trainings?.[index]?.date_from?.message}
                                    {...register(`trainings.${index}.date_from`)}
                                />

                                <InputForm
                                    label="Date To"
                                    type="date"
                                    message={errors.trainings?.[index]?.date_to?.message}
                                    {...register(`trainings.${index}.date_to`)}
                                />

                                <InputForm
                                    label="Hours"
                                    message={errors.trainings?.[index]?.hours?.message}
                                    {...register(`trainings.${index}.hours`)}
                                />

                                <InputForm
                                    label="Conducted / Sponsored By"
                                    {...register(`trainings.${index}.conducted_by`)}
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
                title="Save Training"
                description="Are you sure you want to save this training?"
                action="Save"
                primaryButtonVariant="primary"
                onCancel={() => setSaveIndex(null)}
                onConfirm={confirmSaveTraining}
                />
            )}

            {deleteIndex !== null && (
                <ConfirmModal
                title="Delete Training"
                description="Are you sure you want to remove this training?"
                action="Delete"
                primaryButtonVariant="solidDanger"
                onCancel={() => setDeleteIndex(null)}
                onConfirm={confirmDelete}
                />
            )}
        </FormProvider>
    );
};

export default TrainingSection;
