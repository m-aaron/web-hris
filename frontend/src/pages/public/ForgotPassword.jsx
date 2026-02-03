import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import AuthCard from "../../components/auth/AuthCard"
import Button from "../../components/Button"
import Input from "../../components/Input"
import API from "../../api/axios.js"

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post("/auth/forgot-password", { email });

            toast.success(res.data.message || "If the email is registered, a reset link has been sent.");

            setEmail("");
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Forgot your password?" description="Enter your registered email address and we'll send you a link to reset your password.">
            <form className="mt-10 space-y-4" onSubmit={ handleSubmit }>
                <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={ email }
                    onChange={ e => setEmail(e.target.value) }
                />
                <Button disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
                <p className="text-center text-lg text-primary">Remember your password?<Link to="/login" className="font-semibold">Sign in</Link></p>
            </form>
        </AuthCard>
    )
}

export default ForgotPassword