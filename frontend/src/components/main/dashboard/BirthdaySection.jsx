import { useState } from "react";
import { Cake } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { BirthdayModal } from "../ui/BirthdayModal";

export const BirthdaySection = ( { summary, birthdaysTodayData } ) => {
    const [open, setOpen] = useState(false);

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
                value={ summary.total_birthday_today }
                icon={Cake}
                variant="success"
                onClick={summary.total_birthday_today > 0 ? () => setOpen(true) : undefined}
            />

            <KpiCard title="Birthdays This Month" value={ summary.total_birthday_this_month } icon={Cake} />

            <KpiCard
                title="Upcoming (Next 7 Days)"
                value={ summary.total_birthday_next_7_days }
                icon={Cake}
                variant="warning"
            />
            </div>
        </section>

        {/* Modal */}
        <BirthdayModal
            isOpen={open}
            onClose={() => setOpen(false)}
            data={birthdaysTodayData}
        />
        </>
    );
};
