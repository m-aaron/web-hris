import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import PageHeader from "../../components/main/ui/PageHeader";
import { Card } from "../../components/main/ui/Card";
import Button from "../../components/Button";
import SelectField from "../../components/main/ui/SelectField";
import PaginationFooter from "../../components/main/employee/PaginationFooter";

import LeaveOverviewCards from "../../components/main/leave/LeaveOverviewCards";
import LeaveTable from "../../components/main/leave/LeaveTable";
import LeaveFormModal from "../../components/main/leave/LeaveFormModal";
import LeaveDetailModal from "../../components/main/leave/LeaveDetailModal";
import LeaveStatusModal from "../../components/main/leave/LeaveStatusModal";
import ConfirmModal from "../../components/main/ui/ConfirmModal";

import { getEmployees } from "../../services/employeeService";
import {
  getLeaveTypes,
  getLeaveApplications,
  createLeaveApplication,
  getLeaveApplication,
  getLeaveOverview,
  updateLeaveStatus,
  updateLeaveApplication,
  deleteLeaveApplication,
  getLeaveSummary,
} from "../../services/leaveService";
import { formatEmployeeDisplayName } from "../../helpers/employeeHelper";

const DEFAULT_APPLICATIONS_QUERY = {
  status: "",
  leave_type_id: "",
  employee_id: "",
  date_from: "",
  date_to: "",
  page: 1,
  limit: 10,
};

// balances removed

const LeaveManagement = () => {
    const [searchParams] = useSearchParams();
    const employeeParam = searchParams.get("employee");

    const [activeTab, setActiveTab] = useState("applications");

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [applications, setApplications] = useState([]);
    const [applicationsPagination, setApplicationsPagination] = useState({});
    const [applicationsLoading, setApplicationsLoading] = useState(true);

    const [overviewStats, setOverviewStats] = useState({});
    const [overviewLoading, setOverviewLoading] = useState(true);

    const [applicationsQuery, setApplicationsQuery] = useState(
        DEFAULT_APPLICATIONS_QUERY,
    );

    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [editingApplication, setEditingApplication] = useState(null);
    const [detailAction, setDetailAction] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (!employeeParam) return;

        setApplicationsQuery((prev) => ({
        ...prev,
        employee_id: employeeParam,
        page: 1,
        }));
    }, [employeeParam]);

    useEffect(() => {
        const fetchLeaveTypes = async () => {
        try {
            const res = await getLeaveTypes();
            setLeaveTypes(res.leaveTypes || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load leave types.");
        }
        };

        fetchLeaveTypes();
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
        try {
            const res = await getEmployees({
            page: 1,
            limit: 1000,
            record_status: "SUBMITTED",
            });

            const data = res.data?.data || [];
            const normalized = data.map((employee) => ({
            ...employee,
            display_name: formatEmployeeDisplayName(employee, "N/A"),
            }));

            setEmployees(normalized);
        } catch (error) {
            console.error(error);
        }
        };

        fetchEmployees();
    }, []);

    const refreshOverview = useCallback(async () => {
        try {
        setOverviewLoading(true);
        const res = await getLeaveOverview();
        const stats = res.stats || {};
        setOverviewStats({
            totalThisMonth: stats.totalThisMonth || 0,
            pending: stats.pending || 0,
            approvedThisMonth: stats.approvedThisMonth || 0,
            onLeaveToday: stats.onLeaveToday || 0,
        });
        } catch (error) {
        console.error(error);
        toast.error("Failed to load overview stats.");
        } finally {
        setOverviewLoading(false);
        }
    }, []);

    const refreshApplications = useCallback(
        async (overrideQuery) => {
        try {
            setApplicationsLoading(true);
            const params = overrideQuery || applicationsQuery;
            const res = await getLeaveApplications(params);
            setApplications(res.applications || []);
            setApplicationsPagination(res.pagination || {});
        } catch (error) {
            console.error(error);
            toast.error("Failed to load leave applications.");
        } finally {
            setApplicationsLoading(false);
        }
        },
        [applicationsQuery],
    );

    // balances removed

    useEffect(() => {
        refreshApplications();
    }, [applicationsQuery, refreshApplications]);

    useEffect(() => {}, []);

    useEffect(() => {
        refreshOverview();
    }, [refreshOverview]);

    const handleApplicationsFilterChange = (field, value) => {
        setApplicationsQuery((prev) => ({
        ...prev,
        [field]: value,
        page: 1,
        }));
    };


    const handleCreateLeave = async (data) => {
        try {
        const optionalDateFiled = data.date_filed
            ? { date_filed: data.date_filed }
            : {};
        let payload;
        if (Array.isArray(data.leave_types) && data.leave_types.length > 0) {
            payload = {
            employee_id: data.employee_id,
            ...optionalDateFiled,
            department_unit: data.department_unit || null,
            substitute_name: data.substitute_name || null,
            subjects_covered: data.subjects_covered || null,
            reason: data.reason || null,
            leave_types: data.leave_types.map((lt) => ({
                leave_type_id: Number(lt.leave_type_id),
                date_from: lt.date_from,
                date_to: lt.date_to,
                number_of_days: Number(lt.number_of_days),
                other_leave_details: lt.other_leave_details || null,
            })),
            };
        } else {
            payload = {
            employee_id: data.employee_id,
            ...optionalDateFiled,
            department_unit: data.department_unit || null,
            substitute_name: data.substitute_name || null,
            subjects_covered: data.subjects_covered || null,
            reason: data.reason || null,
            leave_types: [
                {
                leave_type_id: Number(data.leave_type_id || 0),
                date_from: data.date_from,
                date_to: data.date_to,
                number_of_days: Number(data.number_of_days || 0),
                other_leave_details: data.other_leave_details || null,
                },
            ],
            };
        }

        await createLeaveApplication(payload);
        toast.success("Leave application filed.");
        setShowFormModal(false);
        refreshApplications();
        refreshOverview();
        return true;
        } catch (error) {
        console.error(error);
        toast.error(
            error.response?.data?.message || "Failed to create leave application.",
        );
        return false;
        }
    };

    const handleUpdateLeave = async (appId, data) => {
        try {
        const optionalDateFiled = data.date_filed
            ? { date_filed: data.date_filed }
            : {};
        // Don't include employee_id in update - it cannot be changed
        const payload = {
            ...optionalDateFiled,
            department_unit: data.department_unit || null,
            substitute_name: data.substitute_name || null,
            subjects_covered: data.subjects_covered || null,
            reason: data.reason || null,
            leave_types: data.leave_types.map((lt) => ({
            leave_type_id: Number(lt.leave_type_id),
            date_from: lt.date_from,
            date_to: lt.date_to,
            number_of_days: Number(lt.number_of_days),
            other_leave_details: lt.other_leave_details || null,
            })),
        };

        await updateLeaveApplication(appId, payload);
        toast.success("Leave application updated.");
        setShowFormModal(false);
        setEditingApplication(null);
        refreshApplications();
        refreshOverview();
        return true;
        } catch (error) {
        console.error(error);
        toast.error(
            error.response?.data?.message || "Failed to update leave application.",
        );
        return false;
        }
    };

    const handledDeleteLeave = async () => {
                try {
                setShowDeleteConfirm(false);
                setApplicationsLoading(true);
                await deleteLeaveApplication(deleteTarget.id);
                toast.success("Leave application deleted.");
                setDeleteTarget(null);
                refreshApplications();
                refreshOverview();
                } catch (error) {
                console.error(error);
                toast.error(
                    error.response?.data?.message ||
                    "Failed to delete application.",
                );
                } finally {
                setApplicationsLoading(false);
                }
            }

    // status updates are handled via LeaveStatusModal

    // balances removed

    // balances removed

    return (
        <div className="space-y-6">
        <PageHeader
            title="Leave Management"
            description="Review and manage leave applications."
            actions={
            <Button
                size="small"
                className="w-full md:w-auto"
                onClick={() => {
                setEditingApplication(null);
                setShowFormModal(true);
                }}
            >
                + File Leave
            </Button>
            }
            className="pt-2"
        />

        <LeaveOverviewCards stats={overviewStats} loading={overviewLoading} />

        <div className="border-b border-border px-4 py-3 flex flex-wrap items-center gap-3">
            <button
            className={`text-sm font-medium pb-1 transition-all duration-200 ${
                activeTab === "applications"
                ? "text-primary border-b-2 border-primary"
                : "text-muted hover:text-primary"
            }`}
            onClick={() => setActiveTab("applications")}
            >
            Applications
            </button>
        </div>

        {activeTab === "applications" && (
            <div className="space-y-4">
            <Card className="rounded-2xl shadow-sm p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <SelectField
                    label="Status"
                    value={applicationsQuery.status}
                    onChange={(value) =>
                    handleApplicationsFilterChange("status", value)
                    }
                    options={[
                    { value: "", label: "All" },
                    { value: "PENDING", label: "Pending" },
                    { value: "APPROVED", label: "Approved" },
                    { value: "DISAPPROVED", label: "Disapproved" },
                    ]}
                    className="text-sm"
                />

                <SelectField
                    label="Leave Type"
                    value={applicationsQuery.leave_type_id}
                    onChange={(value) =>
                    handleApplicationsFilterChange("leave_type_id", value)
                    }
                    options={[
                    { value: "", label: "All" },
                    ...leaveTypes.map((type) => ({
                        value: String(type.id),
                        label: type.name,
                    })),
                    ]}
                    className="text-sm"
                />

                <div className="flex flex-col">
                    <label className="text-xs mb-1 text-muted">Date From</label>
                    <input
                    type="date"
                    value={applicationsQuery.date_from}
                    onChange={(event) =>
                        handleApplicationsFilterChange(
                        "date_from",
                        event.target.value,
                        )
                    }
                    className="border rounded-xl px-3 py-2 bg-card border-border text-sm"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-xs mb-1 text-muted">Date To</label>
                    <input
                    type="date"
                    value={applicationsQuery.date_to}
                    onChange={(event) =>
                        handleApplicationsFilterChange(
                        "date_to",
                        event.target.value,
                        )
                    }
                    className="border rounded-xl px-3 py-2 bg-card border-border text-sm"
                    />
                </div>

                <div className="flex items-end md:col-span-2">
                    <Button
                    variant="secondary"
                    size="small"
                    className="w-full"
                    onClick={() =>
                        setApplicationsQuery({
                        ...DEFAULT_APPLICATIONS_QUERY,
                        employee_id: applicationsQuery.employee_id,
                        })
                    }
                    >
                    Reset Filters
                    </Button>
                </div>
                </div>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <div className="p-4">
                <LeaveTable
                    applications={applications}
                    loading={applicationsLoading}
                    onView={async (row) => {
                    try {
                        setApplicationsLoading(true);
                        const res = await getLeaveApplication(row.id);
                        // Keep application root fields but include leaveTypes in the same object
                        const appObj = res.application || res;
                        const leaveTypes = res.leaveTypes || res.leave_types || [];
                        setSelectedApplication({ ...appObj, leaveTypes });
                        setDetailAction(null);
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to load application details.");
                    } finally {
                        setApplicationsLoading(false);
                    }
                    }}
                    onEdit={async (row) => {
                    try {
                        console.log("Editing application ID:", row.id);
                        setApplicationsLoading(true);
                        const res = await getLeaveApplication(row.id);
                        const appObj = res.application || res;
                        const leaveTypes = res.leaveTypes || res.leave_types || [];
                        setEditingApplication({ ...appObj, leaveTypes });
                        setShowFormModal(true);
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to load application for editing.");
                    } finally {
                        setApplicationsLoading(false);
                    }
                    }}
                    onStatus={(row) => {
                    setSelectedApplication(row);
                    setDetailAction("status");
                    }}
                    onDelete={(row) => {
                    setDeleteTarget(row);
                    setShowDeleteConfirm(true);
                    }}
                />

                {!applicationsLoading && (applications?.length || 0) > 0 && (
                    <PaginationFooter
                    total={applicationsPagination.total || 0}
                    page={applicationsPagination.page || 1}
                    totalPages={applicationsPagination.total_pages || 1}
                    setQuery={setApplicationsQuery}
                    />
                )}
                </div>
            </Card>
            </div>
        )}

        <LeaveFormModal
            isOpen={showFormModal}
            onClose={() => {
            setShowFormModal(false);
            setEditingApplication(null);
            }}
            onSubmit={async (data) => {
                if (editingApplication?.id) {
                    return await handleUpdateLeave(editingApplication.id, data);
                }
                return await handleCreateLeave(data);
            }}
            employees={employees}
            leaveTypes={leaveTypes}
            initialData={editingApplication}
        />

        <LeaveDetailModal
            isOpen={!!selectedApplication}
            onClose={() => {
            setSelectedApplication(null);
            setDetailAction(null);
            }}
            application={selectedApplication}
        />

        <LeaveStatusModal
            isOpen={detailAction === "status" && !!selectedApplication}
            onClose={() => {
            setDetailAction(null);
            setSelectedApplication(null);
            }}
            application={selectedApplication}
            onUpdate={async ({ status, remarks }) => {
            if (!selectedApplication) return;
            try {
                await updateLeaveStatus(selectedApplication.id, {
                status,
                remarks,
                });
                toast.success("Leave status updated.");
                setDetailAction(null);
                setSelectedApplication(null);
                refreshApplications();
                refreshOverview();
            } catch (error) {
                console.error(error);
                toast.error(
                error.response?.data?.message || "Failed to update leave status.",
                );
            }
            }}
        />

        {showDeleteConfirm && deleteTarget && (
            <ConfirmModal
            title="Delete leave application"
            description="Are you sure you want to delete this leave application? This cannot be undone."
            action="Delete"
            primaryButtonVariant="solidDanger"
            onCancel={() => {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
            }}
            onConfirm={handledDeleteLeave}
            />
        )}
        </div>
    );
};

export default LeaveManagement;
