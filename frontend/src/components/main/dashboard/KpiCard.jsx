import { Card } from "../ui/Card";
import { CardContent } from "./CardContent";

export const KpiCard = ({
    title,
    value,
    icon: Icon,
    variant = "default",
    onClick,
}) => {
    const variantStyles = {
        default: "bg-grey",
        success: "bg-light-green",
        warning: "bg-light-yellow",
        danger: "bg-light-red",
    };

    const iconColorStyles = {
        success: "text-green",
        warning: "text-yellow",
        danger: "text-red",
        default: "text-muted",
    };

    return (
        <Card
        onClick={onClick}
        className={`p-5 rounded-xl shadow-sm transition ${
            onClick
            ? "cursor-pointer hover:shadow-md hover:scale-[1.02]"
            : "cursor-default"
        }`}
        >
        <CardContent className="p-4 flex items-center justify-between">
            <div>
            <p className="text-sm text-muted">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            </div>

            {Icon && (
            <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
                <Icon className={`w-5 h-5 ${iconColorStyles[variant]}`} />
            </div>
            )}
        </CardContent>
        </Card>
    );
};
