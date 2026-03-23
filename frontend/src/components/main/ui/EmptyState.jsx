import { createElement } from "react";
import { Inbox } from "lucide-react";

const EmptyState = ({
    title = "No results found",
    description = "Try adjusting your filters or search query.",
    icon,
    action = null,
    className = "",
}) => {
    const ResolvedIcon = icon ?? Inbox;

    return (
        <div className={`mx-auto flex w-full max-w-lg flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/70 p-6 text-center ${className}`}>
            <div className="mb-3 rounded-full bg-soft-surface p-3 text-muted">
                {createElement(ResolvedIcon, { size: 20 })}
            </div>
            <h3 className="text-base font-semibold text-heading">{title}</h3>
            <p className="mt-1 text-sm text-muted">{description}</p>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
};

export default EmptyState;
