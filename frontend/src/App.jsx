import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import { ROLES } from "./constants/roleConstant";
import { useAuth } from "./hooks/useAuth";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/public/Login";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import Dashboard from "./pages/private/Dashboard";
import Employee from "./pages/private/Employee";
import EmployeeEdit from "./pages/private/EmployeeEdit";


const App = () => {
  const { user } = useAuth();
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        
        { /* Auth/Public */ }
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={ <Login /> } />
            <Route path="/forgot-password" element={ <ForgotPassword /> } />
            <Route path="/reset-password/:token" element={ <ResetPassword /> } />
          </Route>
        </Route>

        { /* Private */ }
        <Route element={<ProtectedRoute />}>
          
          { /* ADMIN & HR */ }
          <Route element={<RoleGuard allowedRoles={ [ROLES.ADMIN, ROLES.HR] } userRole={ user?.role } />}>
            <Route element={ <MainLayout /> }>
              <Route path="/dashboard" element={ <Dashboard /> } />
              <Route path="/employees" element={ <Employee /> } />
            </Route>
            <Route path="/employees/:id/edit" element={<EmployeeEdit />} />
          </Route>

        </Route>

      </Routes>
    </>
  )
}

export default App