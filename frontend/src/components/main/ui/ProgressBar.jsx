const ProfileProgressBar = ({ progress }) => {

    const safeProgress = Number.isFinite(progress)
        ? Math.min(100, Math.max(0, Math.round(progress)))
        : 0;

    return (

        <div className="w-full flex items-center gap-3 px-6 pb-2">

            {/* Label */}
            <span className="text-xs text-heading whitespace-nowrap">
                Profile
            </span>

            {/* Progress Track */}
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">

                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${safeProgress}%`,
                        background: "linear-gradient(90deg, var(--blue), var(--green))"
                    }}
                />

            </div>

            {/* Percentage */}
            <span className="text-xs font-medium text-heading">
                {safeProgress}%
        </span>

        </div>

    );

};

export default ProfileProgressBar;