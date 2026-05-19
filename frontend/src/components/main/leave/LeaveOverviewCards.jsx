import { CalendarDays, Clock, CheckCircle, UserX } from "lucide-react";
import { Card } from "../ui/Card";

const StatCard = ({ title, value, icon, iconClass = "text-primary" }) => (
    <Card className="rounded-2xl p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-muted uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-semibold text-heading">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${iconClass}`}>
                {icon}
            </div>
        </div>
    </Card>
);

const LeaveOverviewCards = ({ stats = {}, loading = false }) => {
    const { totalThisMonth = 0, pending = 0, approvedThisMonth = 0, onLeaveToday = 0 } = stats || {};

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-24 bg-card rounded-2xl animate-pulse" />
                <div className="h-24 bg-card rounded-2xl animate-pulse" />
                <div className="h-24 bg-card rounded-2xl animate-pulse" />
                <div className="h-24 bg-card rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total This Month" value={totalThisMonth} icon={<CalendarDays size={20} />} iconClass="bg-grey text-primary" />
            <StatCard title="Pending" value={pending} icon={<Clock size={20} />} iconClass="bg-light-yellow text-yellow" />
            <StatCard title="Approved This Month" value={approvedThisMonth} icon={<CheckCircle size={20} />} iconClass="bg-light-green text-green" />
            <StatCard title="On Leave Today" value={onLeaveToday} icon={<UserX size={20} />} iconClass="bg-grey text-blue" />
        </div>
    );
};

export default LeaveOverviewCards;
// import { Card } from "../ui/Card";
// import Skeleton from "../../Skeleton";

// const LeaveOverviewCards = ({ stats, loading = false }) => {
//     const cards = [
//         { label: "Total This Month", key: "totalThisMonth" },
//         { label: "Pending", key: "pending" },
//         { label: "Approved This Month", key: "approvedThisMonth" },
//         { label: "On Leave Today", key: "onLeaveToday" },
//     ];

//     return (
//         <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-5">
//             {cards.map((card) => (
//                 <Card key={card.key} className="p-4 rounded-2xl shadow-sm transition hover:shadow-lg">
//                     <p className="text-xs text-muted">{card.label}</p>
//                     {loading ? (
//                         <Skeleton className="mt-2 h-6 w-16" />
//                     ) : (
//                         <p className="text-2xl font-semibold text-heading mt-2">
//                             {stats?.[card.key] ?? 0}
//                         </p>
//                     )}
//                 </Card>
//             ))}
//         </section>
//     );
// };

// export default LeaveOverviewCards;
