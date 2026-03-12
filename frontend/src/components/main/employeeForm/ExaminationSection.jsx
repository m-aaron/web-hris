import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
    saveExaminationTaken,
    updateExaminationTaken,
    deleteExaminationTaken,
} from "../../../services/employeeService";

import { examinationSchema } from "../../../schemas/examinationSchema";
import { formatPHDate } from "../../../helpers/dateHelper";

import InputForm from "../../InputForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";


const ExaminationSection = ({ employee, setEmployee, onPrevious, onNext }) => {

    const [saveIndex, setSaveIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [savingRow, setSavingRow] = useState(null);

    const methods = useForm({
        resolver: zodResolver(examinationSchema),
        mode: "onChange",
        defaultValues: {
        examinations: employee?.examinations || [],
        },
    });

    const { register, control, watch, reset, formState: { errors, dirtyFields } } = methods;


    const { fields, append, remove } = useFieldArray({
        control,
        name: "examinations",
    });


    useEffect(() => {
        if (!employee) return;

        reset({
        examinations: (employee.examinations || []).map((exam) => ({
            ...exam,
            date_taken: formatPHDate(exam.date_taken),
        })),
        });
    }, [employee, reset]);

    const examinations = watch("examinations") || [];


    const handleSaveExam = async (index) => {

        const exam = examinations[index];

        const payload = {
        title: exam.title || "",
        dateTaken:
            exam.date_taken && exam.date_taken !== "-" ? exam.date_taken : null,
        rating: exam.rating || "",
        };

        try {
            setSavingRow(index);

            let res;

            if (exam.id) {
                res = await updateExaminationTaken(
                employee.employee.id,
                exam.id,
                payload
                );
            } else {
                res = await saveExaminationTaken(employee.employee.id, payload);
            }

            const updated = [...(employee.examinations || [])];

            if (exam.id) {
                const i = updated.findIndex((e) => e.id === exam.id);

                if (i !== -1) updated[i] = res.examinationTaken;
            } else {
                updated.push(res.examinationTaken);
            }

            setEmployee((prev) => ({
                ...prev,
                examinations: updated,
            }));

            toast.success("Examination saved");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save examination");
        } finally {
            setSavingRow(null);
        }

    };


    const openSaveConfirm = (index) => {
        setSaveIndex(index);
    };


    const confirmSaveExam = async () => {
        if (saveIndex === null) return;

        await handleSaveExam(saveIndex);

        setSaveIndex(null);
    };


    const confirmDelete = async () => {
        const exam = examinations[deleteIndex];

        if (!exam?.id) {
            toast.info("Please save the examination first before deleting.");
            setDeleteIndex(null);
            return;
        }

        try {
            await deleteExaminationTaken(
                employee.employee.id,
                exam.id
            );

            remove(deleteIndex);

            setEmployee((prev) => ({
                ...prev,
                examinations: prev.examinations.filter((e) => e.id !== exam.id),
            }));

            toast.success("Examination deleted");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }

        setDeleteIndex(null);
    };


    const handleAddExam = () => {
        append({
        id: undefined,
        title: "",
        date_taken: "",
        rating: "",
        });
    };


    return (
        <FormProvider {...methods}>

            <div className="flex flex-col h-full">

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar">

                    <div className="flex justify-between items-center">

                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Examinations Taken
                        </h3>

                        <Button type="button" size="small" onClick={handleAddExam}>
                            + Add Examination
                        </Button>
                    </div>

                    {fields.length === 0 && (
                        <p className="text-sm text-muted">No examinations added.</p>
                    )}

                    <AnimatePresence>

                        {fields.map((field, index) => {

                            const isDirty = !!dirtyFields?.examinations?.[index];

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

                                    <div className="flex justify-between items-center">

                                        <h4 className="text-sm text-heading font-medium flex items-center gap-2">
                                            Examination {index + 1}
                                            {isDirty && (
                                                <span className="text-xs text-yellow">Unsaved</span>
                                            )}
                                        </h4>

                                        <div className="flex gap-2">

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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                        <InputForm
                                            label="Title of Examination"
                                            required
                                            message={errors.examinations?.[index]?.title?.message}
                                            {...register(`examinations.${index}.title`)}
                                        />

                                        <InputForm
                                            label="Date Taken"
                                            required
                                            type="date"
                                            message={errors.examinations?.[index]?.date_taken?.message}
                                            {...register(`examinations.${index}.date_taken`)}
                                        />

                                        <InputForm
                                            label="Rating"
                                            message={errors.examinations?.[index]?.rating?.message}
                                            {...register(`examinations.${index}.rating`)}
                                        />

                                    </div>

                                </motion.div>
                            );
                        })}

                    </AnimatePresence>

                </div>

                <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between">

                    <Button
                        type="button"
                        size="medium"
                        variant="outline"
                        onClick={onPrevious}
                    >
                        Previous
                    </Button>

                    <Button
                        type="button"
                        size="medium"
                        variant="outline"
                        onClick={onNext}
                    >
                        Next
                    </Button>

                </div>

            </div>

            {saveIndex !== null && (
                <ConfirmModal
                    title="Save Examination"
                    description="Are you sure you want to save this examination?"
                    action="Save"
                    primaryButtonVariant="primary"
                    onCancel={() => setSaveIndex(null)}
                    onConfirm={confirmSaveExam}
                />
            )}

            {deleteIndex !== null && (
                <ConfirmModal
                    title="Delete Examination"
                    description="Are you sure you want to remove this examination?"
                    action="Delete"
                    primaryButtonVariant="solidDanger"
                    onCancel={() => setDeleteIndex(null)}
                    onConfirm={confirmDelete}
                />
            )}

        </FormProvider>

    );

};


export default ExaminationSection;