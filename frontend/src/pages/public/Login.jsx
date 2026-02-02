import { Link } from "react-router-dom"
import AuthCard from "../../components/auth/AuthCard"
import Button from "../../components/Button"
import Input from "../../components/Input"

const Login = () => {
    return (
        <AuthCard title="Welcome back!" description="Access your account to manage your work and records.">
            <form className="mt-10 space-y-4">
                <Input type="email" placeholder="Enter your email" />
                <div>
                    <Input type="password" placeholder="Enter your password"/>
                    <div className='text-right'>
                        <Link to="/forgot-password" className='text-sm text-primary'>Forgot password?</Link>
                    </div>
                </div>
                
                <Button>Sign in</Button>
            </form>
        </AuthCard>
    )
}

export default Login