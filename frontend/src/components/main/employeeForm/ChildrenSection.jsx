import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  updateChildrenData,
  saveChildrenData,
  deleteChildrenData,
} from "../../../services/employeeService";
import { formatPHDate } from "../../../helpers/dateHelper";

import { childrenSchema } from "../../../schemas/childrenSchema";
import { calculateAge } from "../../../helpers/employeeHelper";

import InputForm from "../../InputForm";
import SelectForm from "../../SelectForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";


const ChildrenSection = ({ employee, setEmployee, onPrevious, onNext }) => {

  const [saveIndex, setSaveIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [savingRow, setSavingRow] = useState(null);

  const methods = useForm({
    resolver: zodResolver(childrenSchema),
    mode: "onChange",
    defaultValues: {
      children: employee?.children || [],
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
    name: "children",
  });


  useEffect(() => {
    if (!employee) return;

    reset({
      children: (employee.children || []).map((child) => ({
        ...child,
        birth_date: formatPHDate(child.birth_date),
      })),
    });
  }, [employee, reset]);


  const children = watch("children") || [];


  // SAVE CHILD
  const handleSaveChild = async (index) => {
    const isValid = await trigger(`children.${index}`);

    if (!isValid) {
      toast.error("Please fix validation errors");
      return;
    }

    const child = children[index];

    const payload = {
      lastName: child.children_name?.last_name || "",
      firstName: child.children_name?.first_name || "",
      middleName: child.children_name?.middle_name || "",
      nameExtension: child.children_name?.name_extension || "",
      birthDate:
        child.birth_date && child.birth_date !== "-" ? child.birth_date : null,
      office: child.office_school || "",
      occupation: child.occupation || "",
    };

    try {
      setSavingRow(index);

      let res;

      if (child.id) {
        res = await updateChildrenData(employee.employee.id, child.id, payload);
      } else {
        res = await saveChildrenData(employee.employee.id, payload);
      }

      const updated = [...(employee.children || [])];

      if (child.id) {
        const i = updated.findIndex((c) => c.id === child.id);

        if (i !== -1) updated[i] = res.child;
      } else {
        updated.push(res.child);
      }

      setEmployee((prev) => ({
        ...prev,
        children: updated,
      }));

      toast.success(res.message || "Child saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save child");
    } finally {
      setSavingRow(null);
    }
  };


  const openSaveConfirm = (index) => {
    setSaveIndex(index);
  };


  const confirmSaveChild = async () => {
    if (saveIndex === null) return;

    await handleSaveChild(saveIndex);

    setSaveIndex(null);
  };


  // DELETE CHILD
  const confirmDelete = async () => {
    const child = children[deleteIndex];

    if (!child?.id) {
      toast.info("Please save the child first before deleting.");
      setDeleteIndex(null);
      return;
    }

    try {
      const res = await deleteChildrenData(employee.employee.id, child.id);

      remove(deleteIndex);

      setEmployee((prev) => ({
        ...prev,
        children: prev.children.filter((c) => c.id !== child.id),
      }));

      toast.success(res.message || "Child deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }

    setDeleteIndex(null);
  };


  // ADD CHILD
  const handleAddChild = () => {
    append({
      id: undefined,
      children_name: {
        last_name: "",
        first_name: "",
        middle_name: "",
        name_extension: "",
      },
      birth_date: "",
      office_school: "",
      occupation: "",
    });
  };

  
  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Children
            </h3>

            <Button type="button" size="small" onClick={handleAddChild}>
              + Add Child
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted">
              No children added yet. Click + Add Child to create one.
            </p>
          )}

          <AnimatePresence>
            {fields.map((field, index) => {
              const birthdate = watch(`children.${index}.birth_date`);
              const age = calculateAge(birthdate);

              const isDirty = !!dirtyFields?.children?.[index];

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
                      Child {index + 1}
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
                      label="Last Name"
                      required
                      message={
                        errors.children?.[index]?.children_name?.last_name?.message
                      }
                      {...register(`children.${index}.children_name.last_name`)}
                    />

                    <InputForm
                      label="First Name"
                      required
                      message={
                        errors.children?.[index]?.children_name?.first_name?.message
                      }
                      {...register(
                        `children.${index}.children_name.first_name`,
                      )}
                    />

                    <InputForm
                      label="Middle Name"
                      {...register(
                        `children.${index}.children_name.middle_name`,
                      )}
                    />

                    <SelectForm
                      label="Name Extension"
                      {...register(
                        `children.${index}.children_name.name_extension`,
                      )}
                      options={[
                        { value: "", label: "None" },
                        { value: "JR", label: "Jr." },
                        { value: "SR", label: "Sr." },
                        { value: "II", label: "II" },
                        { value: "III", label: "III" },
                        { value: "IV", label: "IV" },
                        { value: "V", label: "V" },
                      ]}
                    />

                    <InputForm
                      label="Birth Date"
                      type="date"
                      message={errors.children?.[index]?.birth_date?.message}
                      {...register(`children.${index}.birth_date`)}
                    />

                    <InputForm label="Age" value={age || ""} disabled />

                    <InputForm
                      label="Office / School"
                      {...register(`children.${index}.office_school`)}
                    />

                    <InputForm
                      label="Occupation"
                      {...register(`children.${index}.occupation`)}
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
          title="Save Child"
          description="Are you sure you want to save this child information?"
          action="Save"
          primaryButtonVariant="primary"
          onCancel={() => setSaveIndex(null)}
          onConfirm={confirmSaveChild}
        />
      )}

      {deleteIndex !== null && (
        <ConfirmModal
          title="Delete Child"
          description="Are you sure you want to remove this child?"
          action="Delete"
          primaryButtonVariant="solidDanger"
          onCancel={() => setDeleteIndex(null)}
          onConfirm={confirmDelete}
        />
      )}
    </FormProvider>
  );
};

export default ChildrenSection;
