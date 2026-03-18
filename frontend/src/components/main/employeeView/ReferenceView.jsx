import ViewField from "../ui/ViewField"
import { formatFullName, formatAddress } from "../../../helpers/employeeHelper"

const ReferenceView = ({ employee }) => {

    const references = employee?.references || []

    if (!references.length) {
        return (
        <p className="text-sm text-muted">
            No reference records available.
        </p>
        )
    }

    return (

        <div className="space-y-6">

        {references.map((record, index) => (

            <div
                key={record.id || index}
                className="border border-border rounded-lg p-5 space-y-4"
            >

            <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">
                {record.title || `Reference #${index + 1}`}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ViewField label="Name" value={formatFullName(record.name)} />
                <ViewField label="Address" value={formatAddress(record.address)} />
                <ViewField label="Contact Number" value={record.contact_number} />

            </div>

            </div>

        ))}

        </div>

    )
}

export default ReferenceView