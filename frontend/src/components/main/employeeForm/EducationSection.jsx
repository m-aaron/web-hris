import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  saveQualificationData,
  updateQualificationData,
  deleteQualificationData,
  saveMajorData,
  updateMajorData,
  saveMinorData,
  updateMinorData,
  saveHonorData,
  updateHonorData,
  saveScholarshipData,
  updateScholarshipData,
} from "../../../services/employeeService";

import { educationSchema } from "../../../schemas/educationSchema";

import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";
import EducationCard from "./EducationCard";

const EducationSection = ({ employee, setEmployee, onPrevious, onNext }) => {
  const [saveIndex, setSaveIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [savingRow, setSavingRow] = useState(null);

  const methods = useForm({
    resolver: zodResolver(educationSchema),
    mode: "onChange",
    defaultValues: {
      education: employee?.education || [],
    },
  });

  const {
    control,
    watch,
    reset,
    setValue,
    trigger,
    formState: { dirtyFields },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const education = watch("education") || [];


  // TRANSFORM BACKEND DATA
  useEffect(() => {
    if (!employee) return;

    const transformedEducation = (employee.education || []).map((edu) => {
      const majors =
        employee.education_majors
          ?.filter((m) => m.education_id === edu.id)
          .map((m) => ({
            id: m.id,
            name: m.major_name,
          })) || [];

      const minors =
        employee.education_minors
          ?.filter((m) => m.education_id === edu.id)
          .map((m) => ({
            id: m.id,
            name: m.minor_name,
          })) || [];

      const honors =
        employee.education_honors
          ?.filter((h) => h.education_id === edu.id)
          .map((h) => ({
            id: h.id,
            name: h.honor_name,
          })) || [];

      const scholarships =
        employee.education_scholarships
          ?.filter((s) => s.education_id === edu.id)
          .map((s) => ({
            id: s.id,
            name: s.scholarship_name,
          })) || [];

      return {
        ...edu,
        majors,
        minors,
        honors,
        scholarships,
      };
    });

    reset({
      education: transformedEducation,
    });
  }, [employee, reset]);


  // SAVE NESTED ITEMS
  const saveNestedItems = async (
    educationId,
    items,
    saveFn,
    updateFn,
    key,
    path,
  ) => {
    if (!items || items.length === 0) return [];

    const results = [];

    for (const item of items) {
      if (!item.name) continue;

      const payload = { [key]: item.name };

      try {
        let res;

        if (item.id) {
          res = await updateFn(educationId, item.id, payload);
        } else {
          res = await saveFn(educationId, payload);
        }

        const saved =
          res[key] || res.major || res.minor || res.honor || res.scholarship;

        if (saved) {
          results.push({
            id: saved.id,
            name: item.name,
          });
        }
      } catch (error) {
        console.error(`Error saving ${key}`, error);
      }
    }

    setValue(path, results);
    return results;
  };


  const handleSaveEducation = async (index) => {
    const isValid = await trigger(`education.${index}`);

    if (!isValid) {
      toast.error("Please fix validation errors");
      return;
    }

    const edu = education[index];

    try {
      setSavingRow(index);

      const payload = {
        title: edu.title || "",
        school: edu.school || "",
        yearStarted: edu.year_started || null,
        yearFinished: edu.year_finished || null,
      };

      let res;

      if (edu.id) {
        res = await updateQualificationData(
          employee.employee.id,
          edu.id,
          payload,
        );
      } else {
        res = await saveQualificationData(employee.employee.id, payload);
      }

      const savedQualification = res.qualification;
      const educationId = savedQualification.id;

      const majors = await saveNestedItems(
        educationId,
        edu.majors,
        saveMajorData,
        updateMajorData,
        "major",
        `education.${index}.majors`,
      );

      const minors = await saveNestedItems(
        educationId,
        edu.minors,
        saveMinorData,
        updateMinorData,
        "minor",
        `education.${index}.minors`,
      );

      const honors = await saveNestedItems(
        educationId,
        edu.honors,
        saveHonorData,
        updateHonorData,
        "honor",
        `education.${index}.honors`,
      );

      const scholarships = await saveNestedItems(
        educationId,
        edu.scholarships,
        saveScholarshipData,
        updateScholarshipData,
        "scholarship",
        `education.${index}.scholarships`,
      );

      const updatedEducation = [...(employee.education || [])];

      const newEdu = {
        ...savedQualification,
        majors,
        minors,
        honors,
        scholarships,
      };

      if (edu.id) {
        const i = updatedEducation.findIndex((e) => e.id === edu.id);

        if (i !== -1) {
          updatedEducation[i] = newEdu;
        }
      } else {
        updatedEducation.push(newEdu);
      }

      setEmployee((prev) => {
        const merge = (oldArr, newArr, field) => {
          const others = (oldArr || []).filter(
            (i) => i.education_id !== educationId,
          );

          const mapped = (newArr || []).map((i) => ({
            id: i.id,
            education_id: educationId,
            [`${field}_name`]: i.name,
          }));

          return [...others, ...mapped];
        };

        return {
          ...prev,
          education: updatedEducation,
          education_majors: merge(prev.education_majors, majors, "major"),
          education_minors: merge(prev.education_minors, minors, "minor"),
          education_honors: merge(prev.education_honors, honors, "honor"),
          education_scholarships: merge(
            prev.education_scholarships,
            scholarships,
            "scholarship",
          ),
        };
      });

      toast.success("Education saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save education");
    } finally {
      setSavingRow(null);
    }
  };


  const confirmSaveEducation = async () => {
    if (saveIndex === null) return;

    await handleSaveEducation(saveIndex);

    setSaveIndex(null);
  };

  const confirmDelete = async () => {
    const edu = education[deleteIndex];

    if (!edu?.id) {
      toast.info("Save the education first before deleting.");
      setDeleteIndex(null);
      return;
    }

    try {
      await deleteQualificationData(employee.employee.id, edu.id);

      remove(deleteIndex);

      setEmployee((prev) => ({
        ...prev,
        education: prev.education.filter((e) => e.id !== edu.id),
      }));

      toast.success("Education deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }

    setDeleteIndex(null);
  };


  const handleAddEducation = () => {
    append({
      id: undefined,
      title: "",
      school: "",
      year_started: "",
      year_finished: "",
      majors: [],
      minors: [],
      honors: [],
      scholarships: [],
    });
  };


  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Educational Qualifications
            </h3>

            <Button type="button" size="small" onClick={handleAddEducation}>
              + Add Education
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted">
              No education records added yet. Click + Add Education to create one.
            </p>
          )}

          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <EducationCard
                  index={index}
                  savingRow={savingRow}
                  isDirty={!!dirtyFields?.education?.[index]}
                  openSaveConfirm={setSaveIndex}
                  setDeleteIndex={setDeleteIndex}
                />
              </motion.div>
            ))}
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
          title="Save Education"
          description="Are you sure you want to save this education record?"
          action="Save"
          primaryButtonVariant="primary"
          onCancel={() => setSaveIndex(null)}
          onConfirm={confirmSaveEducation}
        />
      )}

      {deleteIndex !== null && (
        <ConfirmModal
          title="Delete Education"
          description="Are you sure you want to remove this education record?"
          action="Delete"
          primaryButtonVariant="solidDanger"
          onCancel={() => setDeleteIndex(null)}
          onConfirm={confirmDelete}
        />
      )}
    </FormProvider>
  );
};

export default EducationSection;
