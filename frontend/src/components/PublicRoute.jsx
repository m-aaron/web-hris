import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roleConstant";
import Spinner from "./Spinner";

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;

    if (user) {
        const lastRoute = localStorage.getItem("lastRoute");

        if (lastRoute) {
        localStorage.removeItem("lastRoute");
        return <Navigate to={lastRoute} replace />;
        }

        // Default dashboard
        if (user.role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
        if (user.role === ROLES.HR) return <Navigate to="/hr/dashboard" replace />;
        return <Navigate to="/employee/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
