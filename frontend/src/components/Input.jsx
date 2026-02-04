import { useState } from "react";

const Input = ({ type = "text", ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
        <div className="relative w-full">
        <input
            {...props}
            type={isPassword && showPassword ? "text" : type}
            className="
            w-full
            py-3 px-3 pr-12
            text-lg text-heading
            border border-border
            rounded-xl
            focus:outline-none
            focus:ring-2 focus:ring-primary
            focus:border-primary
            transition duration-200
            "
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
    );
};

export default Input;
