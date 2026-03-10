import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';


const ProtectedRoute = ({ children }) => {

    const { user, loading } = useAuth();

    // Show a loading spinner while checking authentication status
    if (loading) return <Spinner />;

    // If not authenticated, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    // If authenticated, render the protected component(s)
    return children ? children : <Outlet />;

}

export default ProtectedRoute;