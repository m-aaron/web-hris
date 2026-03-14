import IdentitySection from "../components/main/employeeForm/IdentitySection"
import PersonalSection from "../components/main/employeeForm/PersonalSection"
import FamilySection from "../components/main/employeeForm/FamilySection"
import ChildrenSection from "../components/main/employeeForm/ChildrenSection"
import EmploymentSection from "../components/main/employeeForm/EmploymentSection"
import EducationSection from "../components/main/employeeForm/EducationSection"
import ExaminationSection from "../components/main/employeeForm/ExaminationSection"
import TrainingSection from "../components/main/employeeForm/TrainingSection"
import HistorySection from "../components/main/employeeForm/HistorySection"
import OtherInfoSection from "../components/main/employeeForm/OtherInfoSection"
import ReferenceSection from "../components/main/employeeForm/ReferenceSection"

export const employeeTabs = [
    { key: "identity", label: "Identity", component: IdentitySection },
    { key: "personal", label: "Personal", component: PersonalSection },
    { key: "family", label: "Family", component: FamilySection },
    { key: "children", label: "Children", component: ChildrenSection },
    { key: "employment", label: "Employment", component: EmploymentSection },
    { key: "education", label: "Education", component: EducationSection },
    { key: "examination", label: "Examination", component: ExaminationSection },
    { key: "training", label: "Training", component: TrainingSection },
    { key: "history", label: "History", component: HistorySection },
    { key: "other_info", label: "Other Info", component: OtherInfoSection },
    { key: "reference", label: "Reference", component: ReferenceSection }
]