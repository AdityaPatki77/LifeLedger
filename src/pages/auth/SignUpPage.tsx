import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Spinner } from '../../components/ui/Spinner'
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

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
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', padding: 16
        }}>
            <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--accent), #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <Zap size={24} style={{ color: 'white' }} />
                    </div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 8 }}>
                        Start your journey
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Free forever. No credit card required.
                    </p>
                </div>

                <div className="card" style={{ padding: 32 }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.875rem', color: 'var(--danger)'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp}>
                        <div className="form-group">
                            <label className="input-label">Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" className="input" style={{ paddingLeft: 36 }} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="input-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="email" className="input" style={{ paddingLeft: 36 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="input-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    className="input" style={{ paddingLeft: 36, paddingRight: 36 }}
                                    placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? <Spinner size={16} /> : 'Create Free Account'}
                        </button>
                    </form>

                </div>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}
