import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingState from './LoadingState';


const ProtectedRoute = ({ children }) => {

    const { user, loading } = useAuth();

    // Show a loading spinner while checking authentication status
    if (loading) return <LoadingState fullScreen label="Checking your session..." />;

    // If not authenticated, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    // If authenticated, render the protected component(s)
    return children ? children : <Outlet />;

}

export default ProtectedRoute;