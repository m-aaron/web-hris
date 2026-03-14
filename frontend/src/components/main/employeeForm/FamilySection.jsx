import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { saveFamilyData } from "../../../services/employeeService"
import { familySchema } from "../../../schemas/familySchema"

import InputForm from "../../InputForm"
import SelectForm from "../../SelectForm"
import Button from "../../Button"
import ConfirmModal from "../ui/ConfirmModal"


const FamilySection = ({ employee, setEmployee, onPrevious, onNext }) => {

    const methods = useForm({
        resolver: zodResolver(familySchema),
        defaultValues: employee?.family || {}
    })

    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = methods


    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);


    useEffect(() => {
        if (!employee) return

        reset(employee.family)
    }, [employee, reset])


    const handleSaveChanges = async (data) => {

        try {
            const payload = {
                spouseLName: data.spouse?.last_name,
                spouseFName: data.spouse?.first_name,
                spouseMName: data.spouse?.middle_name,
                spouseNExtension: data.spouse?.name_extension,
                spouseOccupation: data.spouse_occupation,

                kinLName: data.nearest_kin_name?.last_name,
                kinFName: data.nearest_kin_name?.first_name,
                kinMName: data.nearest_kin_name?.middle_name,
                kinNExtension: data.nearest_kin_name?.name_extension,

                kinHouseNo: data.nearest_kin_address?.house_no,
                kinStreet: data.nearest_kin_address?.street,
                kinBarangay: data.nearest_kin_address?.barangay,
                kinCity: data.nearest_kin_address?.city,
                kinProvince: data.nearest_kin_address?.province,
                kinZip: data.nearest_kin_address?.zip,

                kinContactNumber: data.nearest_kin_contact_number
            }

            const res = await saveFamilyData(employee.employee.id, payload);

            setEmployee(prev => ({
                ...prev,
                family: res.familyBackground
            }))

            toast.success("Family background updated successfully");
            
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update family background");
        }

    }


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


                {/* SPOUSE INFORMATION */}
                <div className="space-y-4">

                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                        Spouse Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <InputForm
                        label="Last Name"
                        message={errors.spouse?.last_name?.message}
                        {...register("spouse.last_name")}
                    />

                    <InputForm
                        label="First Name"
                        message={errors.spouse?.first_name?.message}
                        {...register("spouse.first_name")}
                    />

                    <InputForm
                        label="Middle Name"
                        {...register("spouse.middle_name")}
                    />

                    <SelectForm
                        label="Name Extension"
                        {...register("spouse.name_extension")}
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
                        label="Occupation"
                        {...register("spouse_occupation")}
                    />

                    </div>

                </div>


                {/* NEAREST KIN INFORMATION */}
                <div className="space-y-4">

                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                    Nearest Kin Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <InputForm
                            label="Last Name"
                            message={errors.nearest_kin_name?.last_name?.message}
                            {...register("nearest_kin_name.last_name")}
                        />

                        <InputForm
                            label="First Name"
                            message={errors.nearest_kin_name?.first_name?.message}
                            {...register("nearest_kin_name.first_name")}
                        />

                        <InputForm
                            label="Middle Name"
                            {...register("nearest_kin_name.middle_name")}
                        />

                        <SelectForm
                            label="Name Extension"
                            {...register("nearest_kin_name.name_extension")}
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

                    </div>

                </div>


                {/* NEAREST KIN ADDRESS */}
                <div className="space-y-4">

                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                        Nearest Kin Address
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <InputForm
                            label="House No"
                            {...register("nearest_kin_address.house_no")}
                        />

                        <InputForm
                            label="Street"
                            {...register("nearest_kin_address.street")}
                        />

                        <InputForm
                            label="Barangay"
                            message={errors.nearest_kin_address?.barangay?.message}
                            {...register("nearest_kin_address.barangay")}
                        />

                        <InputForm
                            label="City"
                            message={errors.nearest_kin_address?.city?.message}
                            {...register("nearest_kin_address.city")}
                        />

                        <InputForm
                            label="Province"
                            message={errors.nearest_kin_address?.province?.message}
                            {...register("nearest_kin_address.province")}
                        />

                        <InputForm
                            label="ZIP"
                            message={errors.nearest_kin_address?.zip?.message}
                            inputMode="numeric"
                            maxLength={4}
                            {...register("nearest_kin_address.zip")}
                        />

                    </div>

                </div>


                {/* CONTACT */}
                <div className="space-y-4">

                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                        Nearest Kin Contact
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <InputForm
                            label="Contact Number"
                            placeholder="e.g. 09171234567"
                            inputMode="numeric"
                            maxLength={11}
                            {...register("nearest_kin_contact_number")}
                            message={errors.nearest_kin_contact_number?.message}
                        />

                    </div>

                </div>

            </div>


            {/* ACTION BAR */}
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
                title="Save Changes"
                description="Are you sure you want to update this employee's family information?"
                action="Save"
                primaryButtonVariant="primary"
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={confirmSave}
            />

        )}

        </FormProvider>
    )

}


export default FamilySection;