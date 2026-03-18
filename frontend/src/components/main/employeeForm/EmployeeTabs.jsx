import { useState, useRef } from "react"
import { toast } from "sonner"
import { employeeTabs } from "../../../configs/employeeTabConfig"

const EmployeeTabs = ({ employee, setEmployee, mode = "edit" }) => {

  const [activeTab, setActiveTab] = useState("identity")
  const tabRefs = useRef({})

  const currentIndex = employeeTabs.findIndex(tab => tab.key === activeTab)

  
  const goPrevious = () => {
    if (currentIndex > 0) {
      const prev = employeeTabs[currentIndex - 1].key
      setActiveTab(prev)
      scrollToTab(prev)
    }
  }


  const goNext = (force = false) => {
    if (mode === "create" && !employee?.employee?.id && !force) {
      toast.warning("Please create the employee identity first.");
      return;
    }

    if (currentIndex < employeeTabs.length - 1) {
      const next = employeeTabs[currentIndex + 1].key
      setActiveTab(next)
      scrollToTab(next)
    }
  }


  const scrollToTab = (key) => {
    const tab = tabRefs.current[key]

    if (tab) {
      tab.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      })
    }
  }


  const tabClass = (key) =>
    `text-sm font-medium transition-all duration-200 ${
      activeTab === key
        ? "text-primary"
        : "text-muted hover:text-primary"
    }`


  const ActiveComponent = employeeTabs.find(tab => tab.key === activeTab)?.component


  const isTabLocked = (tabKey) => {
    if (mode !== "create") return false;

    const hasEmployee = employee?.employee?.id;

    if (!hasEmployee && tabKey !== "identity") {
      return true;
    }

    return false;
  };
  return (

    <div className="flex flex-col h-full min-h-0">

      {/* Tabs */}
      <div className="border-y border-border">

        <div className="overflow-x-auto scrollbar">

          <div className="flex gap-6 px-6 py-4 whitespace-nowrap min-w-max">

            {employeeTabs.map(tab => (

              <button
                key={tab.key}
                ref={(el) => (tabRefs.current[tab.key] = el)}
                disabled={isTabLocked(tab.key)}
                onClick={() => {
                  if (isTabLocked(tab.key)) return

                  setActiveTab(tab.key)
                  scrollToTab(tab.key)
                }}
                className={`${tabClass(tab.key)} ${
                  isTabLocked(tab.key)
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
              >
                {tab.label}
              </button>

            ))}

          </div>

        </div>

      </div>

      {/* Section */}
      <div className="flex-1 min-h-0 flex flex-col">

        {ActiveComponent && (

          <ActiveComponent
            employee={employee}
            setEmployee={setEmployee}
            mode={mode}
            onPrevious={goPrevious}
            onNext={goNext}
            isFirstSection={currentIndex === 0}
            isLastSection={currentIndex === employeeTabs.length - 1}
          />

        )}

      </div>

    </div>

  )

}

export default EmployeeTabs