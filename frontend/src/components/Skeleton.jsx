const Skeleton = ({ className = "" }) => {
    return (
        <div
            className={`skeleton rounded-lg ${className}`}
            aria-hidden="true"
        />
    );
};

export default Skeleton;
