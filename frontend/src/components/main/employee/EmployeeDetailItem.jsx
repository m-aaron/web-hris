const EmployeeDetailItem = ({ label, value }) => {
    return (
        <div>
            <p className="text-xs text-muted">{label}</p>
            <p className="font-medium">{value || "-"}</p>
        </div>
    );
};

export default EmployeeDetailItem;