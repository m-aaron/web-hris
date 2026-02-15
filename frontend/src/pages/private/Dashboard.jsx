import { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "sonner";
import Spinner from "../../components/Spinner";
import { getDashboardSummary } from "../../services/dashboardService";
import { WorkforceSection } from "../../components/main/dashboard/WorkforceSection";
import { RegularizationSection } from "../../components/main/dashboard/RegularizationSection";
import { BirthdaySection } from "../../components/main/dashboard/BirthdaySection";
import { AnalyticsSection } from "../../components/main/dashboard/AnalyticsSection";
import Button from "../../components/Button";

const Dashboard = () => {
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
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        );
    };

    return (
        <>  
            {/* Header */}
            <div className="grid gap-4 py-8 md:grid-cols-2 md:items-center">

                <h1 className="text-2xl text-heading sm:text-3xl font-semibold tracking-tight">
                    Dashboard
                </h1>

                <div className="md:justify-self-end md:max-w-xs">
                    <Button>
                        + Create Employee
                    </Button>
                </div>

            </div>


            {/* Separator */}
            <div className="border-t border-border pb-5" />

            <WorkforceSection summary={ dashboardSummary.summary } />
            <RegularizationSection 
                summary={ dashboardSummary.summary } 
                becomingRegular={ dashboardSummary.becomingRegular } 
            />
            <BirthdaySection summary={ dashboardSummary.summary } birthdaysTodayData={ dashboardSummary.birthdaysToday } />
            <AnalyticsSection 
                summary={dashboardSummary.summary}
                forecast={dashboardSummary.forecast}
            />
        </>
    );
};

export default Dashboard;