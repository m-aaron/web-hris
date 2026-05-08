import { Card } from "../ui/Card";
import Skeleton from "../../Skeleton";

const LeaveOverviewCards = ({ stats, loading = false }) => {
    const cards = [
        { label: "Total This Month", key: "totalThisMonth" },
        { label: "Pending", key: "pending" },
        { label: "Approved This Month", key: "approvedThisMonth" },
        { label: "On Leave Today", key: "onLeaveToday" },
    ];

    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-5">
            {cards.map((card) => (
                <Card key={card.key} className="p-4 rounded-2xl shadow-sm transition hover:shadow-lg">
                    <p className="text-xs text-muted">{card.label}</p>
                    {loading ? (
                        <Skeleton className="mt-2 h-6 w-16" />
                    ) : (
                        <p className="text-2xl font-semibold text-heading mt-2">
                            {stats?.[card.key] ?? 0}
                        </p>
                    )}
                </Card>
            ))}
        </section>
    );
};

export default LeaveOverviewCards;
