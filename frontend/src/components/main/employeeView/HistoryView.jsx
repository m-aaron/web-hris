import ViewField from "../ui/ViewField"
import { formatDateRange } from "../../../helpers/dateHelper"

const HistoryView = ({ employee }) => {

    const history = employee?.history || []

    if (!history.length) {
        return (
        <p className="text-sm text-muted">
            No history records available.
        </p>
        )
    }

    return (

        <div className="space-y-6">

        {history.map((record, index) => (

            <div
            key={record.id || index}
            className="border border-border rounded-lg p-5 space-y-4"
            >

            <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">
                {record.title || `Record #${index + 1}`}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <ViewField label="Period" value={formatDateRange(record.start_date, record.end_date)} />
                <ViewField label="Position" value={record.position} />
                <ViewField label="Employer" value={record.employer} />
                <ViewField label="Salary" value={record.salary} />
                <ViewField label="Cause of Separation" value={record.reason_for_leaving} />

            </div>

            </div>

        ))}

        </div>

    )
}

export default HistoryView