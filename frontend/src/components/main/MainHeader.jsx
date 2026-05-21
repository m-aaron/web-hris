import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Bell, Menu, X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { toast } from "sonner";
import ThemeToggle from "../ThemeToggle";

const MainHeader = () => {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    // const handleReportsClick = (e) => {
    //     e.preventDefault();
    //     setOpen(false);
    //     toast.info("Reports is not implemented yet.");
    // };

    // Close mobile menu when screen resizes to desktop
    useEffect(() => {
        const handleResize = () => {
        if (window.innerWidth >= 768) {
            setOpen(false);
        }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navLinkClass = ({ isActive }) =>
        `text-sm font-medium pb-1 transition-all duration-200 ${
        isActive
            ? "text-primary border-b-2 border-primary"
            : "text-muted hover:text-primary"
        }`;

    const mobileLinkClass = ({ isActive }) =>
        `block py-2 text-sm ${
        isActive
            ? "text-primary font-semibold"
            : "text-muted hover:text-primary"
        }`;

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-50 border-b border-border bg-card/90 backdrop-blur-lg shadow-sm">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <button
                        className="md:hidden p-2 rounded-lg hover:bg-soft-surface transition"
                        onClick={() => setOpen(prev => !prev)}
                        >
                        {open ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <Link to="/dashboard" className="font-bold text-lg text-primary">
                            MC HRIS
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-6 text-muted">
                        <NavLink to="/dashboard" className={navLinkClass}>
                        Dashboard
                        </NavLink>
                        <NavLink to="/employees" className={navLinkClass}>
                        Employees
                        </NavLink>
                        <NavLink to="/leave" className={navLinkClass}>
                        Leave Management
                        </NavLink>
                        <NavLink to="/faculties" className={navLinkClass}>
                        Reports
                        </NavLink>
                        {isAdmin && (
                            <NavLink to="/users" className={navLinkClass}>
                                User Management
                            </NavLink>
                        )}
                        {isAdmin && (
                            <NavLink to="/settings/system" className={navLinkClass}>
                                System Settings
                            </NavLink>
                        )}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle className="hidden md:inline-flex" />
                        <Bell className="w-5 h-5 text-muted hover:text-primary cursor-pointer transition hidden"/>
                        <Link
                            to="/settings"
                            className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                            title="Profile & Settings"
                            aria-label="Open Profile & Settings"
                        >
                            <UserAvatar user={user} size="sm" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                <div
                className={`md:hidden absolute top-16 left-0 w-full bg-card shadow-md border-t border-border transform transition-all duration-300 ${
                    open
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
                >
                <nav className="flex flex-col p-4 space-y-3">
                    <div className="flex items-center justify-end">
                        <ThemeToggle />
                    </div>
                    
                    <NavLink
                        to="/dashboard"
                        className={mobileLinkClass}
                        onClick={() => setOpen(false)}
                    >
                    Dashboard
                    </NavLink>

                    <NavLink
                        to="/employees"
                        className={mobileLinkClass}
                        onClick={() => setOpen(false)}
                    >
                    Employees
                    </NavLink>

                    <NavLink
                        to="/leave"
                        className={mobileLinkClass}
                        onClick={() => setOpen(false)}
                    >
                    Leave Management
                    </NavLink>

                    <NavLink
                        to="/faculties"
                        className={mobileLinkClass}
                        onClick={() => setOpen(false)}
                    >
                    Reports
                    </NavLink>

                    {isAdmin && (
                        <NavLink
                            to="/users"
                            className={mobileLinkClass}
                            onClick={() => setOpen(false)}
                        >
                            User Management
                        </NavLink>
                    )}

                    {isAdmin && (
                        <NavLink
                            to="/settings/system"
                            className={mobileLinkClass}
                            onClick={() => setOpen(false)}
                        >
                            System Settings
                        </NavLink>
                    )}

                    <NavLink
                        to="/settings"
                        className={mobileLinkClass}
                        onClick={() => setOpen(false)}
                    >
                        Profile & Settings
                    </NavLink>
                </nav>
                </div>
            </header>

            {/* Backdrop Overlay */}
            {open && (
                <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setOpen(false)}
                />
            )}
        </>
    );
};

export default MainHeader;
