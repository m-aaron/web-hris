import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageHeader from "../../components/main/ui/PageHeader";
import { Card } from "../../components/main/ui/Card";
import Button from "../../components/Button";
import ConfirmModal from "../../components/main/ui/ConfirmModal";
import MasterDataTable from "../../components/main/settings/MasterDataTable";
import SystemSettingsModal from "../../components/main/settings/SystemSettingsModal";
import {
    getPositions,
    createPosition,
    updatePosition,
    togglePositionActive,
    deletePosition,
    getDesignations,
    createDesignation,
    updateDesignation,
    toggleDesignationActive,
    deleteDesignation,
    getAllLeaveTypes,
    createLeaveType,
    updateLeaveType,
    toggleLeaveTypeActive,
    deleteLeaveType,
    getDepartments,
    createDepartment,
    updateDepartment,
    toggleDepartmentActive,
    deleteDepartment,
} from "../../services/systemSettingsService";

const TAB_CONFIGS = [
    {
        key: "positions",
        label: "Positions",
        singularLabel: "Position",
        showDescriptions: true,
        emptyTitle: "No positions found",
        emptyDescription: "Add a position to get started.",
        responseKey: "positions",
        fetcher: getPositions,
        creator: createPosition,
        updater: updatePosition,
        toggler: togglePositionActive,
        remover: deletePosition,
    },
    {
        key: "designations",
        label: "Designations",
        singularLabel: "Designation",
        showDescriptions: true,
        emptyTitle: "No designations found",
        emptyDescription: "Add a designation to get started.",
        responseKey: "designations",
        fetcher: getDesignations,
        creator: createDesignation,
        updater: updateDesignation,
        toggler: toggleDesignationActive,
        remover: deleteDesignation,
    },
    {
        key: "leave-types",
        label: "Leave Types",
        singularLabel: "Leave Type",
        showDescriptions: false,
        emptyTitle: "No leave types found",
        emptyDescription: "Add a leave type to get started.",
        responseKey: "leaveTypes",
        fetcher: getAllLeaveTypes,
        creator: createLeaveType,
        updater: updateLeaveType,
        toggler: toggleLeaveTypeActive,
        remover: deleteLeaveType,
    },
    {
        key: "departments",
        label: "Departments",
        singularLabel: "Department",
        showDescriptions: true,
        emptyTitle: "No departments found",
        emptyDescription: "Add a department to get started.",
        responseKey: "departments",
        fetcher: getDepartments,
        creator: createDepartment,
        updater: updateDepartment,
        toggler: toggleDepartmentActive,
        remover: deleteDepartment,
    }
];

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState("positions");

    const [positions, setPositions] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingMap, setLoadingMap] = useState({
        positions: true,
        designations: true,
        "leave-types": true,
        departments: true,
    });

    const [modalState, setModalState] = useState({
        open: false,
        mode: "add",
        tabKey: "positions",
        record: null,
    });

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [toggleTarget, setToggleTarget] = useState(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    const activeConfig = useMemo(
        () => TAB_CONFIGS.find((tab) => tab.key === activeTab),
        [activeTab]
    );

    const activeRows = useMemo(() => {
        if (activeTab === "positions") return positions;
        if (activeTab === "designations") return designations;
        if (activeTab === "departments") return departments;
        return leaveTypes;
    }, [activeTab, positions, designations, leaveTypes, departments]);

    const activeLoading = loadingMap[activeTab] ?? false;

    const refreshTab = async (tabKey, { keepLoading = true } = {}) => {
        const config = TAB_CONFIGS.find((tab) => tab.key === tabKey);
        if (!config) return;

        try {
            if (keepLoading) {
                setLoadingMap((prev) => ({ ...prev, [tabKey]: true }));
            }

            const response = await config.fetcher();
            const data = response?.[config.responseKey] || [];

            if (tabKey === "positions") setPositions(data);
            if (tabKey === "designations") setDesignations(data);
            if (tabKey === "leave-types") setLeaveTypes(data);
            if (tabKey === "departments") setDepartments(data);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || `Failed to load ${config.label.toLowerCase()}.`);
        } finally {
            if (keepLoading) {
                setLoadingMap((prev) => ({ ...prev, [tabKey]: false }));
            }
        }
    };

    useEffect(() => {
        refreshTab("positions");
        refreshTab("designations");
        refreshTab("leave-types");
        refreshTab("departments");
    }, []);

    const openAddModal = () => {
        setModalState({
            open: true,
            mode: "add",
            tabKey: activeTab,
            record: null,
        });
    };

    const openEditModal = (record) => {
        setModalState({
            open: true,
            mode: "edit",
            tabKey: activeTab,
            record,
        });
    };

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, open: false, record: null }));
    };

    const handleSave = async (data) => {
        const config = TAB_CONFIGS.find((tab) => tab.key === modalState.tabKey);
        if (!config) return false;

        const payload = {
            name: String(data.name || "").trim(),
        };

        if (config.showDescriptions) {
            payload.descriptions = String(data.descriptions || "").trim();
        }

        try {
            if (modalState.mode === "edit" && modalState.record?.id) {
                await config.updater(modalState.record.id, payload);
                toast.success(`${config.singularLabel} updated successfully.`);
            } else {
                await config.creator(payload);
                toast.success(`${config.singularLabel} created successfully.`);
            }

            await refreshTab(modalState.tabKey, { keepLoading: false });
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || `Failed to save ${config.singularLabel.toLowerCase()}.`);
            return false;
        }
    };

    const handleToggleActive = async () => {
        if (!toggleTarget) return;

        const config = TAB_CONFIGS.find((tab) => tab.key === toggleTarget.tabKey);
        if (!config) return;

        const isCurrentlyActive = toggleTarget.record?.is_active !== false;
        const action = isCurrentlyActive ? "deactivated" : "activated";

        try {
            setToggleLoading(true);
            await config.toggler(toggleTarget.record.id);
            toast.success(`${config.singularLabel} ${action} successfully.`);
            await refreshTab(toggleTarget.tabKey, { keepLoading: false });
            setToggleTarget(null);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || `Failed to ${isCurrentlyActive ? "deactivate" : "activate"} ${config.singularLabel.toLowerCase()}.`);
        } finally {
            setToggleLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const config = TAB_CONFIGS.find((tab) => tab.key === deleteTarget.tabKey);
        if (!config) return;

        try {
            setDeleteLoading(true);
            await config.remover(deleteTarget.record.id);
            toast.success(`${config.singularLabel} deleted successfully.`);
            await refreshTab(deleteTarget.tabKey, { keepLoading: false });
            setDeleteTarget(null);
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || `Failed to delete ${config.singularLabel.toLowerCase()}.`;
            toast.error(message);

            if (error.response?.status !== 400) {
                setDeleteTarget(null);
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    // Derived toggle modal labels
    const toggleIsActivating = toggleTarget?.record?.is_active === false;

    return (
        <div className="space-y-6">
            <PageHeader
                title="System Settings"
                description="Manage organization positions, designations, leave types, and departments."
                actions={(
                    <Button
                        size="small"
                        className="w-full md:w-auto"
                        onClick={openAddModal}
                    >
                        + Add
                    </Button>
                )}
                className="pt-2"
            />

            <div className="border-b border-border px-4 py-3 flex flex-wrap items-center gap-3">
                {TAB_CONFIGS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`text-sm font-medium pb-1 transition-all duration-200 ${
                            activeTab === tab.key
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted hover:text-primary"
                        }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeConfig && (
                <Card className="rounded-2xl shadow-sm">
                    <div className="p-4">
                        <MasterDataTable
                            rows={activeRows}
                            loading={activeLoading}
                            showDescriptions={activeConfig.showDescriptions}
                            onEdit={openEditModal}
                            onToggleActive={(record) =>
                                setToggleTarget({ tabKey: activeTab, record })
                            }
                            onDelete={(record) =>
                                setDeleteTarget({ tabKey: activeTab, record })
                            }
                            emptyTitle={activeConfig.emptyTitle}
                            emptyDescription={activeConfig.emptyDescription}
                        />
                    </div>
                </Card>
            )}

            {activeConfig && (
                <SystemSettingsModal
                    isOpen={modalState.open}
                    mode={modalState.mode}
                    label={activeConfig.singularLabel}
                    showDescriptions={activeConfig.showDescriptions}
                    initialValues={modalState.record}
                    onClose={closeModal}
                    onSubmit={handleSave}
                />
            )}

            {/* Deactivate / Activate Confirm Modal */}
            {toggleTarget && (
                <ConfirmModal
                    title={`${toggleIsActivating ? "Activate" : "Deactivate"} "${toggleTarget.record?.name || ""}"?`}
                    description={
                        toggleIsActivating
                            ? `Activating this ${activeConfig?.singularLabel?.toLowerCase()} will make it available for selection again.`
                            : `Deactivating this ${activeConfig?.singularLabel?.toLowerCase()} will hide it from selection options. Existing records will not be affected.`
                    }
                    action={toggleLoading
                        ? (toggleIsActivating ? "Activating..." : "Deactivating...")
                        : (toggleIsActivating ? "Activate" : "Deactivate")
                    }
                    primaryButtonVariant={toggleIsActivating ? "primary" : "solidDanger"}
                    onCancel={() => setToggleTarget(null)}
                    onConfirm={handleToggleActive}
                />
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <ConfirmModal
                    title={`Delete "${deleteTarget.record?.name || ""}"?`}
                    description={`Are you sure you want to permanently delete ${deleteTarget.record?.name || "this item"}? This cannot be undone.`}
                    action={deleteLoading ? "Deleting..." : "Delete"}
                    primaryButtonVariant="solidDanger"
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
};

export default SystemSettings;
