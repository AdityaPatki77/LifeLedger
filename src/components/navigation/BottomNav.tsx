import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Heart, PlusCircle, Lock, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function BottomNav() {
    const { isPro } = useAuth()

    return (
        <nav className="bottom-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/journal" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <BookOpen size={20} />
                <span>Journal</span>
            </NavLink>
            <NavLink to="/log" className="bottom-nav-item log-btn">
                <PlusCircle size={22} />
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Calendar size={20} />
                <span>Calendar</span>
            </NavLink>
            <NavLink to="/mood" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Heart size={20} />
                {!isPro && <Lock size={10} style={{ position: 'absolute', top: 6, right: 10 }} />}
                <span>Mood</span>
            </NavLink>
        </nav>
    )
}
