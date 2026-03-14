import { useState } from "react"
import IdentitySection from "./IdentitySection"
import PersonalSection from "./PersonalSection"
import FamilySection from "./FamilySection"
import ChildrenSection from "./ChildrenSection"
import EmploymentSection from "./EmploymentSection"
import EducationSection from "./EducationSection"
import ExaminationSection from "./ExaminationSection"
import TrainingSection from "./TrainingSection"
import HistorySection from "./HistorySection"
import OtherInfoSection from "./OtherInfoSection"
import ReferenceSection from "./ReferenceSection"


const EmployeeTabs = ({ employee, setEmployee }) => {

  const [activeTab, setActiveTab] = useState("identity");

  const sections = [
    "identity",
    "personal",
    "family",
    "children",
    "employment",
    "education",
    "examination",
    "training",
    "history",
    "other_info",
    "reference"
  ];


  const goPrevious = () => {
    const index = sections.indexOf(activeTab)

    if (index > 0) {
      setActiveTab(sections[index - 1])
    }
  }


  const goNext = () => {
    const index = sections.indexOf(activeTab)

    if (index < sections.length - 1) {
      setActiveTab(sections[index + 1])
    }
  }


  const tabClass = (key) =>
    `text-sm font-medium transition-all duration-200 ${
      activeTab === key
        ? "text-primary"
        : "text-muted hover:text-primary"
    }`


  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Tabs Header */}
      <div className="border-y border-border">

        <div className="overflow-x-auto scrollbar">

          <div className="flex gap-6 px-6 py-4 whitespace-nowrap min-w-max">

            <button
              onClick={() => setActiveTab("identity")}
              className={tabClass("identity")}
            >
              Identity
            </button>

            <button
              onClick={() => setActiveTab("personal")}
              className={tabClass("personal")}
            >
              Personal
            </button>

            <button
              onClick={() => setActiveTab("family")}
              className={tabClass("family")}
            >
              Family
            </button>

            <button
              onClick={() => setActiveTab("children")}
              className={tabClass("children")}
            >
              Children
            </button>

            <button
              onClick={() => setActiveTab("employment")}
              className={tabClass("employment")}
            >
              Employment
            </button>

            <button
              onClick={() => setActiveTab("education")}
              className={tabClass("education")}
            >
              Education
            </button>

            <button
              onClick={() => setActiveTab("examination")}
              className={tabClass("examination")}
            >
              Examination
            </button>

            <button
              onClick={() => setActiveTab("training")}
              className={tabClass("training")}
            >
              Training
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={tabClass("history")}
            >
              History
            </button>

            <button
              onClick={() => setActiveTab("other_info")}
              className={tabClass("other_info")}
            >
              Other Info
            </button>

            <button
              onClick={() => setActiveTab("reference")}
              className={tabClass("reference")}
            >
              Reference
            </button>

          </div>

        </div>

      </div>


      {/* Tab Content */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        
        {activeTab === "identity" && (
          <IdentitySection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
            isFirstSection={activeTab === "identity"}
          />
        )}

        {activeTab === "personal" && (
          <PersonalSection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "family" && (
          <FamilySection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "children" && (
          <ChildrenSection 
            employee={employee} 
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "employment" && (
          <EmploymentSection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "education" && (
          <EducationSection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "examination" && (
          <ExaminationSection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "training" && (
          <TrainingSection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "history" && (
          <HistorySection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "other_info" && (
          <OtherInfoSection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        )}

        {activeTab === "reference" && (
          <ReferenceSection
            employee={employee}
            setEmployee={setEmployee}
            onPrevious={goPrevious}
            onNext={goNext}
            isLastSection={activeTab === "reference"}
          />
        )}

      </div>

    </div>

  )
  
}


export default EmployeeTabs;