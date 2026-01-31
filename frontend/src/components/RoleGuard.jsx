import { Outlet } from "react-router-dom";


const RoleGuard = ({ children, allowedRoles, userRole }) => {

    // Check if user authorized
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children ? children : <Outlet />;
}

export default RoleGuard