import Spinner from "./Spinner";

const LoadingState = ({
    label = "Loading...",
    fullScreen = false,
    className = "",
    size = 44,
}) => {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? "min-h-screen" : "min-h-[12rem]"} ${className}`}
            role="status"
            aria-live="polite"
        >
            <Spinner size={size} />
            <p className="text-sm text-muted">{label}</p>
        </div>
    );
};

export default LoadingState;
