import ViewField from "../ui/ViewField"
import { formatAddress, formatFullName, calculateAge } from "../../../helpers/employeeHelper"

const FamilyView = ({ employee }) => {

    const family = employee?.family;
    const children = employee?.children || [];

    const spouseName = formatFullName(family?.spouse);
    const kinName = formatFullName(family?.nearest_kin_name);
    const kinAddress = formatAddress(family?.nearest_kin_address);

    if (!family && !children.length) {
        return (
        <p className="text-sm text-muted">
            No family background records available.
        </p>
        )
    }

    return (

        <div className="space-y-10">

            {/* SPOUSE */}
            <div className="space-y-4">

                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                Spouse
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <ViewField label="Name" value={spouseName}/>
                <ViewField label="Occupation" value={family?.spouse_occupation}/>

                </div>

            </div>


            {/*  */}
            <div className="space-y-4">

                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                    Nearest Kin
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <ViewField label="Name" value={kinName}/>
                    <ViewField label="Address" value={kinAddress}/>
                    <ViewField label="Contact Number" value={family?.nearest_kin_contact_number}/>

                </div>

            </div>


            {/* CHILDREN */}
            <div className="space-y-4">

                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                    Children
                </h3>

                {children.length === 0 ? (

                <p className="text-sm text-muted">
                    No children records available.
                </p>

                ) : (

                <div className="space-y-4">

                    {children.map((child, index) => (

                    <div
                        key={child.id || index}
                        className="border border-border rounded-lg p-4"
                    >

                        <h4 className="text-xs text-muted uppercase tracking-wide mb-3">
                            Child #{index + 1}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            <ViewField
                                label="Full Name"
                                value={formatFullName(child?.children_name)}
                            />

                            <ViewField
                                label="Age"
                                value={calculateAge(child?.birth_date)}
                            />

                            <ViewField
                                label="Office / School"
                                value={child?.office_school}
                            />

                            <ViewField
                                label="Occupation"
                                value={child?.occupation}
                            />

                        </div>

                    </div>

                    ))}

                </div>

                )}

            </div>

        </div>

    )
}

export default FamilyView