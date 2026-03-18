import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Check } from "lucide-react"
import { Card } from "../ui/Card"

const SectionDrawer = ({ title, children, hasData = false }) => {

    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (hasData) {
        setOpen(true)
        }
    }, [hasData])

    return (

        <Card className="overflow-hidden">

            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 bg-muted/20 hover:bg-muted/30 transition"
            >

                <div className="flex items-center gap-3">

                {open ? (
                    <ChevronDown size={18}/>
                ) : (
                    <ChevronRight size={18}/>
                )}

                <span className="font-semibold text-sm text-heading tracking-wide">
                    {title}
                </span>

                </div>

                {hasData && (
                    <Check
                        size={18}
                        className="text-muted"
                    />
                )}

            </button>

            {open && (
                <div className="p-6 border-t border-border">
                    {children}
                </div>
            )}

        </Card>

    )
}

export default SectionDrawer