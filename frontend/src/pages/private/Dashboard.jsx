import { WorkforceSection } from "../../components/main/dashboard/WorkforceSection";
import { RegularizationSection } from "../../components/main/dashboard/RegularizationSection";
import { BirthdaySection } from "../../components/main/dashboard/BirthdaySection";
import { AnalyticsSection } from "../../components/main/dashboard/AnalyticsSection";
import Button from "../../components/Button";

const Dashboard = () => {
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

            <WorkforceSection />
            <RegularizationSection />
            <BirthdaySection />
            <AnalyticsSection />
        </>
    );
};

export default Dashboard;