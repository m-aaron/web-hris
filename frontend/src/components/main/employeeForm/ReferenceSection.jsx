import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
    saveReference,
    updateReference,
    deleteReference
} from "../../../services/employeeService";

import { referenceSchema } from "../../../schemas/referenceSchema";

import InputForm from "../../InputForm";
import SelectForm from "../../SelectForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";


const ReferenceSection = ({ employee, setEmployee, onPrevious, onNext, isLastSection }) => {

    const [saveIndex, setSaveIndex] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [savingRow, setSavingRow] = useState(null);

    const methods = useForm({
        resolver: zodResolver(referenceSchema),
        mode: "onChange",
        defaultValues: {
            references: []
        }
    });

    const {
        register,
        control,
        watch,
        reset,
        trigger,
        formState: { errors, dirtyFields }
    } = methods;


    const { fields, append, remove } = useFieldArray({
        control,
        name: "references"
    });


    useEffect(() => {
        if (!employee) return;

        // Transform backend data to match schema structure
        const transformedReferences = (employee.references || []).map(ref => ({
            id: ref.id,
            name: {
                last_name: ref.name?.last_name || "",
                first_name: ref.name?.first_name || "",
                middle_name: ref.name?.middle_name || "",
                name_extension: ref.name?.name_extension || ""
            },
            address: {
                house_no: ref.address?.house_no || "",
                street: ref.address?.street || "",
                barangay: ref.address?.barangay || "",
                city: ref.address?.city || "",
                province: ref.address?.province || "",
                zip: ref.address?.zip || ""
            },
            contact_number: ref.contact_number || ""
        }));

        reset({ references: transformedReferences });

    }, [employee, reset]);


    const references = watch("references") || [];


    const handleSaveReference = async (index) => {

        const isValid = await trigger(`references.${index}`);

        if (!isValid) {
            toast.error("Please fix validation errors");
            return;
        }

        const reference = references[index];

        const payload = {
            lastName: reference.name?.last_name || "",
            firstName: reference.name?.first_name || "",
            middleName: reference.name?.middle_name || "",
            nameExtension: reference.name?.name_extension || "",

            houseNo: reference.address?.house_no || "",
            street: reference.address?.street || "",
            barangay: reference.address?.barangay || "",
            city: reference.address?.city || "",
            province: reference.address?.province || "",
            zip: reference.address?.zip || "",

            contactNumber: reference.contact_number || ""
        };

        try {

            setSavingRow(index);

            let res;

            if (reference.id) {
                res = await updateReference(
                    employee.employee.id,
                    reference.id,
                    payload
                );
            } else {
                res = await saveReference(
                    employee.employee.id,
                    payload
                );
            }

            const updated = [...(employee.references || [])];

            if (reference.id) {
                const i = updated.findIndex(r => r.id === reference.id);

                if (i !== -1) updated[i] = res.reference;
            } else {
                updated.push(res.reference);
            }

            setEmployee(prev => ({
                ...prev,
                references: updated
            }));

            toast.success(res.message || "Reference saved");

        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save reference");
        } finally {
            setSavingRow(null);
        }

    };


    const openSaveConfirm = (index) => {
        setSaveIndex(index);
    };


    const confirmSaveReference = async () => {
        if (saveIndex === null) return;

        await handleSaveReference(saveIndex);

        setSaveIndex(null);
    };


    const confirmDelete = async () => {
        const reference = references[deleteIndex];

        if (!reference?.id) {

            toast.info("Save the reference first before deleting");

            setDeleteIndex(null);

            return;
        }

        try {

            await deleteReference(
                employee.employee.id,
                reference.id
            );

            remove(deleteIndex);

            setEmployee(prev => ({
                ...prev,
                references: prev.references.filter(
                    r => r.id !== reference.id
                )
            }));

            toast.success("Reference deleted");

        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }

        setDeleteIndex(null);

    };


    const handleAddReference = () => {

        append({
            id: undefined,
            name: {
                last_name: "",
                first_name: "",
                middle_name: "",
                name_extension: ""
            },
            address: {
                house_no: "",
                street: "",
                barangay: "",
                city: "",
                province: "",
                zip: ""
            },
            contact_number: ""
        });

    };


    return (

        <FormProvider {...methods}>

            <div className="flex flex-col h-full">

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Character References
                        </h3>

                        <Button
                            type="button"
                            size="small"
                            onClick={handleAddReference}
                        >
                            + Add Reference
                        </Button>

                    </div>

                    {fields.length === 0 && (
                        <p className="text-sm text-muted">
                            No references added.
                        </p>
                    )}

                    <AnimatePresence>

                        {fields.map((field, index) => {

                            const isDirty = !!dirtyFields?.references?.[index];

                            return (

                                <motion.div
                                    key={field.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className={`border rounded-lg p-4 space-y-6 ${
                                        isDirty
                                            ? "border-yellow bg-yellow/5"
                                            : "border-border"
                                    }`}
                                >

                                    <div className="flex flex-wrap items-center justify-between gap-3">

                                        <h4 className="text-sm text-heading font-medium flex items-center gap-2">
                                            Reference {index + 1}

                                            {isDirty && (
                                                <span className="text-xs text-yellow">
                                                    Unsaved
                                                </span>
                                            )}

                                        </h4>

                                        <div className="flex w-full sm:w-auto flex-wrap gap-2">

                                            <Button
                                                type="button"
                                                size="small"
                                                onClick={() => openSaveConfirm(index)}
                                                disabled={savingRow === index}
                                            >
                                                {savingRow === index
                                                    ? "Saving..."
                                                    : "Save"}
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


                                    {/* Personal Information */}
                                    <div className="space-y-3">

                                        <h5 className="text-xs font-semibold uppercase text-muted">
                                            Personal Information
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                            <InputForm
                                                label="Last Name"
                                                required
                                                message={errors.references?.[index]?.name?.last_name?.message}
                                                {...register(`references.${index}.name.last_name`)}
                                            />

                                            <InputForm
                                                label="First Name"
                                                required
                                                message={errors.references?.[index]?.name?.first_name?.message}
                                                {...register(`references.${index}.name.first_name`)}
                                            />

                                            <InputForm
                                                label="Middle Name"
                                                message={errors.references?.[index]?.name?.middle_name?.message}
                                                {...register(`references.${index}.name.middle_name`)}
                                            />

                                            <SelectForm
                                                label="Name Extension"
                                                {...register(`references.${index}.name.name_extension`)}
                                                options={[
                                                    { value: "", label: "None" },
                                                    { value: "JR", label: "Jr." },
                                                    { value: "SR", label: "Sr." },
                                                    { value: "II", label: "II" },
                                                    { value: "III", label: "III" },
                                                    { value: "IV", label: "IV" },
                                                    { value: "V", label: "V" }
                                                ]}
                                            />

                                            <InputForm
                                                label="Contact Number"
                                                message={errors.references?.[index]?.contact_number?.message}
                                                {...register(`references.${index}.contact_number`)}
                                            />

                                        </div>

                                    </div>


                                    {/* Address Information */}
                                    <div className="space-y-3">

                                        <h5 className="text-xs font-semibold uppercase text-muted">
                                            Address
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                            <InputForm
                                                label="House No"
                                                message={errors.references?.[index]?.address?.house_no?.message}
                                                {...register(`references.${index}.address.house_no`)}
                                            />

                                            <InputForm
                                                label="Street"
                                                message={errors.references?.[index]?.address?.street?.message}
                                                {...register(`references.${index}.address.street`)}
                                            />

                                            <InputForm
                                                label="Barangay"
                                                message={errors.references?.[index]?.address?.barangay?.message}
                                                {...register(`references.${index}.address.barangay`)}
                                            />

                                            <InputForm
                                                label="City"
                                                message={errors.references?.[index]?.address?.city?.message}
                                                {...register(`references.${index}.address.city`)}
                                            />

                                            <InputForm
                                                label="Province"
                                                message={errors.references?.[index]?.address?.province?.message}
                                                {...register(`references.${index}.address.province`)}
                                            />

                                            <InputForm
                                                label="ZIP"
                                                message={errors.references?.[index]?.address?.zip?.message}
                                                {...register(`references.${index}.address.zip`)}
                                            />

                                        </div>

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
                        disabled={isLastSection}
                    >
                        Next
                    </Button>

                </div>

            </div>


            {saveIndex !== null && (

                <ConfirmModal
                    title="Save Reference"
                    description="Are you sure you want to save this reference?"
                    action="Save"
                    primaryButtonVariant="primary"
                    onCancel={() => setSaveIndex(null)}
                    onConfirm={confirmSaveReference}
                />

            )}

            {deleteIndex !== null && (

                <ConfirmModal
                    title="Delete Reference"
                    description="Are you sure you want to remove this reference?"
                    action="Delete"
                    primaryButtonVariant="solidDanger"
                    onCancel={() => setDeleteIndex(null)}
                    onConfirm={confirmDelete}
                />

            )}

        </FormProvider>

    );

};

export default ReferenceSection;
