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
            const normalizedEmail = String(email || "").trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!normalizedEmail) {
                toast.error("Email is required.");
                return;
            }

            if (!emailRegex.test(normalizedEmail)) {
                toast.error("Invalid email format.");
                return;
            }

            await API.post("/auth/forgot-password", { email: normalizedEmail });

            toast.success("If the email is registered, a reset link has been sent.");

            setEmail("");
        } catch (error) {
            if (error.code === "ECONNABORTED") {
                toast.error("Request timed out. Please try again.");
            } else if (!error.response) {
                toast.error("Cannot reach server. Please check backend server and CORS config.");
            } else {
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Forgot your password?" description="Enter your registered email address and we'll send you a link to reset your password.">
            <form className="mt-10 space-y-4" onSubmit={ handleSubmit }>
                <Input 
                    type="email" 
                    className="p-3"
                    placeholder="Enter your email" 
                    value={ email }
                    onChange={ e => setEmail(e.target.value) }
                />
                <Button className="w-full" loading={loading} loadingText="Sending...">Send Reset Link</Button>
                <p className="text-center text-lg text-primary">Remember your password? <Link to="/login" className="font-semibold">Sign in</Link></p>
            </form>
        </AuthCard>
    )
}

export default ForgotPassword