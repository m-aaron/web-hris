import { useId } from "react";

const SelectForm = ({
    label,
    message = "",
    options = [],
    required = false,
    className = "",
    disabled = false,
    ...props
}) => {

    const id = useId();

    return (
        <div className="flex flex-col">

        {label && (
            <label
            htmlFor={id}
            className="text-sm text-muted mb-1"
            >
            {label}
            {required && (
                <span className="ml-1 text-red font-bold">*</span>
            )}
            </label>
        )}

        <select
            id={id}
            disabled={disabled}
            className={`
            border p-2 rounded-xl bg-card border-border
            focus:outline-none
            focus:ring-2 focus:ring-primary
            focus:border-primary
            transition duration-200
            ${className}
            `}
            {...props}
        >
            {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
            ))}
        </select>

        <p className="text-end text-xs text-red">{message}</p>

        </div>
    );
};

export default SelectForm;