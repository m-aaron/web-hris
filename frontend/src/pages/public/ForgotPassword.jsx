import { Link } from "react-router-dom"
import AuthCard from "../../components/auth/AuthCard"
import Button from "../../components/Button"
import Input from "../../components/Input"

const ForgotPassword = () => {
    return (
        <AuthCard title="Forgot your password?" description="Enter your registered email address and we'll send you a link to reset your password.">
            <form className="mt-10 space-y-4">
                <Input type="email" placeholder="Enter your email" />
                <Button>Send Reset Link</Button>
                <p className="text-center text-lg text-primary">Remember your password?<Link to="/login" className="font-semibold">Sign in</Link></p>
            </form>
        </AuthCard>
    )
}

export default ForgotPassword