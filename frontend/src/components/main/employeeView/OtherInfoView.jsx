import ViewField from "../ui/ViewField"

const YesNoField = ({ label, value, details }) => {

    const displayValue = value ? "Yes" : "No"

    return (

        <div className="space-y-3">

        <p className="text-xs sm:text-sm text-heading font-medium leading-relaxed wrap-break-word">
            {label}
        </p>

        <ViewField label="Answer" value={displayValue} />

        {value && (
            <ViewField label="Details" value={details} />
        )}

        </div>

    )
}

const OtherInfoView = ({ employee }) => {

    const o = employee?.other_information

    if (!o) {
        return (
        <p className="text-sm text-muted">
            No other information available.
        </p>
        )
    }

    return (

        <div className="space-y-8">

            {/* QUESTION 1 */}
            <YesNoField
                label="Have you ever been accused/convicted for violation of any law, decree, ordinance, or regulations before any court or tribunal?"
                value={o.has_criminal_case}
                details={o.criminal_case_details}
            />

            {/* QUESTION 2 */}
            <YesNoField
                label="Have you ever been convicted for any breach or infraction by a military, naval or constabulary tribunal or authority, or found guilty of any administrative offense?"
                value={o.has_admin_offense}
                details={o.admin_offense_details}
            />

            {/* QUESTION 3 */}
            <YesNoField
                label="Have you ever been separated from any employment for any reason other than for lack of funds?"
                value={o.was_been_separated}
                details={o.separation_details}
            />

        </div>

    )
}

export default OtherInfoView