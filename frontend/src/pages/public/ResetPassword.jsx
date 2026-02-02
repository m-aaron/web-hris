import { Link } from "react-router-dom"
import AuthCard from "../../components/auth/AuthCard"
import Button from "../../components/Button"
import Input from "../../components/Input"

const ResetPassword = () => {
    return (
        <AuthCard title="Reset your password" description="Create a new password for your account">
            <form className="mt-10 space-y-4">
                <Input type="password" placeholder="Enter your new password" />
                <Input type="password" placeholder="Re-enter your new password" />
                <Button>Set New Password</Button>
                <p className="text-center text-lg text-primary">Remember your password?<Link to="/login" className="font-semibold">Sign in</Link></p>
            </form>
        </AuthCard>
    )
}

export default ResetPassword