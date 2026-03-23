import { Outlet } from 'react-router-dom'
import MainHeader from '../components/main/MainHeader'

const MainLayout = () => {
    return (
        <div className='flex flex-col min-h-screen'>
            <MainHeader />
            
            <main className="flex-1 px-4 pt-20 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
                <div className="mx-auto w-full max-w-[1400px]">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default MainLayout