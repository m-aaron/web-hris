import { Outlet } from 'react-router-dom'

const AuthCard = ({ title, description, children }) => {
    return (
        <div className='w-full max-w-md 
        bg-card
        rounded-xl shadow-md 
        p-6'>
            <h2 className='text-center text-2xl 
            font-semibold text-primary
            mb-1'>{ title }</h2>
            <p className='text-center text-muted'>{ description }</p>

            { children }
        </div>
    )
}

export default AuthCard