import { Outlet } from 'react-router-dom'
import MainHeader from '../components/main/MainHeader'

const MainLayout = () => {
    return (
        <div className='flex flex-col min-h-screen'>
            <MainHeader />
            
            <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-16 pb-15">
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout