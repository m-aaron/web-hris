import ViewField from "../ui/ViewField"


const QualificationList = ({ title, items, field }) => {

    if (!items.length) return null

    return (
        <div className="space-y-2">

            <p className="text-xs text-muted uppercase tracking-wide">
                {title}
            </p>

            <ul className="list-disc ml-5 text-sm">

                {items.map((item) => (
                    <li key={item.id}>{item[field]}</li>
                ))}

            </ul>

        </div>
    )

};


const EducationView = ({ employee }) => {

    const educations = employee?.education || []
    const majors = employee?.education_majors || []
    const minors = employee?.education_minors || []
    const honors = employee?.education_honors || []
    const scholarships = employee?.education_scholarships || []

    if (!educations.length) {
        return (
        <p className="text-sm text-muted">
            No education records available.
        </p>
        )
    }

    return (

        <div className="space-y-6">

            {educations.map((edu) => {

                const eduMajors = majors.filter(m => m.education_id === edu.id)
                const eduMinors = minors.filter(m => m.education_id === edu.id)
                const eduHonors = honors.filter(m => m.education_id === edu.id)
                const eduScholarships = scholarships.filter(m => m.education_id === edu.id)

                return (

                    <div
                        key={edu.id}
                        className="border border-border rounded-lg p-4 sm:p-5 space-y-5"
                    >

                        <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">
                            {edu.title || "Education"}
                        </h4>

                        {/* BASIC INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <ViewField
                                label="Title"
                                value={edu.title}
                            />

                            <ViewField
                                label="School"
                                value={edu.school}
                            />

                            <ViewField
                                label="Year Started"
                                value={edu.year_started}
                            />

                            <ViewField
                                label="Year Finished"
                                value={edu.year_finished}
                            />

                        </div>

                        {/* QUALIFICATIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <QualificationList
                                title="Majors"
                                items={eduMajors}
                                field="major_name"
                            />

                            <QualificationList
                                title="Minors"
                                items={eduMinors}
                                field="minor_name"
                            />

                            <QualificationList
                                title="Honors"
                                items={eduHonors}
                                field="honor_name"
                            />

                            <QualificationList
                                title="Scholarships"
                                items={eduScholarships}
                                field="scholarship_name"
                            />

                        </div>

                    </div>

                )

            })}

        </div>

    )
}

export default EducationView