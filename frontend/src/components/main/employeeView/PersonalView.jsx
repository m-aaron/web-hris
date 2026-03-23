import ViewField from "../ui/ViewField"
import { calculateAge, formatAddress } from "../../../helpers/employeeHelper"
import { formatPHDate } from "../../../helpers/dateHelper"


const PersonalView = ({ employee }) => {

    const p = employee?.personal

    if (!p) {
      return (
        <p className="text-sm text-muted">
          No personal records available.
        </p>
      )
    }

    const age = calculateAge(p?.birth_date)
    const address = formatAddress(p?.address)

  return (

    <div className="space-y-8">

      {/* BASIC IDENTITY */}
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Basic Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <ViewField label="Last Name" value={p?.last_name}/>
          <ViewField label="First Name" value={p?.first_name}/>
          <ViewField label="Middle Name" value={p?.middle_name}/>
          <ViewField label="Name Extension" value={p?.name_extension}/>

        </div>

      </div>


      {/* PERSONAL DETAILS */}
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <ViewField label="Sex" value={p?.sex}/>
          <ViewField label="Birth Date" value={formatPHDate(p?.birth_date)}/>
          <ViewField label="Age" value={age}/>

          <ViewField label="Civil Status" value={p?.civil_status}/>
          <ViewField label="Citizenship" value={p?.citizenship}/>
          <ViewField label="Religion" value={p?.religion}/>
          <ViewField label="Blood Type" value={p?.blood_type}/>

        </div>

      </div>


      {/* ADDRESS */}
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Address
        </h3>

        <div className="grid grid-cols-1 gap-6">

          <ViewField label="Address" value={address}/>

        </div>

      </div>


      {/* CONTACT INFORMATION */}
      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <ViewField label="Email" value={p?.email}/>
          <ViewField label="Contact Number" value={p?.contact_number}/>

        </div>

      </div>

    </div>

  )
}

export default PersonalView