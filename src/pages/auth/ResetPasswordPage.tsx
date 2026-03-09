import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Spinner } from '../../components/ui/Spinner'
import { Zap, Mail, CheckCircle } from 'lucide-react'

export function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        })
        if (error) setError(error.message)
        else setSent(true)
        setLoading(false)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 400 }} className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Zap size={24} style={{ color: 'white' }} />
                    </div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: 8 }}>Reset password</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We'll send you a reset link</p>
                </div>

                <div className="card" style={{ padding: 32 }}>
                    {sent ? (
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircle size={40} style={{ color: 'var(--success)', marginBottom: 16 }} />
                            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Check your inbox</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>We've sent a password reset link to <strong>{email}</strong></p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.875rem', color: 'var(--danger)' }}>
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleReset}>
                                <div className="form-group">
                                    <label className="input-label">Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="email" className="input" style={{ paddingLeft: 36 }} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? <Spinner size={16} /> : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Link to="/login" style={{ color: 'var(--accent)' }}>← Back to sign in</Link>
                </p>
            </div>
        </div>
    )
}
