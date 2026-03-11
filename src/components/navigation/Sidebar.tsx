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

    const initials = profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'
    const displayName = profile?.name || profile?.email?.split('@')[0] || 'User'

    return (
        <nav className="sidebar">
            {/* ── Logo ── */}
            <div style={{ padding: '4px 20px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 800, color: 'white',
                        fontFamily: 'DM Serif Display, serif',
                        boxShadow: '0 4px 18px rgba(99,102,241,0.4)',
                        letterSpacing: '-0.02em',
                    }}>
                        LL
                    </div>
                    <span style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 400, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        LifeLedger
                    </span>
                </div>
            </div>

            {/* ── Nav items ── */}
            <div style={{ flex: 1, padding: '14px 0', overflowY: 'auto' }}>
                {/* Log Decision CTA */}
                <div style={{ padding: '0 14px', marginBottom: 10 }}>
                    <Link
                        to="/log"
                        className="btn btn-primary btn-full btn-sm"
                        style={{
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            boxShadow: '0 4px 18px rgba(99,102,241,0.3)',
                            justifyContent: 'center',
                            gap: 8,
                        }}
                    >
                        <PlusCircle size={15} /> Log a Decision
                    </Link>
                </div>

                {/* Divider */}
                <div style={{ margin: '10px 14px', borderTop: '1px solid var(--border-subtle)' }} />

                {navItems.filter(i => !i.highlight).map((item) => {
                    const Icon = item.icon
                    const isLocked = item.proOnly && !isPro
                    const isActive = location.pathname === item.to

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={`sidebar-item ${isActive ? 'active' : ''} ${item.proOnly ? 'pro-item' : ''}`}
                        >
                            <Icon size={17} className="sidebar-icon" style={{ flexShrink: 0, transition: 'color 0.18s, transform 0.18s', transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
                            <span style={{ flex: 1, fontSize: '0.875rem' }}>{item.label}</span>
                            {isLocked && (
                                <Lock size={12} style={{ opacity: 0.4, flexShrink: 0 }} />
                            )}
                            {item.proOnly && isPro && (
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: 700, color: 'var(--gold)',
                                    background: 'var(--gold-dim)', border: '1px solid rgba(212,175,55,0.2)',
                                    borderRadius: 100, padding: '1px 6px', letterSpacing: '0.05em',
                                }}>PRO</span>
                            )}
                        </NavLink>
                    )
                })}
            </div>

            {/* ── Bottom user area ── */}
            <div style={{ padding: '14px', borderTop: '1px solid var(--border)' }}>
                {/* User row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                    {/* Avatar with gradient ring */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700, color: 'white',
                            boxShadow: '0 0 0 2px var(--bg-card), 0 0 0 3px rgba(99,102,241,0.4)',
                        }}>
                            {initials}
                        </div>
                    </div>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isPro ? 'var(--gold)' : 'var(--text-muted)', fontWeight: isPro ? 600 : 400 }}>
                            {isPro ? '✦ Pro Member' : 'Free Plan'}
                        </div>
                    </div>
                </div>

                {!isPro && (
                    <Link to="/pricing" className="btn btn-gold btn-sm btn-full" style={{ marginBottom: 8, borderRadius: 10, fontSize: '0.78rem', gap: 6 }}>
                        <Zap size={13} fill="currentColor" /> Upgrade to Pro
                    </Link>
                )}

                <button onClick={signOut} className="btn btn-ghost btn-sm btn-full" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderRadius: 10 }}>
                    <LogOut size={13} /> Sign Out
                </button>
            </div>
        </nav>
    )
}
