export const Card = ({ className = "", children, ...props }) => {
    return (
        <div className={`rounded-xl bg-card shadow-sm ${className}`} {...props}>
            {children}
        </div>
    );
}