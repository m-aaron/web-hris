import ViewField from "../ui/ViewField"
import { formatPHDate } from "../../../helpers/dateHelper"

const ExaminationView = ({ employee }) => {

  const examinations = employee?.examinations || []

  if (!examinations.length) {
    return (
      <p className="text-sm text-muted">
        No examination records available.
      </p>
    )
  }

  return (

    <div className="space-y-6">

      {examinations.map((exam, index) => (

        <div
          key={exam.id || index}
          className="border border-border rounded-lg p-4 sm:p-5 space-y-4"
        >

          <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">
            {exam.title || `Examination #${index + 1}`}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <ViewField label="Title" value={exam.title} />
            <ViewField label="Date Taken" value={formatPHDate(exam.date_taken)} />
            <ViewField label="Rating" value={exam.rating} />

          </div>

        </div>

      ))}

    </div>

  )
}

export default ExaminationView