import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    saveEmploymentData,
    getAllPositions,
    getAllDesignations
} from "../../../services/employeeService";
import { employmentSchema } from "../../../schemas/employmentSchema";
import { STATUSES, BASIS } from "../../../constants/roleConstant";
import { formatPHDate } from "../../../helpers/dateHelper";

import InputForm from "../../InputForm";
import SelectForm from "../../SelectForm";
import Button from "../../Button";
import ConfirmModal from "../ui/ConfirmModal";


const EmploymentSection = ({ employee, setEmployee, onPrevious, onNext, isFirstSection }) => {

    const employmentStatusOptions = [
        { value: STATUSES.REGULAR, label: STATUSES.REGULAR },
        { value: STATUSES.PROBATIONARY, label: STATUSES.PROBATIONARY },
        { value: STATUSES.CONTRACTUAL, label: STATUSES.CONTRACTUAL },
        { value: STATUSES.RESIGNED, label: STATUSES.RESIGNED },
    ];

    const employmentBasisOptions = [
        { value: BASIS.FULL_TIME, label: "Full Time" },
        { value: BASIS.PART_TIME, label: "Part Time" },
    ];


    const methods = useForm({
        resolver: zodResolver(employmentSchema),
        defaultValues: {
        employment_status: employmentStatusOptions[0].value,
        employment_basis: employmentBasisOptions[0].value,
        ...(employee?.employment || {}),
        },
    });


    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = methods;


    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);
    const [positions, setPositions] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [optionsLoaded, setOptionsLoaded] = useState(false);

    const otherEmployment = watch("other_employment");


    const positionOptions = useMemo(
        () =>
        positions.map((p) => ({
            value: p.id,
            label: p.name.replace("_", "-"),
        })),
        [positions],
    );


    useEffect(() => {
        const fetchPositionsAndDesignations = async () => {
        try {
            const positionsRes = await getAllPositions();
            const designationsRes = await getAllDesignations();

            setPositions(positionsRes.positions);
            setDesignations(designationsRes.designations);
            setOptionsLoaded(true);
        } catch (error) {
            console.error("Error fetching positions and designations:", error);
        }
        };

        fetchPositionsAndDesignations();
    }, []);


    useEffect(() => {
        if (!employee || !optionsLoaded) return;

        const emp = employee.employment || {};

        reset({
        date_hired: formatPHDate(emp.date_hired) || "",
        position_id: emp.position_id || positionOptions[0]?.value || "",
        designation_id: emp.designation_id || "",
        sss: emp.sss || "",
        pagibig: emp.pagibig || "",
        tax: emp.tax || "",
        philhealth: emp.philhealth || "",
        peraa: emp.peraa || "",
        employment_status:
            emp.employment_status || employmentStatusOptions[0].value,
        employment_basis: emp.employment_basis || employmentBasisOptions[0].value,
        official_working_hours: emp.official_working_hours || "",
        other_employment: emp.other_employment || "",
        other_employment_working_hours: emp.other_employment_working_hours || "",
        });
    }, [employee, optionsLoaded, positionOptions, reset]);


    const handleSaveChanges = async (data) => {
        try {
        const payload = {
            dateHired: data.date_hired,
            position: data.position_id,
            designation: data.designation_id,
            sss: data.sss,
            pagibig: data.pagibig,
            tax: data.tax,
            philhealth: data.philhealth,
            peraa: data.peraa,
            employmentStatus: data.employment_status,
            employmentBasis: data.employment_basis,
            workingHours: data.official_working_hours,
            otherEmployment: data.other_employment,
            otherWorkingHours: data.other_employment_working_hours,
        };

        const res = await saveEmploymentData(employee.employee.id, payload);

        setEmployee((prev) => ({
            ...prev,
            employment: res.employmentData,
            employee: res.employee
            ? { ...prev.employee, ...res.employee }
            : prev.employee,
        }));

        toast.success("Employment information updated successfully");
        } catch (err) {
        toast.error(
            err?.response?.data?.message ||
            "Failed to update employment information",
        );
        }
    };


    const openConfirmModal = (data) => {
        setPendingData(data);
        setShowConfirmModal(true);
    };


    const confirmSave = () => {
        if (!pendingData) return;

        setShowConfirmModal(false);
        handleSaveChanges(pendingData);
        setPendingData(null);
    };


    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(openConfirmModal)}
                className="flex flex-col h-full"
            >
                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar">
                    
                    {/* EMPLOYMENT DETAILS */}
                    <div className="space-y-4">

                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Employment Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            
                            <InputForm
                                label="Date Hired"
                                type="date"
                                required
                                message={errors.date_hired?.message}
                                {...register("date_hired")}
                            />

                            <SelectForm
                                label="Position"
                                required
                                message={errors.position_id?.message}
                                {...register("position_id")}
                                options={positionOptions}
                            />

                            <SelectForm
                                label="Designation"
                                message={errors.designation_id?.message}
                                {...register("designation_id")}
                                options={[
                                { value: "", label: "Select Designation" },
                                ...designations.map((d) => ({
                                    value: d.id,
                                    label: d.name.replace("_", "-"),
                                })),
                                ]}
                            />

                        </div>

                    </div>

                    {/* GOVERNMENT IDENTIFICATION */}
                    <div className="space-y-4">

                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Government Identification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            <InputForm
                                label="SSS Number"
                                message={errors.sss?.message}
                                {...register("sss")}
                            />

                            <InputForm
                                label="PAG-IBIG Number"
                                message={errors.pagibig?.message}
                                {...register("pagibig")}
                            />

                            <InputForm
                                label="TAX Number"
                                message={errors.tax?.message}
                                {...register("tax")}
                            />

                            <InputForm
                                label="PhilHealth Number"
                                message={errors.philhealth?.message}
                                {...register("philhealth")}
                            />

                            <InputForm
                                label="PERAA Number"
                                message={errors.peraa?.message}
                                {...register("peraa")}
                            />

                        </div>

                    </div>

                    {/* EMPLOYMENT CLASSIFICATION */}
                    <div className="space-y-4">

                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Employment Classification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                            <SelectForm
                                label="Employment Status"
                                required
                                {...register("employment_status")}
                                options={employmentStatusOptions}
                            />

                            <SelectForm
                                label="Employment Basis"
                                required
                                {...register("employment_basis")}
                                options={employmentBasisOptions}
                            />

                            <InputForm
                                label="Official Working Hours"
                                inputMode="numeric"
                                message={errors.official_working_hours?.message}
                                {...register("official_working_hours")}
                            />

                        </div>

                    </div>

                    {/* OTHER  */}
                    <div className="space-y-4">

                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            Other Employment
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <InputForm
                                label="Other Employment"
                                message={errors.other_employment?.message}
                                {...register("other_employment")}
                            />

                            {otherEmployment && (
                                <InputForm
                                    label="Other Employment Working Hours"
                                    inputMode="numeric"
                                    message={errors.other_employment_working_hours?.message}
                                    {...register("other_employment_working_hours")}
                                />
                            )}

                        </div>

                    </div>

                </div>

                {/* STICKY ACTION BAR */}
                <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between items-center">
                    
                    {/* LEFT BUTTON GROUP */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            size="medium"
                            variant="outline"
                            onClick={onPrevious}
                            disabled={isFirstSection}
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

                    {/* SAVE BUTTON */}
                    <Button
                        type="submit"
                        size="medium"
                        disabled={isSubmitting || !isDirty}
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>

                </div>

            </form>

            {showConfirmModal && (
                <ConfirmModal
                title="Save Changes"
                description="Are you sure you want to update this employee's employment information?"
                action="Save"
                primaryButtonVariant="primary"
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={confirmSave}
                />
            )}
        </FormProvider>
    );
};

export default EmploymentSection;
