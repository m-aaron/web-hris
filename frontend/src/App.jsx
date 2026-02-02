import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/public/Login";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";


const App = () => {
  return (
    <Routes>
      
      { /* Auth/Public */ }
      <Route element={<AuthLayout />}>
        <Route path="/login" element={ <Login /> } />
        <Route path="/forgot-password" element={ <ForgotPassword /> } />
        <Route path="/reset-password" element={ <ResetPassword /> } />
      </Route>

    </Routes>
  )
}

export default App