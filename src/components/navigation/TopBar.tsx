import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ChevronDown, Settings, LogOut, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TopBar() {
    const { profile, isPro, signOut } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    const planLabel = isPro ? 'Pro' : 'Free'
    const planClass = isPro ? 'badge-gold' : 'badge-muted'

    return (
        <header className="topbar">
            {/* Logo (mobile only — desktop shows sidebar logo) */}
            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Zap size={14} style={{ color: 'white' }} />
                </div>
                <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>LifeLedger</span>
                <span className={`badge ${planClass}`} style={{ fontSize: '0.65rem' }}>{planLabel}</span>
            </div>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--text-primary)',
                    }}
                >
                    <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 600, color: 'white'
                    }}>
                        {profile?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '0.8rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile?.name || profile?.email || 'User'}
                    </span>
                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                </button>

                {menuOpen && (
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 8,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: 8, minWidth: 180, zIndex: 200,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
                    }}>
                        <Link to="/settings" onClick={() => setMenuOpen(false)} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                            borderRadius: 6, color: 'var(--text-secondary)', fontSize: '0.875rem',
                            textDecoration: 'none', transition: 'background 0.2s'
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <Settings size={15} /> Settings
                        </Link>
                        <button onClick={() => { signOut(); setMenuOpen(false) }} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                            borderRadius: 6, color: 'var(--danger)', fontSize: '0.875rem',
                            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                        }}>
                            <LogOut size={15} /> Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
