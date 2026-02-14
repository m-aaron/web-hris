import { useState } from "react";
import { Cake } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { BirthdayModal } from "../ui/BirthdayModal";

export const BirthdaySection = () => {
    const [open, setOpen] = useState(false);

    const birthdayTodayData = [
        { name: "Juan Dela Cruz", type: "Teaching", date: "Feb 14" },
        { name: "Maria Santos", type: "Non-Teaching", date: "Feb 14" },
        { name: "Ana Reyes", type: "Teaching", date: "Feb 14" },
    ];

    const birthdayCount = 4;

    return (
        <>
        <section className="space-y-4 pb-10">
            <h2 className="text-xl font-semibold text-heading">
            Birthday & Incentives
            </h2>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {/* Clickable Card */}
            <KpiCard
                title="Birthday Today"
                value={birthdayCount}
                icon={Cake}
                variant="success"
                onClick={birthdayCount > 0 ? () => setOpen(true) : undefined}
            />

            <KpiCard title="Birthdays This Month" value={8} icon={Cake} />

            <KpiCard
                title="Upcoming (Next 7 Days)"
                value={3}
                icon={Cake}
                variant="warning"
            />
            </div>
        </section>

        {/* Modal */}
        <BirthdayModal
            isOpen={open}
            onClose={() => setOpen(false)}
            data={birthdayTodayData}
        />
        </>
    );
};
