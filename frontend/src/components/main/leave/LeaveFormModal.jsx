import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

import { formatPHDate } from "../../../helpers/dateHelper";

import InputForm from "../../InputForm";
import SelectForm from "../../SelectForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";
import { leaveApplicationSchema } from "../../../schemas/leaveSchema";
import { id } from "zod/v4/locales";

const DEFAULT_FORM = {
  employee_id: "",
  date_filed: "",
  department_unit: "",
  substitute_name: "",
  subjects_covered: [],
  reason: "",
  leave_types: [
    {
      leave_type_id: "",
      date_from: "",
      date_to: "",
      number_of_days: "",
      other_leave_details: "",
    },
  ],
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
    initialData = null,
}) => {
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [isDaysManualMap, setIsDaysManualMap] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(leaveApplicationSchema),
        mode: "onChange",
        defaultValues: DEFAULT_FORM,
    });

    const {
        fields: leaveTypeFields,
        append: appendLeaveType,
        remove: removeLeaveType,
    } = useFieldArray({ control, name: "leave_types" });
    const {
        fields: subjectFields,
        append: appendSubject,
        remove: removeSubject,
    } = useFieldArray({ control, name: "subjects_covered" });

    const watchedLeaveTypes = watch("leave_types");

    useEffect(() => {
        if (!isOpen) return;
        // if editing, map initialData to form shape, otherwise reset defaults
        if (initialData) {
            const app = initialData;
            const leaveRows = initialData.leaveTypes || initialData.leave_types || [];
            const mapped = {
                id: String(app.id || ""),
                employee_id: String(app.employee_id || ""),
                date_filed: app.date_filed ? formatPHDate(app.date_filed) : new Date().toISOString().slice(0,10),
                department_unit: app.department_unit || "",
                substitute_name: app.substitute_name || "",
                subjects_covered: app.subjects_covered || [],
                reason: app.reason || "",
                leave_types: leaveRows.map((lt) => ({
                    leave_type_id: lt.leave_type_id ? String(lt.leave_type_id) : String(lt.leave_type_id || ""),
                    date_from: lt.date_from ? formatPHDate(lt.date_from) : "",
                    date_to: lt.date_to ? formatPHDate(lt.date_to) : "",
                    number_of_days: lt.number_of_days != null ? String(lt.number_of_days) : "",
                    other_leave_details: lt.other_leave_details || null,
                })),
            };
            reset(mapped);
        } else {
            reset(DEFAULT_FORM);
        }
        setEmployeeSearch("");
        setIsDaysManualMap({});
        setShowConfirm(false);
        setPendingData(null);
        // // default Date Filed to today (YYYY-MM-DD)
        // const today = new Date().toISOString().slice(0, 10);
        // try {
        //   setValue("date_filed", today);
        // } catch (e) {
        //   // ignore
        // }
    }, [isOpen, reset, setValue, initialData]);

    // compute days per leave type row when dates change
    useEffect(() => {
        const watched = Array.isArray(watchedLeaveTypes) ? watchedLeaveTypes : [];

        watched.forEach((row, idx) => {
        const { date_from, date_to, number_of_days } = row || {};
        const computed = calculateDays(date_from, date_to);
        const manualFlag = isDaysManualMap[idx];

        if (!manualFlag && computed !== "") {
            if (String(number_of_days || "") !== String(computed)) {
            setValue(`leave_types.${idx}.number_of_days`, String(computed), {
                shouldValidate: true,
            });
            }
        }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        JSON.stringify(watchedLeaveTypes || []),
        JSON.stringify(isDaysManualMap),
    ]);

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

    const findEmployeeById = (id) =>
        employees.find((e) => String(e.id) === String(id));

    const substituteOptions = useMemo(() => {
        const selectedId = watch("employee_id");
        return [
        { value: "", label: "Select substitute (optional)" },
        ...employees
            .filter((e) => String(e.id) !== String(selectedId))
            .map((employee) => {
            const fullName =
                employee.display_name ||
                `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
            const display = fullName
                ? `${employee.employee_no || ''} - ${fullName}`
                : employee.employee_no || '';
            return {
                value: display,
                label: display,
            };
            }),
        ];
    }, [employees, watch]);

    // ensure subjects covered rows: when selected employee is TEACHING, start with one row
    useEffect(() => {
        const selectedId = watch("employee_id");
        const selectedEmployee = findEmployeeById(selectedId);
        if (selectedEmployee && selectedEmployee.employment_type === "TEACHING") {
        if (subjectFields.length === 0) {
            appendSubject({ subject: "", day: "", time: "" });
        }
        } else {
        // clear subjects when not teaching
        if (subjectFields.length > 0) {
            try {
            setValue("subjects_covered", []);
            } catch (e) {}
        }
        }
    }, [watch("employee_id")]);

    const handleRequestSubmit = (data) => {
        // frontend validation for 'Others' leave type details - set per-field errors
        let foundInvalid = false;
        (data.leave_types || []).forEach((lt, idx) => {
        const selected = leaveTypes.find(
            (t) => String(t.id) === String(lt.leave_type_id),
        );
        const isOthers =
            selected && String(selected.name).toLowerCase() === "others";
        if (
            isOthers &&
            (!lt.other_leave_details ||
            String(lt.other_leave_details).trim() === "")
        ) {
            setError(
            `leave_types.${idx}.other_leave_details`,
            {
                type: "required",
                message: "Please specify details for 'Others' leave type.",
            },
            { shouldFocus: idx === 0 },
            );
            foundInvalid = true;
        }
        });

        if (foundInvalid) return;

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
        <div className="fixed inset-0 z-60 px-0 sm:px-4 flex items-start sm:items-center justify-center bg-grey/40 backdrop-blur-sm">
        <motion.div
            className="bg-card w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl rounded-none sm:rounded-2xl shadow-xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
        >
            <div className="flex-1 overflow-y-auto space-y-10 scrollbar">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-heading">
                File Leave Application
                </h2>
            </div>

            <form
                onSubmit={handleSubmit(handleRequestSubmit)}
                className="flex flex-col h-full"
            >
                <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-10 scrollbar">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                    Leave Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <InputForm
                        label="Department Unit"
                        {...register("department_unit")}
                    />

                    {(() => {
                        const selEmp = findEmployeeById(watch("employee_id"));
                            if (selEmp && selEmp.employment_type === "TEACHING") {
                                return null;
                            }
                            return (
                                <InputForm
                                    label="Substitute (optional)"
                                    {...register("substitute_name")}
                                />
                            );
                        })()}

                    <InputForm
                        label="Date Filed (optional)"
                        type="date"
                        message={errors.date_filed?.message}
                        {...register("date_filed")}
                    />
                    </div>

                    <div className="border border-border rounded-xl p-4 space-y-3 mt-10">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm text-muted">Leave Rows</h4>
                        <Button
                        type="button"
                        size="small"
                        variant="ghost"
                        className="text-sm text-primary"
                        onClick={() =>
                            appendLeaveType({
                            leave_type_id: "",
                            date_from: "",
                            date_to: "",
                            number_of_days: "",
                            other_leave_details: "",
                            })
                        }
                        >
                        + Add leave row
                        </Button>
                    </div>

                    <AnimatePresence>
                        {leaveTypeFields.map((field, idx) => {
                        const ltError = errors.leave_types?.[idx] || {};
                        const selectedTypeId =
                            watchedLeaveTypes?.[idx]?.leave_type_id;
                        const selectedType = leaveTypes.find(
                            (t) => String(t.id) === String(selectedTypeId),
                        );
                        const isOthers =
                            selectedType &&
                            String(selectedType.name).toLowerCase() === "others";

                        return (
                            <motion.div
                            key={field.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end border border-border rounded-xl p-3"
                            >
                            <div className="sm:col-span-5 lg:col-span-4">
                                <SelectForm
                                label="Leave Type"
                                required
                                message={ltError?.leave_type_id?.message}
                                {...register(`leave_types.${idx}.leave_type_id`)}
                                options={leaveTypeOptions}
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <InputForm
                                label="From"
                                type="date"
                                required
                                message={ltError?.date_from?.message}
                                {...register(`leave_types.${idx}.date_from`)}
                                />
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3">
                                <InputForm
                                label="To"
                                type="date"
                                required
                                message={ltError?.date_to?.message}
                                {...register(`leave_types.${idx}.date_to`)}
                                />
                            </div>

                            <div className="sm:col-span-2 lg:col-span-2">
                                <InputForm
                                label="Days"
                                type="number"
                                required
                                message={ltError?.number_of_days?.message}
                                {...register(`leave_types.${idx}.number_of_days`)}
                                onBlur={() => {
                                    setIsDaysManualMap((m) => ({
                                    ...m,
                                    [idx]: true,
                                    }));
                                }}
                                />
                            </div>

                            <div className="sm:col-span-12 lg:col-span-12">
                                {isOthers && (
                                (() => {
                                    const reg = register(`leave_types.${idx}.other_leave_details`);
                                    return (
                                    <InputForm
                                        label="Please specify"
                                        required
                                        message={ltError?.other_leave_details?.message}
                                        {...reg}
                                        onInput={() => clearErrors(`leave_types.${idx}.other_leave_details`)}
                                    />
                                    );
                                })()
                                )}
                            </div>

                            <div className="sm:col-span-12 flex gap-2 justify-end">
                                {leaveTypeFields.length > 1 && (
                                <Button
                                    type="button"
                                    size="small"
                                    variant="danger"
                                    onClick={() => removeLeaveType(idx)}
                                >
                                    Remove
                                </Button>
                                )}
                            </div>
                            </motion.div>
                        );
                        })}
                    </AnimatePresence>
                    </div>

                    {/* Subjects covered (for TEACHING employees) */}
                    {(() => {
                    const selectedEmployee = findEmployeeById(
                        watch("employee_id"),
                    );
                    if (
                        !selectedEmployee ||
                        selectedEmployee.employment_type !== "TEACHING"
                    )
                        return null;

                    return (
                        <div className="space-y-3 mt-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Subjects Covered
                            </h3>
                            <Button
                            type="button"
                            size="small"
                            variant="ghost"
                            className="text-sm text-primary"
                            onClick={() =>
                                appendSubject({ subject: "", day: "", time: "", substitute_name: "" })
                            }
                            >
                            + Add subject
                            </Button>
                        </div>
                        <div className="border border-border rounded-xl p-4 space-y-7">
                            <AnimatePresence>
                            {subjectFields.map((sfield, sidx) => (
                                <motion.div
                                key={sfield.id}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center"
                                >
                                <div className="sm:col-span-5">
                                    <InputForm
                                    label="Subject"
                                    required
                                    {...register(`subjects_covered.${sidx}.subject`)}
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <InputForm
                                    label="Day"
                                    required
                                    {...register(`subjects_covered.${sidx}.day`)}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputForm
                                    label="Time"
                                    required
                                    {...register(`subjects_covered.${sidx}.time`)}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputForm
                                    label="Substitute"
                                    {...register(`subjects_covered.${sidx}.substitute_name`)}
                                    />
                                </div>
                                <div className="sm:col-span-12 flex items-center justify-end">
                                    <Button
                                    type="button"
                                    size="small"
                                    variant="danger"
                                    onClick={() => removeSubject(sidx)}
                                    >
                                    Remove
                                    </Button>
                                </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                        </div>
                    );
                    })()}
                </div>

                <div className="border border-border rounded-xl p-4 space-y-4">
                    <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
                    Reason
                    </h4>

                    <div>
                    <label className="text-sm text-muted">
                        Reason (optional)
                    </label>
                    <textarea
                        className="mt-1 w-full rounded-xl border border-border bg-card p-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        {...register("reason")}
                    />
                    </div>
                </div>
                </div>

                <div className="sticky bottom-0 bg-card border-t border-border px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
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
            </div>
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
