import { useId } from "react";

const SelectField = ({
    label,
    value = "",
    onChange,
    options = [],
    className = "",
    disabled = false
}) => {
    const id = useId();

    return (
        
        <div className="flex flex-col">

            {label && (
                <label
                htmlFor={id}
                className="text-xs text-muted mb-1"
                >
                {label}
                </label>
            )}

            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`
                px-3 py-2 
                bg-card 
                text-sm 
                text-heading 
                border border-border
                rounded-xl
                focus:outline-none
                focus:ring-2 focus:ring-primary
                focus:border-primary
                transition duration-200
                ${disabled ? "opacity-60 cursor-not-allowed" : ""}
                ${className}
                `}
            >

                {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
                ))}
            </select>
            
        </div>

    );
};

export default SelectField;
