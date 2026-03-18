import ViewField from "../ui/ViewField"

const IdentityView = ({ employee }) => {

  const identity = employee?.employee

  if (!identity) {
    return (
      <p className="text-sm text-muted">
        No identity records available.
      </p>
    )
  }

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <ViewField
        label="Employee Number"
        value={identity?.employee_no}
      />

      <ViewField
        label="Employment Type"
        value={identity?.employment_type?.replaceAll("_", "-")}
      />

      <ViewField
        label="Status"
        value={identity?.status}
      />

    </div>

  )
  
}

export default IdentityView