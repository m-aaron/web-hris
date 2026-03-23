import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "../../hooks/useAuth"
import AuthCard from "../../components/auth/AuthCard"
import Button from "../../components/Button"
import Input from "../../components/Input"

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const normalizedEmail = String(email || "").trim().toLowerCase();
            const enteredPassword = String(password || "");

            if (!normalizedEmail || !enteredPassword) {
                toast.error("Email and password are required.");
                return;
            }

            await login({
                email: normalizedEmail,
                password: enteredPassword,
            });

            navigate("/dashboard");
            toast.success("Login successful!");

        } catch (error) {
            if (error.code === "ECONNABORTED") {
                toast.error("Request timed out. Please try again.");
            } else if (!error.response) {
                toast.error("Cannot reach server. Please check backend server and CORS config.");
            } else {
                toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    
    return (
        <AuthCard title="Welcome back!" description="Access your account to manage your work and records.">
            <form className="mt-8 space-y-4" onSubmit={ handleSubmit }>
                <Input 
                    type="email" 
                    className="p-3"
                    placeholder="Enter your email" 
                    value={ email } 
                    onChange={ e => setEmail(e.target.value) } 
                />
                <div>
                    <Input 
                        type="password" 
                        className="p-3"
                        placeholder="Enter your password" 
                        value={ password } 
                        onChange={ e => setPassword(e.target.value) } 
                    />
                    <div className='text-right'>
                        <Link to="/forgot-password" className='text-sm text-primary'>Forgot password?</Link>
                    </div>
                </div>
                
                <Button className="w-full" loading={loading} loadingText="Signing in...">Sign in</Button>
                <p className="text-center text-sm text-muted">Secure access for employee management.</p>
            </form>
        </AuthCard>
    )
}

export default Login