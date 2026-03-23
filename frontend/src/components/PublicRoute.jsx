import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingState from "./LoadingState";

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingState fullScreen label="Checking your session..." />;

    if (user) {
        // Default dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
