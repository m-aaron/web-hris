import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import AuthCard from "../../components/auth/AuthCard"
import Button from "../../components/Button"
import Input from "../../components/Input"
import API from "../../api/axios.js"

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { token } = useParams();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const trimmedPassword = newPassword.trim();
            const trimmedConfirmPassword = confirmPassword.trim();

            if (!trimmedPassword || !trimmedConfirmPassword) {
                return toast.error("Please fill in all fields.");
            }

            if (trimmedPassword.length < 8 || trimmedConfirmPassword.length < 8) {
                return toast.error("Password must be at least 8 characters.");
            }

            if (trimmedPassword !== trimmedConfirmPassword) {
                return toast.error("Passwords do not match.");
            }

            if (!token?.trim()) {
                return toast.error("Invalid or missing reset token.");
            }

            const res = await API.post(`/auth/reset-password/${token.trim()}`, { newPassword: trimmedPassword });

            toast.success(res.data.message || "Password has been reset successfully."); 

            setNewPassword("");
            setConfirmPassword("");

            navigate("/login");
        } catch (error) {
            if (error.code === "ECONNABORTED") {
                toast.error("Request timed out. Please try again.");
            } else if (!error.response) {
                toast.error("Cannot reach server. Please check backend server and CORS config.");
            } else {
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false)
        }
    }
    return (
        <AuthCard title="Reset your password" description="Create a new password for your account">
            <form className="mt-8 space-y-4" onSubmit={ handleSubmit }>
                <Input 
                    type="password" 
                    className="p-3"
                    placeholder="Enter your new password" 
                    value={ newPassword }
                    onChange={ (e) => setNewPassword(e.target.value) }
                />
                <Input 
                    type="password" 
                    className="p-3"
                    placeholder="Re-enter your new password" 
                    value={ confirmPassword }
                    onChange={ (e) => setConfirmPassword(e.target.value) }
                />
                <Button className="w-full" loading={loading} loadingText="Saving...">Set New Password</Button>
                <p className="text-center text-sm text-muted">Remember your password? <Link to="/login" className="font-semibold text-primary">Sign in</Link></p>
            </form>
        </AuthCard>
    )
}

export default ResetPassword