import { NavLink, useLocation, Link } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, TrendingUp, Heart,
    Settings, PlusCircle, Lock, Zap, LogOut, Calendar
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function Sidebar() {
    const { profile, isPro, signOut } = useAuth()
    const location = useLocation()

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/log', icon: PlusCircle, label: 'Log Decision', highlight: true },
        { to: '/journal', icon: BookOpen, label: 'Journal' },
        { to: '/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/patterns', icon: TrendingUp, label: 'Patterns', proOnly: true },
        { to: '/mood', icon: Heart, label: 'Mood', proOnly: true },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <nav className="sidebar">
            {/* Logo */}
            <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Zap size={16} style={{ color: 'white' }} />
                    </div>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem' }}>
                        LifeLedger
                    </span>
                </div>
            </div>

            {/* Nav items */}
            <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isLocked = item.proOnly && !isPro
                    const isActive = location.pathname === item.to

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={`sidebar-item ${isActive ? 'active' : ''} ${item.proOnly ? 'pro-item' : ''}`}
                            style={item.highlight ? {
                                margin: '8px 8px',
                                background: isActive ? 'rgba(79,142,247,0.15)' : 'var(--accent-dim)',
                                color: 'var(--accent)',
                                border: '1px solid rgba(79,142,247,0.2)',
                            } : undefined}
                        >
                            <Icon size={18} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {isLocked && <Lock size={13} style={{ opacity: 0.5 }} />}
                        </NavLink>
                    )
                })}
            </div>

            {/* Bottom user area */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 600, color: 'white', flexShrink: 0
                    }}>
                        {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {profile?.name || 'User'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isPro ? 'var(--gold)' : 'var(--text-muted)' }}>
                            {isPro ? '✦ Pro' : 'Free Plan'}
                        </div>
                    </div>
                </div>

                {!isPro && (
                    <Link to="/app/pricing" className="btn btn-gold btn-sm btn-full" style={{ marginBottom: 12, padding: '8px', fontSize: '0.75rem', gap: 6 }}>
                        <Zap size={14} fill="currentColor" /> Upgrade to Pro
                    </Link>
                )}

                <button onClick={signOut} className="btn btn-secondary btn-sm btn-full" style={{ fontSize: '0.75rem' }}>
                    <LogOut size={13} /> Sign Out
                </button>
            </div>
        </nav>
    )
}
