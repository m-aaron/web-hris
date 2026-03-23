import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Button from "../../components/Button";
import InputForm from "../../components/InputForm";
import SelectForm from "../../components/SelectForm";
import ConfirmModal from "../../components/main/ui/ConfirmModal";
import { Card } from "../../components/main/ui/Card";
import UsersTable from "../../components/main/user/UsersTable";

import { ROLES } from "../../constants/employeeConstant";
import { formatEmployeeDisplayName } from "../../helpers/employeeHelper";
import { useAuth } from "../../hooks/useAuth";
import {
    activateUser,
    createUser,
    deleteUser,
    deactivateUser,
    getLinkableEmployees,
    getUsers,
    linkUserToEmployee,
    unlinkUserFromEmployee,
    updateUser,
} from "../../services/userService";
import { createUserSchema, editUserSchema } from "../../schemas/userSchema";


const DEFAULT_FORM = {
    email: "",
    password: "",
    role: ROLES.HR,
    employeeId: "",
};

const DEFAULT_EDIT_FORM = {
    email: "",
    role: ROLES.HR,
    employeeId: "",
};


const UserManagement = () => {

    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [linkableEmployees, setLinkableEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    const [showCreateConfirm, setShowCreateConfirm] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [pendingCreateData, setPendingCreateData] = useState(null);
    const [pendingEditData, setPendingEditData] = useState(null);

    const createMethods = useForm({
        resolver: zodResolver(createUserSchema),
        mode: "onChange",
        defaultValues: DEFAULT_FORM,
    });

    const {
        register: createRegister,
        handleSubmit: handleCreateSubmit,
        reset: resetCreate,
        formState: {
            errors: createErrors,
            isValid: isCreateValid,
            isSubmitting: isCreateSubmitting,
        },
    } = createMethods;

    const editMethods = useForm({
        resolver: zodResolver(editUserSchema),
        mode: "onChange",
        defaultValues: DEFAULT_EDIT_FORM,
    });

    const {
        register: editRegister,
        handleSubmit: handleEditSubmit,
        reset: resetEdit,
        formState: {
            errors: editErrors,
            isSubmitting: isEditSubmitting,
        },
    } = editMethods;


    const employeeOptions = useMemo(() => {
        return linkableEmployees.map((employee) => {
            const fullName = formatEmployeeDisplayName(employee, "No Name");

            return {
                value: String(employee.id),
                label: `${employee.employee_no} - ${fullName}`,
            };
        });
    }, [linkableEmployees]);


    const editEmployeeOptions = useMemo(() => {
        if (!editingUser) {
            return [{ value: "", label: "Not linked" }, ...employeeOptions];
        }

        const currentEmployeeId = editingUser.employee_id ? String(editingUser.employee_id) : "";
        const hasCurrentLinked = !!currentEmployeeId;

        const currentOption = hasCurrentLinked
            ? [{
                value: currentEmployeeId,
                label: `${editingUser.employee_no} - ${formatEmployeeDisplayName(editingUser, "No Name")}`,
            }]
            : [];

        return [
            { value: "", label: "Not linked" },
            ...currentOption,
            ...employeeOptions.filter((option) => option.value !== currentEmployeeId),
        ];
    }, [editingUser, employeeOptions]);


    const linkedEmployeeName = useMemo(() => {
        if (!editingUser?.employee_no) return "Not linked";

        return formatEmployeeDisplayName(editingUser, editingUser.employee_no);
    }, [editingUser]);

    const isEditingSelf = useMemo(() => {
        if (!editingUser?.id || !currentUser?.id) return false;
        return String(editingUser.id) === String(currentUser.id);
    }, [editingUser, currentUser]);


    const loadData = async ({ keepLoading = true } = {}) => {
        try {
            if (keepLoading) setLoading(true);

            const [usersRes, employeesRes] = await Promise.all([getUsers(), getLinkableEmployees()]);
            setUsers(usersRes.users || []);
            setLinkableEmployees(employeesRes.employees || []);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to load user management data.");
        } finally {
            if (keepLoading) setLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, []);


    const closeEditModal = () => {
        setEditingUser(null);
        resetEdit(DEFAULT_EDIT_FORM);
        setPendingEditData(null);
    };


    const openEditModal = (user) => {
        setEditingUser(user);
        resetEdit({
            email: user.email || "",
            role: user.role || ROLES.HR,
            employeeId: user.employee_id ? String(user.employee_id) : "",
        });
    };


    const openCreateConfirm = (data) => {
        setPendingCreateData(data);
        setShowCreateConfirm(true);
    };


    const openEditConfirm = (data) => {
        setPendingEditData(data);
        setShowEditConfirm(true);
    };


    const confirmCreate = async () => {
        if (!pendingCreateData) return;

        try {
            setActionLoading(true);

            const payload = {
                email: pendingCreateData.email,
                password: pendingCreateData.password,
                role: pendingCreateData.role,
            };

            if (pendingCreateData.employeeId) {
                payload.employeeId = pendingCreateData.employeeId;
            }

            await createUser(payload);
            toast.success("User created successfully.");

            resetCreate(DEFAULT_FORM);
            await loadData({ keepLoading: false });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create user.");
        } finally {
            setShowCreateConfirm(false);
            setPendingCreateData(null);
            setActionLoading(false);
        }
    };


    const confirmEditSave = async () => {
        if (!editingUser || !pendingEditData) return;

        try {
            setActionLoading(true);

            await updateUser(editingUser.id, {
                email: pendingEditData.email,
                role: pendingEditData.role,
            });

            const currentEmployeeId = editingUser.employee_id ? String(editingUser.employee_id) : "";
            const targetEmployeeId = pendingEditData.employeeId || "";

            if (currentEmployeeId !== targetEmployeeId) {
                if (currentEmployeeId) {
                    await unlinkUserFromEmployee(editingUser.id);
                }

                if (targetEmployeeId) {
                    await linkUserToEmployee(editingUser.id, targetEmployeeId);
                }
            }

            toast.success("User updated successfully.");

            closeEditModal();
            
            await loadData({ keepLoading: false });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update user.");
        } finally {
            setShowEditConfirm(false);
            setPendingEditData(null);
            setActionLoading(false);
        }
    };


    const confirmUnlink = async () => {
        if (!editingUser) return;

        try {
            setActionLoading(true);

            await unlinkUserFromEmployee(editingUser.id);
            toast.success("User unlinked from employee successfully.");

            const updatedUser = {
                ...editingUser,
                employee_id: null,
                employee_no: null,
                first_name: null,
                middle_name: null,
                last_name: null,
                name_extension: null,
            };

            setEditingUser(updatedUser);
            resetEdit({
                email: updatedUser.email || "",
                role: updatedUser.role || ROLES.HR,
                employeeId: "",
            });

            await loadData({ keepLoading: false });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to unlink employee.");
        } finally {
            setShowUnlinkConfirm(false);
            setActionLoading(false);
        }
    };


    const confirmStatusToggle = async () => {
        if (!editingUser) return;

        try {
            setActionLoading(true);

            const isActive = editingUser.status === "active";

            const response = isActive
                ? await deactivateUser(editingUser.id)
                : await activateUser(editingUser.id);

            toast.success(response.message || (isActive ? "User deactivated successfully." : "User activated successfully."));

            const updatedUser = {
                ...editingUser,
                status: isActive ? "inactive" : "active",
            };

            setEditingUser(updatedUser);
            await loadData({ keepLoading: false });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update account status.");
        } finally {
            setShowStatusConfirm(false);
            setActionLoading(false);
        }
    };


    const confirmDeleteUser = async () => {
        if (!editingUser) return;

        try {
            setActionLoading(true);
            
            await deleteUser(editingUser.id);
            toast.success("User deleted successfully.");

            closeEditModal();
            await loadData({ keepLoading: false });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete user.");
        } finally {
            setShowDeleteConfirm(false);
            setActionLoading(false);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-heading">User Management</h1>
                    <p className="text-sm text-muted">Manage user accounts and account status for admin access.</p>
                </div>
            </div>

            <Card className="p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg">
                <h2 className="text-base font-semibold text-heading mb-3">Create User</h2>
                <form className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start" onSubmit={handleCreateSubmit(openCreateConfirm)}>
                    <InputForm
                        label="Email"
                        type="email"
                        required
                        message={createErrors.email?.message}
                        placeholder="name@example.com"
                        {...createRegister("email")}
                    />

                    <InputForm
                        label="Password"
                        type="password"
                        required
                        message={createErrors.password?.message}
                        placeholder="At least 8 characters"
                        {...createRegister("password")}
                    />

                    <SelectForm
                        label="Role"
                        required
                        message={createErrors.role?.message}
                        options={[
                            { value: ROLES.ADMIN, label: "ADMIN" },
                            { value: ROLES.HR, label: "HR" },
                            { value: ROLES.EMPLOYEE, label: "EMPLOYEE" },
                        ]}
                        {...createRegister("role")}
                    />

                    <SelectForm
                        label="Link Employee (optional)"
                        options={[{ value: "", label: "Not linked" }, ...employeeOptions]}
                        {...createRegister("employeeId")}
                    />

                    <div className="lg:col-span-4 flex justify-end">
                        <Button
                            type="submit"
                            size="small"
                            className="w-full sm:w-auto"
                            loading={isCreateSubmitting || actionLoading}
                            loadingText="Creating..."
                            disabled={!isCreateValid || isCreateSubmitting || actionLoading}
                        >
                            Create User
                        </Button>
                    </div>
                </form>
            </Card>

            <Card className="rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg">
                <div className="p-4 flex-1 flex flex-col bg-card rounded-2xl overflow-hidden">
                    <UsersTable
                        users={users}
                        onEdit={openEditModal}
                        loading={loading}
                    />
                </div>
            </Card>

            {editingUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-grey/40 backdrop-blur-sm z-60 px-4">
                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-border">
                                <h3 className="text-lg font-semibold text-heading">Edit User</h3>
                            </div>

                            <form className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto scrollbar" onSubmit={handleEditSubmit(openEditConfirm)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputForm
                                        label="Email"
                                        required
                                        message={editErrors.email?.message}
                                        {...editRegister("email")}
                                    />

                                    <SelectForm
                                        label="Role"
                                        required
                                        message={editErrors.role?.message}
                                        options={[
                                            { value: ROLES.ADMIN, label: "ADMIN" },
                                            { value: ROLES.HR, label: "HR" },
                                            { value: ROLES.EMPLOYEE, label: "EMPLOYEE" },
                                        ]}
                                        disabled={isEditingSelf || actionLoading}
                                        {...editRegister("role")}
                                    />
                                </div>

                                {isEditingSelf && (
                                    <p className="text-xs text-muted">
                                        You cannot change your own role or account access from this screen.
                                    </p>
                                )}

                                <div className="border border-border rounded-xl p-4 space-y-4">
                                    <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
                                        Employee Linking
                                    </h4>

                                    <div className="space-y-1">
                                        <p className="text-xs text-muted">Current</p>
                                        <p className="text-sm text-heading font-medium">{linkedEmployeeName}</p>
                                    </div>

                                    <SelectForm
                                        label="Change Employee"
                                        options={editEmployeeOptions}
                                        {...editRegister("employeeId")}
                                    />

                                    {editingUser.employee_no && (
                                        <div>
                                            <Button
                                                type="button"
                                                size="small"
                                                variant="danger"
                                                disabled={actionLoading}
                                                onClick={() => setShowUnlinkConfirm(true)}
                                            >
                                                Unlink Employee
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="border border-border rounded-xl p-4 space-y-4">
                                    <h4 className="text-sm uppercase tracking-wide font-semibold text-muted">
                                        Account Access
                                    </h4>

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted">Current status</p>
                                            <span
                                                className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium border ${
                                                    editingUser.status === "active"
                                                        ? "bg-light-green text-green border-green"
                                                        : "bg-light-red text-red border-red"
                                                }`}
                                            >
                                                {editingUser.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            size="small"
                                            variant={editingUser.status === "active" ? "danger" : "primary"}
                                            disabled={actionLoading || isEditingSelf}
                                            onClick={() => setShowStatusConfirm(true)}
                                        >
                                            {editingUser.status === "active" ? "Deactivate User" : "Activate User"}
                                        </Button>
                                    </div>

                                    <div className="pt-4 border-t border-border flex items-center justify-end">
                                        <Button
                                            type="button"
                                            size="small"
                                            variant="danger"
                                            disabled={actionLoading || isEditingSelf}
                                            onClick={() => setShowDeleteConfirm(true)}
                                        >
                                            Delete User
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border flex gap-2">
                                    <Button
                                        type="button"
                                        size="small"
                                        variant="secondary"
                                        className="flex-1 sm:flex-none"
                                        onClick={closeEditModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="small"
                                        className="flex-1 sm:flex-none"
                                        loading={isEditSubmitting || actionLoading}
                                        loadingText="Saving..."
                                        disabled={isEditSubmitting || actionLoading}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </form>
                    </div>
                </div>
            )}

            {showCreateConfirm && (
                <ConfirmModal
                    title="Create User"
                    description="Are you sure you want to create this user account?"
                    action="Create"
                    primaryButtonVariant="primary"
                    onCancel={() => {
                        setShowCreateConfirm(false);
                        setPendingCreateData(null);
                    }}
                    onConfirm={confirmCreate}
                />
            )}

            {showEditConfirm && (
                <ConfirmModal
                    title="Save User"
                    description="Save changes to this user account?"
                    action="Save"
                    primaryButtonVariant="primary"
                    onCancel={() => {
                        setShowEditConfirm(false);
                        setPendingEditData(null);
                    }}
                    onConfirm={confirmEditSave}
                />
            )}

            {showUnlinkConfirm && (
                <ConfirmModal
                    title="Unlink Employee"
                    description="Are you sure you want to unlink this employee from the user account?"
                    action="Unlink"
                    primaryButtonVariant="solidDanger"
                    onCancel={() => setShowUnlinkConfirm(false)}
                    onConfirm={confirmUnlink}
                />
            )}

            {showStatusConfirm && editingUser && (
                <ConfirmModal
                    title={editingUser.status === "active" ? "Deactivate User" : "Activate User"}
                    description={
                        editingUser.status === "active"
                            ? "Are you sure you want to deactivate this user account?"
                            : "Are you sure you want to activate this user account?"
                    }
                    action={editingUser.status === "active" ? "Deactivate" : "Activate"}
                    primaryButtonVariant={editingUser.status === "active" ? "solidDanger" : "primary"}
                    onCancel={() => setShowStatusConfirm(false)}
                    onConfirm={confirmStatusToggle}
                />
            )}

            {showDeleteConfirm && editingUser && (
                <ConfirmModal
                    title="Delete User"
                    description="Are you sure you want to permanently delete this user account? This cannot be undone."
                    action="Delete"
                    primaryButtonVariant="solidDanger"
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDeleteUser}
                />
            )}
        </div>
    );
};

export default UserManagement;
