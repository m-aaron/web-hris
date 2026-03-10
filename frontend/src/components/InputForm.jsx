import { useId } from "react";

const InputForm = ({ label, message = "", required = false, type = "text", className = "", ...props }) => {

    const id = useId();

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

                <input
                    {...props}
                    id={id}
                    type={type}
                    className=
                    {`
                        ${className}
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

                <p className="text-end text-xs text-red">{message}</p>
            </div>
        </div>
    );
};

export default InputForm;