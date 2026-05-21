import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import InputForm from "../../InputForm";
import Button from "../../Button";
import SelectForm from "../../SelectForm";

import { getDepartments } from "../../../services/departmentService";
import { getAllActiveEmployees } from "../../../services/employeeService";
import { createFacultySchema, updateFacultySchema } from "../../../schemas/facultySchema";
import { formatEmployeeDisplayName } from "../../../helpers/employeeHelper";

const DEFAULT_VALUES = {
  employee_id: "",
  department_id: "",
  teaching_load: "",
};

const FacultyModal = ({ isOpen, mode = "add", initialValues = {}, onClose, onSubmit }) => {
  const resolver = useMemo(() => (mode === "edit" ? updateFacultySchema : createFacultySchema), [mode]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resolver), mode: "onChange", defaultValues: DEFAULT_VALUES });

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    // reset values (cast ids to strings for consistency with form validation)
    reset({
      employee_id: initialValues.employee_id ? String(initialValues.employee_id) : "",
      department_id: initialValues.department_id ? String(initialValues.department_id) : "",
      teaching_load: initialValues.teaching_load || "",
    });

    // fetch departments and a limited employee list
    (async () => {
      try {
        const [depRes, empRes] = await Promise.all([getDepartments(), getAllActiveEmployees()]);

        setDepartments(depRes.departments || []);
        setEmployees(empRes.employees || []);

        console.log("Employees for faculty modal:", empRes.employees || []);
        console.log("Departments for faculty modal:", depRes.departments || []);

      } catch (e) {
        console.error(e);
      }
    })();

  }, [isOpen, initialValues, reset]);


  // const employeeOptions = useMemo(() => {
  //   return [
  //       { value: "", label: "Select employee" }, 
  //       ...employees.map((e) => ({ value: e.id, label: `${e.employee_no} — ${formatEmployeeDisplayName(e, 'N/A')}` }))];
  // }, [mode, employees, initialValues]);


  if (!isOpen) return null;

  const title = mode === "edit" ? "Edit Faculty" : "Add Faculty";

  const handleSave = async (data) => {
    // Keep both IDs as strings (schema validates them as strings)
    // Backend/database will handle any type conversion
    const payload = {
      ...data,
      employee_id: data.employee_id ? String(data.employee_id) : null,
      department_id: data.department_id ? String(data.department_id) : null,
    };

    console.log("Payload before submit:", payload);
    const success = await onSubmit?.(payload);
    if (success) onClose?.();
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
          <button onClick={onClose} className="text-sm text-muted hover:text-heading">Close</button>
        </div>

        <form onSubmit={handleSubmit(handleSave)} className="px-6 py-5 space-y-4">

          {mode === "add" ? (
            <SelectForm
              label="Employee"
              required
              message={errors.employee_id?.message}
              options={[{ value: "", label: "Select employee" }, ...employees.map((e) => ({ value: String(e.id), label: `${e.employee_no} — ${formatEmployeeDisplayName(e, 'N/A')}` }))]}
              {...register("employee_id")}
            />
          ) : (
            <div>
              <label className="text-sm text-muted mb-1">Employee</label>
              <div className="p-2 bg-card border border-border rounded-xl">{formatEmployeeDisplayName(initialValues, "N/A")}</div>
            </div>
          )}

          <SelectForm
            label="Department"
            required
            message={errors.department_id?.message}
            options={[{ value: "", label: "Select department" }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))]}
            {...register("department_id")}
          />

          <InputForm
            label="Teaching Load"
            placeholder="e.g. 340-LEC, 340-RLE GEN, 350-RLE COMM"
            message={errors.teaching_load?.message}
            {...register("teaching_load")}
          />

          <div className="pt-4 border-t border-border flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="small" className="flex-1 sm:flex-none" onClick={onClose} disabled={isSubmitting}>Cancel</Button>

            <Button type="submit" size="small" className="flex-1 sm:flex-none" loading={isSubmitting} loadingText="Saving...">Save</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FacultyModal;
