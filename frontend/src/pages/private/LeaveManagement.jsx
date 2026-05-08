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
import LeaveBalanceTable from "../../components/main/leave/LeaveBalanceTable";

import { getEmployees } from "../../services/employeeService";
import {
    getLeaveTypes,
    getLeaveApplications,
    createLeaveApplication,
    approveLeaveApplication,
    rejectLeaveApplication,
    getLeaveBalances,
    updateLeaveBalance
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

const DEFAULT_BALANCES_QUERY = {
    employee_id: "",
    year: new Date().getFullYear(),
    page: 1,
    limit: 10,
};

const LeaveManagement = () => {
    const [searchParams] = useSearchParams();
    const employeeParam = searchParams.get("employee");

    const [activeTab, setActiveTab] = useState("applications");

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [applications, setApplications] = useState([]);
    const [applicationsPagination, setApplicationsPagination] = useState({});
    const [applicationsLoading, setApplicationsLoading] = useState(true);

    const [balances, setBalances] = useState([]);
    const [balancesPagination, setBalancesPagination] = useState({});
    const [balancesLoading, setBalancesLoading] = useState(true);

    const [overviewStats, setOverviewStats] = useState({});
    const [overviewLoading, setOverviewLoading] = useState(true);

    const [applicationsQuery, setApplicationsQuery] = useState(
        DEFAULT_APPLICATIONS_QUERY,
    );
    const [balancesQuery, setBalancesQuery] = useState(DEFAULT_BALANCES_QUERY);

    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailAction, setDetailAction] = useState(null);

    const [balanceEmployeeSearch, setBalanceEmployeeSearch] = useState("");

    useEffect(() => {
        if (!employeeParam) return;

        setApplicationsQuery((prev) => ({
        ...prev,
        employee_id: employeeParam,
        page: 1,
        }));

        setBalancesQuery((prev) => ({
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
            limit: 200,
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
        const res = await getLeaveApplications({ page: 1, limit: 250 });
        const list = res.applications || [];
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const isSameMonth = (dateValue) => {
            if (!dateValue) return false;
            const date = new Date(dateValue);
            return (
            date.getFullYear() === currentYear && date.getMonth() === currentMonth
            );
        };

        const isOnLeaveToday = (application) => {
            if (application.status !== "APPROVED") return false;
            const from = new Date(application.date_from);
            const to = new Date(application.date_to);
            if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()))
            return false;
            return from <= today && to >= today;
        };

        const totalThisMonth = list.filter((item) =>
            isSameMonth(item.date_filed || item.created_at),
        ).length;
        const pending = list.filter((item) => item.status === "PENDING").length;
        const approvedThisMonth = list.filter(
            (item) =>
            item.status === "APPROVED" &&
            isSameMonth(item.date_filed || item.created_at),
        ).length;
        const onLeaveToday = list.filter(isOnLeaveToday).length;

        setOverviewStats({
            totalThisMonth,
            pending,
            approvedThisMonth,
            onLeaveToday,
        });
        } catch (error) {
        console.error(error);
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

    const refreshBalances = useCallback(
        async (overrideQuery) => {
        try {
            setBalancesLoading(true);
            const params = overrideQuery || balancesQuery;
            const res = await getLeaveBalances(params);
            setBalances(res.balances || []);
            setBalancesPagination(res.pagination || {});
        } catch (error) {
            console.error(error);
            toast.error("Failed to load leave balances.");
        } finally {
            setBalancesLoading(false);
        }
        },
        [balancesQuery],
    );

    useEffect(() => {
        refreshApplications();
    }, [applicationsQuery, refreshApplications]);

    useEffect(() => {
        refreshBalances();
    }, [balancesQuery, refreshBalances]);

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

    const handleBalancesFilterChange = (field, value) => {
        setBalancesQuery((prev) => ({
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
        const payload = {
            employee_id: data.employee_id,
            leave_type_id: Number(data.leave_type_id),
            ...optionalDateFiled,
            date_from: data.date_from,
            date_to: data.date_to,
            number_of_days: Number(data.number_of_days),
            reason: data.reason || "",
        };

        await createLeaveApplication(payload);
        toast.success("Leave application created successfully.");
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

    const handleApprove = async (remarks) => {
        if (!selectedApplication) return false;

        try {
        await approveLeaveApplication(
            selectedApplication.id,
            remarks ? { remarks } : {},
        );
        toast.success("Leave application approved.");
        setSelectedApplication(null);
        setDetailAction(null);
        refreshApplications();
        refreshOverview();
        return true;
        } catch (error) {
        console.error(error);
        toast.error(
            error.response?.data?.message || "Failed to approve leave application.",
        );
        return false;
        }
    };

    const handleReject = async (remarks) => {
        if (!selectedApplication) return false;

        try {
        await rejectLeaveApplication(selectedApplication.id, { remarks });
        toast.success("Leave application rejected.");
        setSelectedApplication(null);
        setDetailAction(null);
        refreshApplications();
        refreshOverview();
        return true;
        } catch (error) {
        console.error(error);
        toast.error(
            error.response?.data?.message || "Failed to reject leave application.",
        );
        return false;
        }
    };

    const handleUpdateBalance = async (id, values) => {
        const total = Number(values.total_entitlement);
        const used = Number(values.used_days);

        if (
        !Number.isFinite(total) ||
        !Number.isFinite(used) ||
        total < 0 ||
        used < 0
        ) {
        toast.error("Total entitlement and used days must be 0 or greater.");
        return false;
        }

        try {
        await updateLeaveBalance(id, {
            total_entitlement: total,
            used_days: used,
        });
        toast.success("Leave balance updated successfully.");
        refreshBalances();
        return true;
        } catch (error) {
        console.error(error);
        toast.error(
            error.response?.data?.message || "Failed to update leave balance.",
        );
        return false;
        }
    };

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();

        return Array.from({ length: 6 }).map((_, index) => {
        const year = currentYear - index;
        return { value: String(year), label: String(year) };
        });
    }, []);

    const balanceEmployeeOptions = useMemo(() => {
        const normalizedSearch = balanceEmployeeSearch.trim().toLowerCase();
        const filtered = employees.filter((employee) => {
        if (!normalizedSearch) return true;

        const display = `${employee.employee_no || ""} ${employee.display_name || ""}`;
        return display.toLowerCase().includes(normalizedSearch);
        });

        return [
        { value: "", label: "All employees" },
        ...filtered.map((employee) => ({
            value: String(employee.id),
            label: `${employee.employee_no || ""} - ${employee.display_name || ""}`,
        })),
        ];
    }, [employees, balanceEmployeeSearch]);

    return (
        <div className="space-y-6">
        <PageHeader
            title="Leave Management"
            description="Review leave applications, approve requests, and manage employee leave balances."
            actions={
            <Button
                size="small"
                className="w-full md:w-auto"
                onClick={() => setShowFormModal(true)}
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
            <button
            className={`text-sm font-medium pb-1 transition-all duration-200 ${
                activeTab === "balances"
                ? "text-primary border-b-2 border-primary"
                : "text-muted hover:text-primary"
            }`}
            onClick={() => setActiveTab("balances")}
            >
            Leave Balances
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
                    { value: "REJECTED", label: "Rejected" },
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
                    onView={(row) => {
                    setSelectedApplication(row);
                    setDetailAction(null);
                    }}
                    onApprove={(row) => {
                    setSelectedApplication(row);
                    setDetailAction("approve");
                    }}
                    onReject={(row) => {
                    setSelectedApplication(row);
                    setDetailAction("reject");
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

        {activeTab === "balances" && (
            <div className="space-y-4">
            <Card className="rounded-2xl shadow-sm p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-5">
                    <label className="text-xs mb-1 text-muted">Search</label>
                    <input
                    type="text"
                    placeholder="Search employee..."
                    value={balanceEmployeeSearch}
                    onChange={(event) =>
                        setBalanceEmployeeSearch(event.target.value)
                    }
                    className="
                        w-full px-4 py-2 
                        text-heading 
                        border border-border
                        rounded-xl
                        focus:outline-none
                        focus:ring-2 focus:ring-primary
                        focus:border-primary
                        transition duration-200
                    "
                    />
                </div>

                <div className="md:col-span-4">
                    <SelectField
                    label="Employee"
                    value={balancesQuery.employee_id}
                    onChange={(value) =>
                        handleBalancesFilterChange("employee_id", value)
                    }
                    options={balanceEmployeeOptions}
                    className="text-sm"
                    />
                </div>

                <div className="md:col-span-3">
                    <SelectField
                    label="Year"
                    value={String(balancesQuery.year)}
                    onChange={(value) =>
                        handleBalancesFilterChange("year", value)
                    }
                    options={yearOptions}
                    className="text-sm"
                    />
                </div>
                </div>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <div className="p-4 space-y-4">
                <LeaveBalanceTable
                    balances={balances}
                    loading={balancesLoading}
                    onSave={handleUpdateBalance}
                />

                {!balancesLoading && (balances?.length || 0) > 0 && (
                    <PaginationFooter
                    total={balancesPagination.total || 0}
                    page={balancesPagination.page || 1}
                    totalPages={balancesPagination.total_pages || 1}
                    setQuery={setBalancesQuery}
                    />
                )}
                </div>
            </Card>
            </div>
        )}

        <LeaveFormModal
            isOpen={showFormModal}
            onClose={() => setShowFormModal(false)}
            onSubmit={handleCreateLeave}
            employees={employees}
            leaveTypes={leaveTypes}
        />

        <LeaveDetailModal
            isOpen={!!selectedApplication}
            onClose={() => {
            setSelectedApplication(null);
            setDetailAction(null);
            }}
            application={selectedApplication}
            onApprove={handleApprove}
            onReject={handleReject}
            defaultAction={detailAction}
        />
        </div>
    );
};

export default LeaveManagement;
