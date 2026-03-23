import ViewField from "../ui/ViewField"
import { formatDateRange } from "../../../helpers/dateHelper"

const TrainingView = ({ employee }) => {

    const trainings = employee?.trainings || []

    if (!trainings.length) {
        return (
        <p className="text-sm text-muted">
            No training records available.
        </p>
        )
    }

    return (

        <div className="space-y-6">

        {trainings.map((training, index) => (

            <div
            key={training.id || index}
            className="border border-border rounded-lg p-4 sm:p-5 space-y-4"
            >

            <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">
                {training.title || `Training #${index + 1}`}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

                <ViewField label="Title / Seminar / Workshop" value={training.title} />
                <ViewField label="Place / Venue" value={training.place} />
                <ViewField label="Date" value={formatDateRange(training.date_from, training.date_to)} />
                <ViewField label="Hours" value={training.hours} />
                <ViewField label="Conducted / Sponsored by" value={training.conducted_by} />

            </div>

            </div>

        ))}

        </div>

    )
}

export default TrainingView