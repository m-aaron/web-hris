import { useEffect, useMemo, useState } from "react";

const UserAvatar = ({ user, size = "md" }) => {
    const [imgError, setImgError] = useState(false);

    // Size options
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-lg",
        xl: "h-20 w-20 text-2xl",
        "2xl": "h-28 w-28 text-3xl"
    };

    const avatarSize = sizes[size] || sizes.md;

    // Normalize role safely
    const role = user?.role?.toUpperCase?.() || "";

    // Role initials
    const roleInitials = {
        ADMIN: "AD",
        HR: "HR",
        EMPLOYEE: "EM",
    };

    // Role background colors (adjust based on your Tailwind config)
    const roleColor = {
        ADMIN: "bg-red",
        HR: "bg-blue",
        EMPLOYEE: "bg-green",
    };

    const displayText = roleInitials[role] || "U";

    const resolvedPhotoUrl = useMemo(() => {
        const raw = String(user?.photo_url || "").trim();

        if (!raw) return "";
        if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
            return raw;
        }

        const apiBaseUrl = String(import.meta.env.VITE_API_URL || "").trim();
        let base = "";

        try {
            base = new URL(apiBaseUrl).origin;
        } catch {
            base = apiBaseUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
        }

        return base ? `${base}${raw.startsWith("/") ? raw : `/${raw}`}` : raw;
    }, [user?.photo_url]);

    useEffect(() => {
        setImgError(false);
    }, [resolvedPhotoUrl]);

    // If no photo OR image fails → fallback
    if (!resolvedPhotoUrl || imgError) {
        return (
        <div
            className={`
            ${avatarSize}
            ${roleColor[role]}
            flex items-center justify-center
            rounded-full
            text-card font-semibold
            uppercase
            select-none
            `}
        >
            {displayText}
        </div>
        );
    }

    return (
        <img
        src={resolvedPhotoUrl}
        alt="Profile"
        onError={() => setImgError(true)}
        className={`${avatarSize} rounded-full object-cover border border-border`}
        />
    );
};

export default UserAvatar;
