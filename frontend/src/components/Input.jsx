import { useState, useId } from "react";

const Input = ({ label, type = "text", className = "", ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    const id = useId();

    const isPassword = type === "password";

    return (
        <div className="relative w-full">
            <div className="flex flex-col">
                {label && (
                    <label
                    htmlFor={id}
                    className="text-xs text-muted mb-1"
                    >
                    {label}
                    </label>
                )}
            <input
                {...props}
                type={isPassword && showPassword ? "text" : type}
                className={`
                ${className}
                w-full
                pr-12
                text-heading
                border border-border
                rounded-xl
                focus:outline-none
                focus:ring-2 focus:ring-primary
                focus:border-primary
                transition duration-200
                `}
            />

            {/* Show / Hide button */}
            {isPassword && (
                <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    text-sm text-primary
                    hover:opacity-70
                    focus:outline-none
                "
                >
                {showPassword ? "Hide" : "Show"}
                </button>
            )}
            </div>
        </div>
    );
};

export default Input;
