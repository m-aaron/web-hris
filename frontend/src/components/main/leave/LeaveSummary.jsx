import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "../../Skeleton";
import { formatPHDate } from "../../../helpers/dateHelper";
import { getLeaveSummary } from "../../../services/leaveService";

const statusStyles = {
    PENDING: "bg-light-yellow text-yellow border border-yellow",
    APPROVED: "bg-light-green text-green border border-green",
    DISAPPROVED: "bg-light-red text-red border border-red",
};

const LeaveSummary = ({ employeeId }) => {
    const [loading, setLoading] = useState(true);
    const [recentApplications, setRecentApplications] = useState([]);

    useEffect(() => {
        if (!employeeId) return;

        const fetchSummary = async () => {
            try {
                setLoading(true);
                const res = await getLeaveSummary(employeeId);
                setRecentApplications(res.recentApplications || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [employeeId]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wide">Leave Records</h4>
                {employeeId && (
                    <Link to={`/leave?employee=${employeeId}`} className="text-xs text-primary hover:underline">Manage Leaves →</Link>
                )}
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="max-h-35 overflow-y-auto space-y-2 pr-1 scrollbar">
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
                                    <p className="font-medium text-heading">{application.leave_types_display || "-"}</p>
                                    <p className="text-xs text-muted">{formatPHDate(application.date_filed)}</p>
                                </div>
                                <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusClass}`}>{application.status}</span>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default LeaveSummary;
