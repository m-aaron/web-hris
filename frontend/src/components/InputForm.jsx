import { forwardRef, useId, useState } from "react";

const InputForm = forwardRef(({ label, message = "", required = false, type = "text", className = "", rightElement = null, ...props }, ref) => {

    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="relative w-full">
            <div className="flex flex-col">
                {label && (
                    <label
                    htmlFor={id}
                    className="text-sm text-muted mb-1"
                    >
                        {label}
                        { required ? <span className="ml-1 text-red font-bold">*</span> : "" }
                    </label>
                )}

                <div className="relative">
                    <input
                        {...props}
                        id={id}
                        ref={ref}
                        type={inputType}
                        className=
                        {`
                            ${className}
                            ${isPassword ? "hide-native-password-toggle" : ""}
                            w-full
                            pr-12
                            p-2
                            text-heading
                            border border-border
                            rounded-xl
                            focus:outline-none
                            focus:ring-2 focus:ring-primary
                            focus:border-primary
                            transition duration-200
                        `}
                    />
                    {rightElement || (isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary hover:opacity-70 focus:outline-none"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    ))}
                </div>

                <p className="text-end text-xs text-red">{message}</p>
            </div>
        </div>
    );
});

InputForm.displayName = "InputForm";

export default InputForm;