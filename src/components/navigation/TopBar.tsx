import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ChevronDown, Settings, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TopBar() {
    const { profile, isPro, signOut } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const initial = profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'
    const displayName = profile?.name || profile?.email?.split('@')[0] || 'User'

    return (
        <header className="topbar">
            {/* Logo (mobile only) */}
            <div className="topbar-logo" style={{ alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 800, color: 'white',
                    fontFamily: 'DM Serif Display, serif',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
                }}>LL</div>
                <span style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 400, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>LifeLedger</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: isPro ? 'var(--gold-dim)' : 'rgba(255,255,255,0.05)', color: isPro ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${isPro ? 'rgba(212,175,55,0.2)' : 'var(--border)'}` }}>
                    {isPro ? 'PRO' : 'FREE'}
                </span>
            </div>

            {/* User menu */}
            <div className="topbar-user" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '7px 14px', cursor: 'pointer', color: 'var(--text-primary)',
                        transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
                >
                    {/* Avatar */}
                    <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.72rem', fontWeight: 700, color: 'white',
                        boxShadow: '0 0 0 2px rgba(99,102,241,0.3)',
                        flexShrink: 0,
                    }}>
                        {initial}
                    </div>
                    <span style={{ fontSize: '0.83rem', fontWeight: 500, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                    </span>
                    <ChevronDown size={13} style={{ opacity: 0.45, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                {menuOpen && (
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 14, padding: 8, minWidth: 190, zIndex: 200,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(20px)',
                        animation: 'fadeIn 0.15s ease',
                    }}>
                        {/* User info header */}
                        <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{displayName}</div>
                            <div style={{ fontSize: '0.72rem', color: isPro ? 'var(--gold)' : 'var(--text-muted)', marginTop: 1 }}>{isPro ? '✦ Pro Member' : 'Free Plan'}</div>
                        </div>

                        <Link to="/settings" onClick={() => setMenuOpen(false)} style={{
                            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                            borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.875rem',
                            textDecoration: 'none', transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Settings size={14} /> Settings
                        </Link>

                        <button onClick={() => { signOut(); setMenuOpen(false) }} style={{
                            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                            borderRadius: 8, color: 'var(--danger)', fontSize: '0.875rem',
                            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.07)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
