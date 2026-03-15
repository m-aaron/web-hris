import { useState } from "react"
import { useParams } from "react-router-dom"
import { Card } from "../../components/main/ui/Card"
import EmployeeHeader from "../../components/main/employeeForm/EmployeeHeader"
import EmployeeTabs from "../../components/main/employeeForm/EmployeeTabs"

import { createEmployeeTemplate } from "../../helpers/employeeHelper"

const EmployeeCreate = () => {

    const [employee, setEmployee] = useState(createEmployeeTemplate());

return (
    <div className="h-screen bg-background flex items-center justify-center p-6 overflow-hidden">
        
        <div className="w-full max-w-7xl">
        
        <Card className="h-[90vh] flex flex-col overflow-hidden shadow-xl">
            
            <EmployeeHeader 
            employee={employee}
            mode="create"
            />

            <div className="flex-1 overflow-hidden min-h-0">
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