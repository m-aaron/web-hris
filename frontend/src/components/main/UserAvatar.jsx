import { useState } from "react";

const UserAvatar = ({ user, size = "md" }) => {
    const [imgError, setImgError] = useState(false);

    // Size options
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-lg",
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

    // If no photo OR image fails → fallback
    if (!user?.photo_url || imgError) {
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
        src={user.photo_url}
        alt="Profile"
        onError={() => setImgError(true)}
        className={`${avatarSize} rounded-full object-cover border border-border`}
        />
    );
};

export default UserAvatar;
