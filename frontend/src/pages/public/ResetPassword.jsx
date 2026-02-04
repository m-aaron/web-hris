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
            if (!newPassword || !confirmPassword) return toast.error("Please fill in all fields.");
            if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");

            const res = await API.post(`/auth/reset-password/${ token }`, { newPassword });

            toast.success(res.data.message || "Password has been reset successfully."); 

            setNewPassword("");
            setConfirmPassword("");

            navigate("/login");
        } catch (error) { 
            toast.error(error.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false)
        }
    }
    return (
        <AuthCard title="Reset your password" description="Create a new password for your account">
            <form className="mt-10 space-y-4" onSubmit={ handleSubmit }>
                <Input 
                    type="password" 
                    placeholder="Enter your new password" 
                    value={ newPassword }
                    onChange={ (e) => setNewPassword(e.target.value) }
                />
                <Input 
                    type="password" 
                    placeholder="Re-enter your new password" 
                    value={ confirmPassword }
                    onChange={ (e) => setConfirmPassword(e.target.value) }
                />
                <Button>{ loading ? "Saving..." : "Set New Password" }</Button>
                <p className="text-center text-lg text-primary">Remember your password?<Link to="/login" className="font-semibold">Sign in</Link></p>
            </form>
        </AuthCard>
    )
}

export default ResetPassword