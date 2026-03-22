import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Card } from "../../components/main/ui/Card";
import Button from "../../components/Button";
import InputForm from "../../components/InputForm";
import UserAvatar from "../../components/main/UserAvatar";
import ConfirmModal from "../../components/main/ui/ConfirmModal";
import { useAuth } from "../../hooks/useAuth";
import { formatEmployeeDisplayName } from "../../helpers/employeeHelper";
import { formatPHDate } from "../../helpers/dateHelper";
import {
    getMyProfile,
    updateMyEmail,
    updateMyPassword,
} from "../../services/accountService";
import {
    changeEmailSchema,
    changePasswordSchema,
} from "../../schemas/profileSettingsSchema";

const EMAIL_DEFAULTS = {
    newEmail: "",
    currentPasswordForEmail: "",
};

const PASSWORD_DEFAULTS = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const ProfileSettings = () => {
    const navigate = useNavigate();

    const { user: authUser, refreshUser, logout } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
    const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
    const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
    const [pendingEmailData, setPendingEmailData] = useState(null);
    const [pendingPasswordData, setPendingPasswordData] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const emailForm = useForm({
        resolver: zodResolver(changeEmailSchema),
        mode: "onChange",
        defaultValues: EMAIL_DEFAULTS,
    });

    const passwordForm = useForm({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: PASSWORD_DEFAULTS,
    });

    const {
        register: registerEmail,
        handleSubmit: handleEmailSubmit,
        reset: resetEmail,
        formState: {
            errors: emailErrors,
            isDirty: isEmailDirty,
            isSubmitting: isEmailSubmitting,
        },
    } = emailForm;

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: {
            errors: passwordErrors,
            isDirty: isPasswordDirty,
            isSubmitting: isPasswordSubmitting,
        },
    } = passwordForm;

    const loadProfile = async () => {
        try {
            setLoadingProfile(true);
            const response = await getMyProfile();
            setProfile(response.user || null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load profile.");
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const displayName = useMemo(() => {
        if (!profile) return "-";
        return formatEmployeeDisplayName(profile, "No linked employee");
    }, [profile]);

    const avatarUser = useMemo(
        () => profile || authUser || {},
        [profile, authUser],
    );

    const lastSecurityUpdateText = useMemo(() => {
        if (!profile?.security_updated_at) return "Not available";
        return formatPHDate(profile.security_updated_at);
    }, [profile]);

    const handleSaveEmail = async (data) => {
        try {
            const response = await updateMyEmail({
                newEmail: data.newEmail,
                currentPassword: data.currentPasswordForEmail,
            });

            setProfile(response.user || null);
            resetEmail(EMAIL_DEFAULTS);
            await refreshUser();
            toast.success(response.message || "Email updated successfully.");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update email.");
            return false;
        }
    };

    const handleSavePassword = async (data) => {
        try {
            const response = await updateMyPassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            setProfile(response.user || null);
            resetPassword(PASSWORD_DEFAULTS);
            await refreshUser();
            toast.success(response.message || "Password updated successfully.");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password.");
            return false;
        }
    };

    const openEmailConfirmModal = (data) => {
        setPendingEmailData(data);
        setShowEmailConfirmModal(true);
    };

    const openPasswordConfirmModal = (data) => {
        setPendingPasswordData(data);
        setShowPasswordConfirmModal(true);
    };

    const confirmSaveEmail = async () => {
        if (!pendingEmailData) return;

        setShowEmailConfirmModal(false);
        await handleSaveEmail(pendingEmailData);
        setPendingEmailData(null);
    };

    const confirmSavePassword = async () => {
        if (!pendingPasswordData) return;

        setShowPasswordConfirmModal(false);
        await handleSavePassword(pendingPasswordData);
        setPendingPasswordData(null);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);
            await logout();
            toast.success("Logged out successfully.");
            navigate("/login", { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to log out.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const openLogoutConfirmModal = () => {
        setShowLogoutConfirmModal(true);
    };

    const confirmLogout = async () => {
        setShowLogoutConfirmModal(false);
        await handleLogout();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-heading">
                        Profile & Settings
                    </h1>
                    <p className="text-sm text-muted">
                        Manage your account details and security settings.
                    </p>
                </div>
                <Button
                    type="button"
                    size="small"
                    variant="danger"
                    className="w-full sm:w-auto"
                    disabled={isLoggingOut}
                    onClick={openLogoutConfirmModal}
                >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                </Button>
            </div>

            <Card className="p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg space-y-4">
                <h2 className="text-base font-semibold text-heading">Account</h2>

                {loadingProfile ? (
                <p className="text-sm text-muted">Loading profile...</p>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-[18rem_1fr] gap-5 items-center">
                    <Card className="flex items-center gap-4 p-3">
                        <UserAvatar user={avatarUser} size="2xl" />
                        <div>
                            <p className="text-sm text-muted">Avatar</p>
                            <p className="text-sm text-heading">Read-only</p>
                        </div>
                    </Card>

                    <div className="space-y-3">
                    <InputForm
                        label="Full Name"
                        value={displayName}
                        disabled
                        readOnly
                    />
                    <InputForm
                        label="Email"
                        value={profile?.email || "-"}
                        disabled
                        readOnly
                    />
                    </div>
                </div>
                )}
            </Card>

            <Card className="p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg space-y-4">
                <h2 className="text-base font-semibold text-heading">Security</h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <form
                        className="flex h-full flex-col gap-4 rounded-xl border border-border p-4"
                        onSubmit={handleEmailSubmit(openEmailConfirmModal)}
                    >
                        <h3 className="text-sm font-semibold text-heading">Change Email</h3>
                        <InputForm
                            label="New Email"
                            type="email"
                            required
                            message={emailErrors?.newEmail?.message || ""}
                            placeholder="name@example.com"
                            {...registerEmail("newEmail")}
                        />

                        <InputForm
                            label="Current Password"
                            type="password"
                            className="pr-16"
                            required
                            message={emailErrors?.currentPasswordForEmail?.message || ""}
                            {...registerEmail("currentPasswordForEmail")}
                        />

                        <div className="rounded-lg border border-border p-3 text-xs text-muted space-y-1">
                            <p>Current account email:</p>
                            <p className="text-sm text-heading break-all">{profile?.email || "-"}</p>
                        </div>

                        <div className="mt-auto flex w-full sm:justify-end">
                            <Button
                                type="submit"
                                size="small"
                                className="w-full sm:w-auto"
                                disabled={!isEmailDirty || isEmailSubmitting}
                            >
                                {isEmailSubmitting ? "Saving..." : "Save Email"}
                            </Button>
                        </div>
                    </form>

                    <form
                        className="flex h-full flex-col gap-4 rounded-xl border border-border p-4"
                        onSubmit={handlePasswordSubmit(openPasswordConfirmModal)}
                    >
                        <h3 className="text-sm font-semibold text-heading">
                            Change Password
                        </h3>
                        <InputForm
                            label="Current Password"
                            type="password"
                            className="pr-16"
                            required
                            message={passwordErrors?.currentPassword?.message || ""}
                            {...registerPassword("currentPassword")}
                        />

                        <InputForm
                            label="New Password"
                            type="password"
                            className="pr-16"
                            required
                            message={passwordErrors?.newPassword?.message || ""}
                            {...registerPassword("newPassword")}
                        />

                        <InputForm
                            label="Confirm Password"
                            type="password"
                            className="pr-16"
                            required
                            message={passwordErrors?.confirmPassword?.message || ""}
                            {...registerPassword("confirmPassword")}
                        />

                        <p className="text-xs text-muted">
                            Last password/security update: {lastSecurityUpdateText}
                        </p>

                        <div className="mt-auto flex w-full sm:justify-end">
                            <Button
                                type="submit"
                                size="small"
                                className="w-full sm:w-auto"
                                disabled={!isPasswordDirty || isPasswordSubmitting}
                            >
                                {isPasswordSubmitting ? "Saving..." : "Save Password"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>

            {showEmailConfirmModal && (
                <ConfirmModal
                    title="Save Changes"
                    description="Are you sure you want to update your account email?"
                    action="Save"
                    primaryButtonVariant="primary"
                    onCancel={() => {
                        setShowEmailConfirmModal(false);
                        setPendingEmailData(null);
                    }}
                    onConfirm={confirmSaveEmail}
                />
            )}

            {showPasswordConfirmModal && (
                <ConfirmModal
                    title="Save Changes"
                    description="Are you sure you want to update your account password?"
                    action="Save"
                    primaryButtonVariant="primary"
                    onCancel={() => {
                        setShowPasswordConfirmModal(false);
                        setPendingPasswordData(null);
                    }}
                    onConfirm={confirmSavePassword}
                />
            )}

            {showLogoutConfirmModal && (
                <ConfirmModal
                    title="Logout"
                    description="Are you sure you want to logout from your account?"
                    action="Logout"
                    primaryButtonVariant="solidDanger"
                    onCancel={() => setShowLogoutConfirmModal(false)}
                    onConfirm={confirmLogout}
                />
            )}
        </div>
    );
};

export default ProfileSettings;
