const Button = ({
    children,
    variant = "primary",
    size = "large",
    className = "",
    ...props
}) => {

    const baseStyles =
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:saturate-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variants = {
        primary:
            "bg-primary text-card hover:opacity-90",

        secondary:
            "bg-transparent text-primary border border-primary hover:bg-primary/10 active:bg-primary/20",

        danger:
            "bg-transparent text-red border border-red hover:bg-red/10 active:bg-red/20",

        solidDanger:
            "bg-red text-card hover:opacity-90",

        ghost:
            "bg-transparent text-muted hover:bg-muted/40 active:bg-muted/60",

        outline:
            "bg-transparent border border-border text-muted hover:bg-muted/40"
    };

    const sizes = {
        small: "py-2 px-4 text-sm",
        medium: "py-2.5 px-5 text-base",
        large: "py-3 px-6 text-lg",
    };

    return (
        <button
        {...props}
        className={`
            ${baseStyles}
            ${variants[variant]}
            ${sizes[size]}
            ${className}
        `}
        >
        {children}
        </button>
    );
};

export default Button;