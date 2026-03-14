import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { saveOtherInfo } from "../../../services/employeeService"
import { otherInfoSchema } from "../../../schemas/otherInfoSchema"

import SelectForm from "../../SelectForm"
import InputForm from "../../InputForm"
import Button from "../../Button"
import ConfirmModal from "../ui/ConfirmModal"


const OtherInfoSection = ({ employee, setEmployee, onPrevious, onNext }) => {

    const methods = useForm({
        resolver: zodResolver(otherInfoSchema),
        defaultValues: employee?.other_information || {}
    })

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = methods


    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingData, setPendingData] = useState(null)

    const hasCriminalCase = watch("has_criminal_case") === true || watch("has_criminal_case") === "true"
    const hasAdminOffense = watch("has_admin_offense") === true || watch("has_admin_offense") === "true"
    const wasSeparatedEmployment = watch("was_separated_employment") === true || watch("was_separated_employment") === "true"


    useEffect(() => {

        if (!employee) return

        const otherInfo = employee.other_information || {}

        reset({
            has_criminal_case: otherInfo.has_criminal_case ? "true" : "false",
            criminal_case_details: otherInfo.criminal_case_details || "",
            has_admin_offense: otherInfo.has_admin_offense ? "true" : "false",
            admin_offense_details: otherInfo.admin_offense_details || "",
            was_separated_employment: otherInfo.was_separated_employment ? "true" : "false",
            separation_details: otherInfo.separation_details || ""
        })

    }, [employee, reset])


    const handleSaveChanges = async (data) => {

        try {

            const payload = {
                hasCriminalCase: data.has_criminal_case === true || data.has_criminal_case === "true",
                criminalCaseDetails: (data.has_criminal_case === true || data.has_criminal_case === "true") ? data.criminal_case_details : "",

                hasAdminOffense: data.has_admin_offense === true || data.has_admin_offense === "true",
                adminOffenseDetails: (data.has_admin_offense === true || data.has_admin_offense === "true") ? data.admin_offense_details : "",

                wasSeparatedEmployment: data.was_separated_employment === true || data.was_separated_employment === "true",
                separationDetails: (data.was_separated_employment === true || data.was_separated_employment === "true") ? data.separation_details : ""
            }

            const res = await saveOtherInfo(employee.employee.id, payload)

            setEmployee(prev => ({
                ...prev,
                other_information: res.otherInfo
            }))

            toast.success("Other information saved successfully")

        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save other information")
        }

    }

    
    const openConfirmModal = (data) => {
        setPendingData(data)
        setShowConfirmModal(true)
    }


    const confirmSave = () => {
        if (!pendingData) return

        setShowConfirmModal(false)
        handleSaveChanges(pendingData)
        setPendingData(null)
    }

    return (

        <FormProvider {...methods}>

            <form
                onSubmit={handleSubmit(openConfirmModal)}
                className="flex flex-col h-full"
            >

                <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar">

                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                        Other Information
                    </h3>

                    <div className="space-y-8">


                        {/* CRIMINAL CASE */}
                        <div className="space-y-3">

                            <SelectForm
                                label="Have you ever accused/convicted for violation of any law, decree, ordinance, or regulations before any count or tribunal?"
                                {...register("has_criminal_case")}
                                options={[
                                    { value: "false", label: "No" },
                                    { value: "true", label: "Yes" }
                                ]}
                            />

                            {hasCriminalCase && (
                                <InputForm
                                    label="Criminal Case Details"
                                    message={errors.criminal_case_details?.message}
                                    {...register("criminal_case_details")}
                                />
                            )}

                        </div>


                        {/* ADMIN OFFENSE */}
                        <div className="space-y-3">

                            <SelectForm
                                label="Have you ever convicted for any breach or infraction by a military, naval or constabulary tribunal or authority, or found guilty of any administrative offense?"
                                {...register("has_admin_offense")}
                                options={[
                                    { value: "false", label: "No" },
                                    { value: "true", label: "Yes" }
                                ]}
                            />

                            {hasAdminOffense && (
                                <InputForm
                                label="Administrative Offense Details"
                                message={errors.admin_offense_details?.message}
                                {...register("admin_offense_details")}
                                />
                            )}

                        </div>


                        {/* SEPARATION */}
                        <div className="space-y-3">

                            <SelectForm
                                label="Have you ever been separated from any employment for any reason other than for lack of funds?"
                                {...register("was_separated_employment")}
                                options={[
                                    { value: "false", label: "No" },
                                    { value: "true", label: "Yes" }
                                ]}
                            />

                            {wasSeparatedEmployment && (
                                <InputForm
                                    label="Separation Details"
                                    message={errors.separation_details?.message}
                                    {...register("separation_details")}
                                />
                            )}

                        </div>

                    </div>

                </div>

                <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between items-center">

                    <div className="flex gap-2">

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
                    title="Save Other Information"
                    description="Are you sure you want to save this employee's other information?"
                    action="Save"
                    primaryButtonVariant="primary"
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={confirmSave}
                />

            )}

        </FormProvider>

    )

}

export default OtherInfoSection