import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card } from "../../components/main/ui/Card"
import EmployeeHeader from "../../components/main/employeeForm/EmployeeHeader"
import EmployeeTabs from "../../components/main/employeeForm/EmployeeTabs"
import { getEmployeeById } from "../../services/employeeService"

const EmployeeEdit = () => {
    const { id } = useParams();

    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await getEmployeeById(id)
                setEmployee(res.data)
                
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchEmployee()
    }, [id])

    if (loading) return <div>Loading...</div>
    if (!employee) return <div>Employee not found</div>

return (
  <div className="h-screen bg-background flex items-center justify-center p-6 overflow-hidden">
    
    <div className="w-full max-w-7xl">
      
      <Card className="h-[90vh] flex flex-col overflow-hidden shadow-xl">
        
        <EmployeeHeader 
          employee={employee}
          mode="edit"
        />

        <div className="flex-1 overflow-hidden min-h-0">
          <EmployeeTabs
            employee={employee}
            setEmployee={setEmployee}
          />
        </div>

      </Card>

    </div>

  </div>
)
}

export default EmployeeEdit