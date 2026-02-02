import { Outlet } from 'react-router-dom'
import AuthHeader from '../components/auth/AuthHeader'
import AuthFooter from '../components/auth/AuthFooter'

const AuthLayout = () => {
    return (
        <div className='flex flex-col min-h-screen'>

            <AuthHeader />

            <main className='flex-1 flex 
            items-center justify-center 
            px-4 sm:px-6'>
                <Outlet />
            </main>

            <AuthFooter />
        </div>
    )
}

export default AuthLayout