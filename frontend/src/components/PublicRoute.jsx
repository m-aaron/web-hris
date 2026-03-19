import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "./Spinner";

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;

    if (user) {
        // Default dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
