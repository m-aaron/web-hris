import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import InputForm from "../../InputForm";
import Button from "../../Button";
import {
    systemSettingsNameSchema,
    systemSettingsWithDescriptionSchema,
} from "../../../schemas/systemSettingsSchema";

const DEFAULT_VALUES = {
    name: "",
    descriptions: "",
};

const SystemSettingsModal = ({
    isOpen,
    mode = "add",
    label,
    showDescriptions = false,
    initialValues,
    onClose,
    onSubmit,
}) => {
    const resolverSchema = useMemo(() => (
        showDescriptions ? systemSettingsWithDescriptionSchema : systemSettingsNameSchema
    ), [showDescriptions]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(resolverSchema),
        mode: "onChange",
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (!isOpen) return;

        reset({
            name: initialValues?.name || "",
            descriptions: initialValues?.descriptions || "",
        });
    }, [isOpen, initialValues, reset]);

    if (!isOpen) return null;

    const title = mode === "edit" ? `Edit ${label}` : `Add ${label}`;

    const handleSave = async (data) => {
        const success = await onSubmit?.(data);
        if (success) {
            onClose?.();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-grey/40 backdrop-blur-sm z-60 px-4">
            <motion.div
                className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
            >
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-heading">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-sm text-muted hover:text-heading"
                    >
                        Close
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(handleSave)}
                    className="px-6 py-5 space-y-4"
                >
                    <InputForm
                        label="Name"
                        required
                        message={errors.name?.message}
                        {...register("name")}
                    />

                    {showDescriptions && (
                        <div>
                            <label className="text-sm text-muted">Descriptions (optional)</label>
                            <textarea
                                className="mt-1 w-full rounded-xl border border-border bg-card p-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                                {...register("descriptions")}
                            />
                        </div>
                    )}

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
                            Save
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SystemSettingsModal;
