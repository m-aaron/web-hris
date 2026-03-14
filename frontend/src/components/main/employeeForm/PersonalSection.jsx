import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { savePersonalData } from "../../../services/employeeService"
import { personalSchema } from "../../../schemas/personalSchema"
import { calculateAge } from "../../../helpers/employeeHelper"
import { formatPHDate } from "../../../helpers/dateHelper"

import InputForm from "../../InputForm"
import SelectForm from "../../SelectForm"
import Button from "../../Button"
import ConfirmModal from "../ui/ConfirmModal"


const PersonalSection = ({ employee, setEmployee, onPrevious, onNext, isFirstSection }) => {

  const methods = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: employee?.personal || {}
  })

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty  } } = methods;


  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const birthDate = watch("birth_date");
  const age = calculateAge(birthDate);


  useEffect(() => {
    if (!employee) return

    reset({
      ...employee.personal,
      birth_date: formatPHDate(employee.personal?.birth_date)
    })

  }, [employee, reset]);


  const handleSaveChanges = async (data) => {

    try {
      const payload = {
        lastName: data.last_name,
        firstName: data.first_name,
        middleName: data.middle_name,
        nameExtension: data.name_extension,
        sex: data.sex,
        birthDate: data.birth_date,
        civilStatus: data.civil_status,
        citizenship: data.citizenship,
        religion: data.religion,
        bloodType: data.blood_type,

        houseNo: data.address?.house_no,
        street: data.address?.street,
        barangay: data.address?.barangay,
        city: data.address?.city,
        province: data.address?.province,
        zip: data.address?.zip,

        email: data.email,
        contactNumber: data.contact_number
      };

      const res = await savePersonalData(employee.employee.id, payload)

      setEmployee(prev => ({
        ...prev,
        personal: res.personalInfo
      }));

      toast.success("Personal information updated successfully");

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update personal information");
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

          {/* BASIC IDENTITY */}
          <div className="space-y-4">

            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Basic Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <InputForm
                label="Last Name"
                required
                message={errors.last_name?.message}
                {...register("last_name")}
              />

              <InputForm
                label="First Name"
                required
                message={errors.first_name?.message}
                {...register("first_name")}
              />

              <InputForm
                label="Middle Name"
                {...register("middle_name")}
              />

              <SelectForm
                label="Name Extension"
                {...register("name_extension")}
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


          {/* PERSONAL DETAILS */}
          <div className="space-y-4">

            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <SelectForm
                label="Sex"
                required
                message={errors.sex?.message}
                {...register("sex")}
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" }
                ]}
              />

              <InputForm
                label="Birth Date"
                type="date"
                required
                message={errors.birth_date?.message}
                {...register("birth_date")}
              />

              <InputForm
                label="Age"
                value={age || ""}
                disabled
              />

              <SelectForm
                label="Civil Status"
                required
                message={errors.civil_status?.message}
                {...register("civil_status")}
                options={[
                  { value: "SINGLE", label: "Single" },
                  { value: "MARRIED", label: "Married" },
                  { value: "WIDOWED", label: "Widowed" }
                ]}
              />

              <InputForm
                label="Citizenship"
                required
                message={errors.citizenship?.message}
                {...register("citizenship")}
              />

              <InputForm
                label="Religion"
                required
                message={errors.religion?.message}
                {...register("religion")}
              />

              <SelectForm
                label="Blood Type"
                message={errors.blood_type?.message}
                {...register("blood_type")}
                options={[
                  { value: "", label: "Select Blood Type" },
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" }
                ]}
              />

            </div>

          </div>


          {/* ADDRESS */}
          <div className="space-y-4">

            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <InputForm
                label="House No"
                {...register("address.house_no")}
              />

              <InputForm
                label="Street"
                {...register("address.street")}
              />

              <InputForm
                label="Barangay"
                required
                message={errors.address?.barangay?.message}
                {...register("address.barangay")}
              />

              <InputForm
                label="City"
                required
                message={errors.address?.city?.message}
                {...register("address.city")}
              />

              <InputForm
                label="Province"
                required
                message={errors.address?.province?.message}
                {...register("address.province")}
              />

              <InputForm
                label="ZIP"
                inputMode="numeric"
                maxLength={4}
                message={errors.address?.zip?.message}
                {...register("address.zip")}
              />

            </div>

          </div>


          {/* CONTACT */}
          <div className="space-y-4">

            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <InputForm
                label="Email"
                placeholder="e.g. juan.delacruz@example.com"
                type="email"
                message={errors.email?.message}
                {...register("email")}
              />

              <InputForm
                label="Contact Number"
                placeholder="e.g. 09171234567"
                inputMode="numeric"
                maxLength={11}
                message={errors.contact_number?.message}
                {...register("contact_number")}
              />

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
          description="Are you sure you want to update this employee's personal information?"
          action="Save"
          primaryButtonVariant="primary"
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={confirmSave}
        />

      )}

    </FormProvider>
  )

}


export default PersonalSection;