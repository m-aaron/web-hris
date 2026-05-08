import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "../../Skeleton";
import { formatEnum } from "../../../helpers/employeeHelper";
import { formatPHDate } from "../../../helpers/dateHelper";
import { getLeaveSummary } from "../../../services/leaveService";

const statusStyles = {
    PENDING: "bg-light-yellow text-yellow border border-yellow",
    APPROVED: "bg-light-green text-green border border-green",
    REJECTED: "bg-light-red text-red border border-red",
};

const getBalanceColor = (remaining) => {
    if (remaining <= 0) return "text-red";
    if (remaining <= 5) return "text-yellow";
    return "text-green";
};

const LeaveSummary = ({ employeeId }) => {
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);

    useEffect(() => {
        if (!employeeId) return;

        const fetchSummary = async () => {
            try {
                setLoading(true);
                const res = await getLeaveSummary(employeeId);
                setBalances(res.balances || []);
                setRecentApplications(res.recentApplications || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [employeeId]);

    const hasBalances = balances.length > 0;

    const renderedBalances = useMemo(() => {
        return balances.map((balance) => {
            const remaining = Number(balance.total_entitlement || 0) - Number(balance.used_days || 0);

            return (
                <div key={balance.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{balance.leave_type}</span>
                    <span className={`font-semibold ${getBalanceColor(remaining)}`}>
                        {balance.used_days} / {balance.total_entitlement}
                    </span>
                </div>
            );
        });
    }, [balances]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Leave Balance
                </h4>
                {employeeId && (
                    <Link
                        to={`/leave?employee=${employeeId}`}
                        className="text-xs text-primary hover:underline"
                    >
                        Manage Leaves →
                    </Link>
                )}
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
                {loading && (
                    <>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                    </>
                )}

                {!loading && !hasBalances && (
                    <p className="text-sm text-muted">No leave balances available.</p>
                )}

                {!loading && hasBalances && renderedBalances}
            </div>

            <div className="space-y-2">
                <h5 className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Recent Applications
                </h5>

                <div className="space-y-2">
                    {loading && (
                        <>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </>
                    )}

                    {!loading && recentApplications.length === 0 && (
                        <p className="text-sm text-muted">No recent leave applications.</p>
                    )}

                    {!loading && recentApplications.map((application) => {
                        const statusClass = statusStyles[application.status] || "bg-grey text-muted border border-muted";

                        return (
                            <div key={application.id} className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-medium text-heading">
                                        {application.leave_type}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {formatPHDate(application.date_from)} - {formatPHDate(application.date_to)}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusClass}`}>
                                    {formatEnum(application.status)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LeaveSummary;
