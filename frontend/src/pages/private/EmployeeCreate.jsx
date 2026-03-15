import { useState } from "react"
import { useParams } from "react-router-dom"
import { Card } from "../../components/main/ui/Card"
import EmployeeHeader from "../../components/main/employeeForm/EmployeeHeader"
import EmployeeTabs from "../../components/main/employeeForm/EmployeeTabs"

import { createEmployeeTemplate } from "../../helpers/employeeHelper"

const EmployeeCreate = () => {

    const [employee, setEmployee] = useState(createEmployeeTemplate());

return (
    <div className="bg-background sm:min-h-screen sm:flex sm:items-center sm:justify-center sm:p-6">
        
        <div className="w-full sm:max-w-7xl">
        
            <Card className="w-full flex flex-col shadow-xl h-screen sm:h-[90vh] rounded-none sm:rounded-xl">
                
                <div className="shrink-0">
                    <EmployeeHeader 
                    employee={employee}
                    mode="create"
                    />
                </div>

                <div className="flex-1 min-h-0">
                    <EmployeeTabs
                        employee={employee}
                        setEmployee={setEmployee}
                        mode="create"
                    />
                </div>

            </Card>

        </div>

    </div>
)
}

export default EmployeeCreate