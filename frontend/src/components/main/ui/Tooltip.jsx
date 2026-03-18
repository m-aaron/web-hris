import { useState } from "react";


const Tooltip = ({ text, children, open, align = "center" }) => {

    const [visible, setVisible] = useState(false);
    const hasText = Boolean(text);
    const isControlled = typeof open === "boolean";
    const isVisible = hasText && (isControlled ? open : visible);
    const isStartAligned = align === "start";

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => !isControlled && hasText && setVisible(true)}
            onMouseLeave={() => !isControlled && setVisible(false)}
            onFocus={() => !isControlled && hasText && setVisible(true)}
            onBlur={() => !isControlled && setVisible(false)}
        >
        {children}

        {isVisible && (
            <div
            role="tooltip"
            className={`absolute z-50 bottom-full mb-2 whitespace-nowrap rounded-lg border border-border/70 bg-card/95 px-2.5 py-1.5 text-[11px] font-medium text-heading shadow-xl backdrop-blur-sm pointer-events-none ${isStartAligned ? "left-0" : "left-1/2 -translate-x-1/2"}`}
            >
                {text}
            <span
                className={`absolute top-full h-2 w-2 -translate-y-1/2 rotate-45 border-r border-b border-border/70 bg-card/95 ${isStartAligned ? "left-3" : "left-1/2 -translate-x-1/2"}`}
            />
            </div>
        )}
        </div>
    );
}

export default Tooltip;