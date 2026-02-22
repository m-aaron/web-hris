const Badge = ({
    children,
    variant = "warning",
    icon: Icon
}) => {

    const variants = {
        warning: "bg-light-yellow text-yellow border border-yellow",
        danger: "bg-light-red text-red border border-red",
        success: "bg-light-green text-green border border-green"
    };

    return (
        <div className="relative group w-fit">
            <span
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium transition-all duration-200 hover:scale-105 ${variants[variant]}`}
            >
                {Icon && <Icon size={14} />}
                {children}
            </span>
        </div>
    );
};

export default Badge;