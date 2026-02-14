import { Outlet, useNavigate } from "react-router-dom";


const RoleGuard = ({ children, allowedRoles, userRole }) => {

    const navigate = useNavigate();

    // Check if user authorized
    if (!allowedRoles.includes(userRole)) {
        navigate("/unauthorized", { replace: true });
        return null;
    }

    return children ? children : <Outlet />;
}

export default RoleGuard