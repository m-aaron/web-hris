import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingState from "../../components/LoadingState";
import { getDashboardSummary } from "../../services/dashboardService";
import { WorkforceSection } from "../../components/main/dashboard/WorkforceSection";
import { RegularizationSection } from "../../components/main/dashboard/RegularizationSection";
import { BirthdaySection } from "../../components/main/dashboard/BirthdaySection";
import { AnalyticsSection } from "../../components/main/dashboard/AnalyticsSection";
import Button from "../../components/Button";
import EmptyState from "../../components/main/ui/EmptyState";
import PageHeader from "../../components/main/ui/PageHeader";

const Dashboard = () => {
    const navigate = useNavigate();
    const [dashboardSummary, setDashboardSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardSummary = async () => {
            try {
                const { success, data } = await getDashboardSummary();

                if (!success) {
                    toast.error("Failed to load dashboard summary.");
                    return;
                };

                setDashboardSummary(data);

            } catch (error) {
                console.error("Error fetching dashboard summary:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardSummary();
    }, []);

    if (loading) {
        return <LoadingState label="Loading dashboard..." className="min-h-[60vh]" />;
    };

    if (!dashboardSummary) {
        return (
            <EmptyState
                title="Dashboard data unavailable"
                description="We could not load the dashboard right now. Please refresh and try again."
                className="mt-10"
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Dashboard"
                description="View workforce trends, regularization status, and key employee insights."
                actions={(
                    <Button size="medium" className="w-full md:w-auto" onClick={() => navigate("/employees/create")}>
                        + Create Employee
                    </Button>
                )}
                className="mb-6 pt-2"
            />


            {/* Separator */}
            <div className="border-t border-border pb-6" />

            <WorkforceSection summary={dashboardSummary.summary} />
            <RegularizationSection
                summary={dashboardSummary.summary}
                becomingRegular={dashboardSummary.becomingRegular}
            />
            <BirthdaySection summary={dashboardSummary.summary} birthdaysTodayData={dashboardSummary.birthdaysToday} />
            <AnalyticsSection
                summary={dashboardSummary.summary}
                forecast={dashboardSummary.forecast}
            />
        </>
    );
};

export default Dashboard;