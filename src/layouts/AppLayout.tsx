import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { BottomNav } from '../components/navigation/BottomNav'
import { TopBar } from '../components/navigation/TopBar'

export function AppLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopBar />
                <main style={{ flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
            <BottomNav />
        </div>
    )
}
