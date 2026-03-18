const ViewField = ({ label, value }) => {

    return (
        <div className="flex flex-col gap-1">

            <span className="text-xs text-muted uppercase tracking-wide">
                {label}
            </span>

            <span className="text-sm text-heading font-medium whitespace-normal wrap-break-word">
                {value || "—"}
            </span>

        </div>
    )
}

export default ViewField