export const BirthdayModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
        
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[rgba(241,247,254,0.1)] backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-background rounded-2xl shadow-xl border border-border p-6 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-heading">
                        Birthdays Today
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-heading text-sm"
                    >
                        Close
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {!data || data.length === 0 ? (
                        <p className="text-sm text-muted text-center py-8">
                            No birthdays today.
                        </p>
                    ) : (
                        data.map((employee, index) => (
                            <div
                                key={index}
                                className="p-3 rounded-xl border border-border bg-card hover:bg-grey transition flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-medium text-heading">
                                        {employee.full_name}
                                    </p>
                                    <p className="text-sm text-muted">
                                        {employee.employment_type}
                                    </p>
                                </div>

                                <span className="text-sm text-muted">
                                    {employee.birth_date}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
