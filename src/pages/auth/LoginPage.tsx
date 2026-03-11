import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Spinner } from '../../components/ui/Spinner'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Brain, TrendingUp, Star } from 'lucide-react'

const HIGHLIGHTS = [
    { icon: Brain,      text: 'AI-powered decision scoring' },
    { icon: TrendingUp, text: 'Pattern intelligence across your life' },
    { icon: Star,       text: 'Multi-stage outcome reflections' },
]

export function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
        else navigate('/dashboard')
        setLoading(false)
    }

    return (
        <div className="auth-layout">
            {/* ── Decorative Left Panel ── */}
            <div className="auth-deco-panel">
                {/* Quote card */}
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 420, textAlign: 'left' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 800, color: 'white',
                            fontFamily: 'DM Serif Display, serif',
                            boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
                        }}>LL</div>
                        <span style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 400, fontSize: '1.3rem', color: 'white', letterSpacing: '-0.02em' }}>LifeLedger</span>
                    </div>

                    {/* Headline */}
                    <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'white', marginBottom: 16, lineHeight: 1.2, fontWeight: 400, letterSpacing: '-0.03em' }}>
                        Every decision shapes<br />
                        <span style={{ background: 'linear-gradient(135deg, #818cf8, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>your destiny.</span>
                    </h2>

                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 52 }}>
                        Track, analyze, and learn from your most important choices. Your cognitive operating system awaits.
                    </p>

                    {/* Feature bullets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {HIGHLIGHTS.map(h => {
                            const Icon = h.icon
                            return (
                                <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <Icon size={15} style={{ color: '#818cf8' }} />
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>{h.text}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Floating metric card */}
                    <div style={{
                        marginTop: 56, padding: '18px 22px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14, backdropFilter: 'blur(12px)'
                    }}>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your clarity, quantified</div>
                        <div style={{ display: 'flex', gap: 28 }}>
                            {[
                                { label: 'Avg. AI Score', value: '8.4', color: '#818cf8' },
                                { label: 'Best Category', value: 'Career', color: '#d4af37' },
                                { label: 'Reflections Due', value: '3', color: '#f472b6' },
                            ].map(m => (
                                <div key={m.label}>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: m.color, fontFamily: 'DM Serif Display, serif' }}>{m.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Form Panel ── */}
            <div className="auth-form-panel">
                <div style={{ width: '100%', maxWidth: 400 }} className="stagger-in">
                    <div style={{ marginBottom: 40 }}>
                        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.4rem', marginBottom: 10, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                            Welcome back
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            The ledger of your life awaits.
                        </p>
                    </div>

                    <div className="card" style={{ padding: 36 }}>
                        {error && (
                            <div style={{
                                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
                                borderRadius: 10, padding: '11px 15px', marginBottom: 20, fontSize: '0.875rem', color: 'var(--danger)'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="input-label">Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type="email"
                                        className="input"
                                        style={{ paddingLeft: 38 }}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="input-label">Password</label>
                                    <Link to="/reset-password" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500 }}>
                                        Forgot?
                                    </Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        className="input"
                                        style={{ paddingLeft: 38, paddingRight: 40 }}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                                    >
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4, gap: 10 }}>
                                {loading ? <Spinner size={16} /> : <>Sign In <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Start free →</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
