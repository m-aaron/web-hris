import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ROLES } from "../../constants/roleConstant"
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
            const res = await login({email, password});

            if (lastRoute) {
                navigate("/dashboard");
                toast.success(res.message || "Login successful!");
            } else {
                if (res.role === ROLES.ADMIN || res.role === ROLES.HR) navigate("/dashboard");
                else navigate("/employee/dashboard");
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    
    return (
        <AuthCard title="Welcome back!" description="Access your account to manage your work and records.">
            <form className="mt-10 space-y-4" onSubmit={ handleSubmit }>
                <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={ email } 
                    onChange={ e => setEmail(e.target.value) } 
                />
                <div>
                    <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        value={ password } 
                        onChange={ e => setPassword(e.target.value) } 
                    />
                    <div className='text-right'>
                        <Link to="/forgot-password" className='text-sm text-primary'>Forgot password?</Link>
                    </div>
                </div>
                
                <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
            </form>
        </AuthCard>
    )
}

export default Login