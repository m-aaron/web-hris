import { useId } from "react";
import { useFormContext } from "react-hook-form";

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  className = "",
  disabled = false,
  message = null,
  ...props
}) => {
  const id = useId();
  const { formState } = useFormContext() || {};
  const error = name
    ? formState?.errors?.[name.split(".")[0]]?.[name.split(".")[1]]
    : null;

  const isControlled = value !== undefined;

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
    if (props.onChange) props.onChange(e);
  };

  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="text-xs mb-1 text-muted">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <select
        id={id}
        value={isControlled ? value : undefined}
        disabled={disabled}
        onChange={handleChange}
        className={`border rounded-xl px-3 py-2 bg-card ${
          error ? "border-destructive" : "border-border"
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {(message || error) && (
        <span className="text-xs text-destructive mt-1">
          {message || error?.message}
        </span>
      )}
    </div>
  );
};

export default SelectField;