import { Card } from "../ui/Card";

const QuickStatCard = ({ label, value }) => {
    return (
        <Card className="p-3 rounded-xl shadow-sm transition hover:shadow-lg hover:scale-[1.02]">

            <p className="text-xs text-muted">{label}</p>
            <p className="text-lg font-semibold text-heading">{value}</p>
            
        </Card>
    )
}

export default QuickStatCard;