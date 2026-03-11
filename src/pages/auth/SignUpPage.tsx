import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Spinner } from '../../components/ui/Spinner'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, Clock, BarChart3 } from 'lucide-react'

const PERKS = [
    { icon: CheckCircle, text: 'Free forever — no credit card' },
    { icon: BarChart3,   text: 'Up to 10 decisions/month free' },
    { icon: Clock,       text: 'Automated reflection reminders' },
]

export function SignUpPage() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setLoading(true)
        setError('')
        const { data, error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) { setError(authError.message); setLoading(false); return }

        if (data.user) {
            await supabase.from('users').upsert({
                id: data.user.id,
                email,
                name,
                created_at: new Date().toISOString(),
                is_pro: false,
            })
            navigate('/onboarding')
        }
        setLoading(false)
    }

    return (
        <div className="auth-layout">
            {/* ── Decorative Left Panel ── */}
            <div className="auth-deco-panel">
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

                    <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'white', marginBottom: 16, lineHeight: 1.2, fontWeight: 400, letterSpacing: '-0.03em' }}>
                        Start architecting<br />
                        <span style={{ background: 'linear-gradient(135deg, #818cf8, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>your best decisions.</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 52 }}>
                        Join thousands of high-performers who track and learn from their most important life choices.
                    </p>

                    {/* Perks list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {PERKS.map(p => {
                            const Icon = p.icon
                            return (
                                <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8,
                                        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <Icon size={15} style={{ color: '#34d399' }} />
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>{p.text}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Decorative quote */}
                    <div style={{
                        marginTop: 56, padding: '20px 24px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14, backdropFilter: 'blur(12px)',
                        borderLeft: '3px solid rgba(99,102,241,0.6)'
                    }}>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>
                            "In any moment of decision, the best thing you can do is the right thing. The worst thing you can do is nothing."
                        </p>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>— Theodore Roosevelt</span>
                    </div>
                </div>
            </div>

            {/* ── Form Panel ── */}
            <div className="auth-form-panel">
                <div style={{ width: '100%', maxWidth: 400 }} className="stagger-in">
                    <div style={{ marginBottom: 36 }}>
                        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.3rem', marginBottom: 10, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                            Create your account
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            Free forever. No credit card required.
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

                        <form onSubmit={handleSignUp}>
                            <div className="form-group">
                                <label className="input-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input type="text" className="input" style={{ paddingLeft: 38 }} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="input-label">Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input type="email" className="input" style={{ paddingLeft: 38 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="input-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        className="input" style={{ paddingLeft: 38, paddingRight: 40 }}
                                        placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4, gap: 10 }}>
                                {loading ? <Spinner size={16} /> : <>Create Free Account <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in →</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
