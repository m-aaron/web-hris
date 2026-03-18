import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";

import Button from "../../Button";
import SelectForm from "../../SelectForm";
import InputForm from "../../InputForm";
import ConfirmModal from "../ui/ConfirmModal";

import {
  createEmployeeIdentity,
  updateEmployeeType,
  updateEmployeePhoto,
} from "../../../services/employeeService";

const EmployeeIdentitySection = ({
  employee,
  setEmployee,
  onPrevious,
  onNext,
  isFirstSection,
  mode,
}) => {
  const fileInputRef = useRef(null);

  const [employeeNo, setEmployeeNo] = useState("");
  const [originalEmployeeNo, setOriginalEmployeeNo] = useState(
    employee?.employee?.employee_no || "",
  );
  const [employmentType, setEmploymentType] = useState("TEACHING");
  const [originalEmploymentType, setOriginalEmploymentType] = useState("");

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lastSuccessfulPhotoUrl, setLastSuccessfulPhotoUrl] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // This effect handles the cleanup of the blob URL created by URL.createObjectURL.
    // It's important to revoke the object URL to avoid memory leaks when the
    // component unmounts or the preview is changed.
    const objectUrl = preview;
    return () => {
      if (objectUrl && objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (!employee) return;

    const { employee_no, employment_type, photo_url } = employee.employee;

    const nextEmploymentType =
      employment_type || (mode === "create" ? "TEACHING" : "");
    setEmploymentType(nextEmploymentType);
    setOriginalEmploymentType(nextEmploymentType);

    if (mode === "create") {
      if (employee_no) {
        setEmployeeNo(employee_no);
        setOriginalEmployeeNo(employee_no);
      }
    } else {
      setEmployeeNo(employee_no || "");
      setOriginalEmployeeNo(employee_no || "");
    }

    // When the employee prop is updated with the new URL from the parent,
    // we can clear our temporary state holder. This ensures that photoSrc
    // will then rely on the updated employee.employee.photo_url.
    if (lastSuccessfulPhotoUrl && photo_url === lastSuccessfulPhotoUrl) {
      setLastSuccessfulPhotoUrl(null);
    }
  }, [employee, lastSuccessfulPhotoUrl, mode]);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedPhoto(file);
    setPreview(URL.createObjectURL(file));

    // allow selecting same file again
    e.target.value = null;
  };

  const handleCancelPhoto = () => {
    setSelectedPhoto(null);
    setPreview(null);
  };

  const normalizedEmployeeNo = employeeNo.trim();
  const hasEmployeeId = !!employee?.employee?.id;
  const hasEmployeeNoChanged = normalizedEmployeeNo !== originalEmployeeNo;
  const hasEmploymentTypeChanged = employmentType !== originalEmploymentType;
  const hasPhotoChanged = !!selectedPhoto;
  const canSaveInCreate = !!normalizedEmployeeNo && !!employmentType;
  const hasIdentityChanged =
    mode === "create" && !hasEmployeeId
      ? hasEmployeeNoChanged || hasEmploymentTypeChanged
      : hasEmploymentTypeChanged;

  const hasChanges =
    mode === "create"
      ? canSaveInCreate && (hasIdentityChanged || hasPhotoChanged)
      : hasEmploymentTypeChanged || hasPhotoChanged;

  const openConfirmModal = () => {
    if (!hasChanges) return;

    setShowConfirmModal(true);
  };

  const handleSaveChanges = async () => {
    if (!employee || !hasChanges) return false;

    try {
      setUploading(true);
      let id = employee?.employee?.id;

      if (mode === "create" && !id) {
        const res = await createEmployeeIdentity({
          employeeNumber: normalizedEmployeeNo,
          employmentType,
        });

        const createdEmployee = res?.employee;

        if (!createdEmployee?.id) {
          throw new Error("Failed to create employee identity");
        }

        id = createdEmployee.id;
        setEmployee((prev) => ({
          ...prev,
          employee: createdEmployee,
        }));
        setEmployeeNo(createdEmployee.employee_no || normalizedEmployeeNo);
        setOriginalEmployeeNo(
          createdEmployee.employee_no || normalizedEmployeeNo,
        );
        setOriginalEmploymentType(
          createdEmployee.employment_type || employmentType,
        );
      }

      // Sequentially update employment type and then the photo
      if (id && hasEmploymentTypeChanged) {
        console.log("Updating employment type to:", employmentType);
        const res = await updateEmployeeType(id, { employmentType });
        setEmployee((prev) => ({
          ...prev,
          employee: {
            ...prev.employee,
            employment_type: res.employee.employment_type,
          },
        }));
        setOriginalEmploymentType(employmentType);
      }

      if (selectedPhoto) {
        const formData = new FormData();
        formData.append("photo", selectedPhoto);

        const res = await updateEmployeePhoto(id, formData);
        setLastSuccessfulPhotoUrl(res.photoUrl);
        console.log("Photo updated successfully, new URL:", res.photoUrl);
        setEmployee((prev) => ({
          ...prev,
          employee: {
            ...prev.employee,
            photo_url: res.photoUrl,
          },
        }));
        setSelectedPhoto(null);
        setPreview(null);
      }

      toast.success(
        mode === "create" && !hasEmployeeId
          ? "Employee identity created"
          : "Employee identity updated",
      );
      return true;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update employee identity",
      );
      return false;
    } finally {
      setUploading(false);
      setShowConfirmModal(false);
    }
  };

  const initials =
    employee?.personal?.first_name || employee?.personal?.last_name
      ? `${employee?.personal?.first_name?.[0] || ""}${employee?.personal?.last_name?.[0] || ""}`
      : "NE";

  const photoUrl = employee?.employee?.photo_url;

  const photoSrc =
    preview ||
    (lastSuccessfulPhotoUrl
      ? `${import.meta.env.VITE_BASE_URL}${lastSuccessfulPhotoUrl}`
      : null) ||
    (photoUrl ? `${import.meta.env.VITE_BASE_URL}${photoUrl}` : null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar">
        {/* EMPLOYEE IDENTITY */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
            Employee Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <InputForm
              label="Employee Number"
              value={employeeNo || ""}
              onChange={(e) => setEmployeeNo(e.target.value)}
              disabled={mode !== "create" || hasEmployeeId}
            />

            <SelectForm
              label="Employment Type"
              required
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              options={[
                { value: "TEACHING", label: "Teaching" },
                { value: "NON_TEACHING", label: "Non Teaching" },
              ]}
            />
          </div>
        </div>

        {/* PROFILE PHOTO */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
            Profile Photo
          </h3>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div
              className="relative group cursor-pointer"
              onClick={handleAvatarClick}
            >
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Employee"
                  className="w-30 h-30 object-cover rounded-xl shadow transition-transform duration-200 group-hover:scale-[1.05]"
                />
              ) : (
                <div
                  className="w-30 h-30 rounded-xl bg-green flex items-center justify-center text-xl font-semibold text-card
                    transition-transform duration-200 group-hover:scale-[1.05]"
                >
                  {initials}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-muted/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                <Camera size={24} className="text-card" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </div>

            {/* Cancel preview */}
            {selectedPhoto && (
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={handleCancelPhoto}
                className="flex items-center gap-1 text-xs text-muted hover:text-red-500 transition"
              >
                <X size={18} />
                Cancel new photo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="sticky bottom-0 bg-card border-t border-border px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex w-full sm:w-auto flex-wrap gap-2">
          <Button
            type="button"
            size="medium"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={onPrevious}
            disabled={isFirstSection}
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

        <Button
          type="button"
          size="medium"
          className="w-full sm:w-auto"
          onClick={openConfirmModal}
          disabled={uploading || !hasChanges}
        >
          {uploading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <ConfirmModal
          title="Save Changes"
          description="Are you sure you want to update this employee's identity?"
          action="Save"
          primaryButtonVariant="primary"
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={async () => {
            const success = await handleSaveChanges();
            if (success) {
              onNext?.(true);
            }
          }}
        />
      )}
    </div>
  );
};

export default EmployeeIdentitySection;
