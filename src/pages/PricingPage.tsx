import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Check, Sparkles, Zap } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { Toast, useToast } from '../components/ui/Toast'

const FREE_FEATURES = [
    '10 decisions per month',
    '3 AI analyses per month',
    'Last 30 days journal history',
    'Basic dashboard',
]

const PRO_FEATURES = [
    'Unlimited decisions',
    'Unlimited AI analyses',
    'Full visual Calendar history',
    'Advanced Mental Model templates',
    'Enhanced Pattern Intelligence screen',
    'Mood + Energy correlation analysis',
    'Happiness analytics & CSV export',
]

declare global {
    interface Window {
        Razorpay: any
    }
}

export function PricingPage() {
    const { user, profile, isPro, refreshProfile } = useAuth()
    const { toast, showToast, hideToast } = useToast()
    const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)
    const [success, setSuccess] = useState(false)

    const loadRazorpay = () => {
        return new Promise<void>((resolve) => {
            if (window.Razorpay) { resolve(); return }
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve()
            document.body.appendChild(script)
        })
    }

    const handleUpgrade = async (plan: 'monthly' | 'annual') => {
        const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID
        if (!RAZORPAY_KEY || RAZORPAY_KEY === 'rzp_test_your-key-here') {
            showToast('Configure your Razorpay key in .env to enable payments.', 'info')
            return
        }

        setLoading(plan)
        await loadRazorpay()

        const amount = plan === 'monthly' ? 34900 : 299900 // in paise (Rs 349, Rs 2999)
        const description = plan === 'monthly' ? 'LifeLedger Pro — Monthly' : 'LifeLedger Pro — Annual'

        const options = {
            key: RAZORPAY_KEY,
            amount,
            currency: 'INR',
            name: 'LifeLedger',
            description,
            prefill: {
                email: profile?.email || user?.email || '',
                name: profile?.name || '',
            },
            theme: { color: '#4F8EF7' },
            handler: async () => {
                // Payment successful — update user in Supabase
                if (!user) return
                const expiresAt = plan === 'monthly'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

                await supabase.from('users').update({
                    is_pro: true,
                    pro_expires_at: expiresAt,
                }).eq('id', user.id)

                await refreshProfile()
                setSuccess(true)
                showToast('Payment successful! Pro is now active.', 'success')
            },
            modal: {
                ondismiss: () => setLoading(null)
            }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(null)
    }

    return (
        <div className="page-padding fade-in" style={{ maxWidth: 860, margin: '0 auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            {success && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'center' }}>
                    <Sparkles size={28} style={{ color: 'var(--success)', marginBottom: 8 }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--success)', marginBottom: 6 }}>Welcome to Pro!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your Pro plan is now active. Enjoy unlimited decisions and AI analysis!</p>
                </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Simple, honest pricing</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Start free. Upgrade when you're ready to unlock the full power of decision intelligence.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start', maxWidth: 720, margin: '0 auto' }}>
                {/* Free Tier */}
                <div className="card" style={{ padding: 32 }}>
                    <div style={{ marginBottom: 28 }}>
                        <span className="badge badge-muted" style={{ marginBottom: 12 }}>Free</span>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 700, marginBottom: 4 }}>Rs 0</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Forever free</div>
                    </div>
                    <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                        {FREE_FEATURES.map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <Check size={15} style={{ color: 'var(--success)', flexShrink: 0 }} /> {f}
                            </li>
                        ))}
                    </ul>
                    {isPro ? (
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            You're on Pro
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600 }}>
                            ✓ Your current plan
                        </div>
                    )}
                </div>

                {/* Pro Tier */}
                <div className="card" style={{ padding: 32, borderColor: 'rgba(201,168,76,0.3)', background: '#131106', boxShadow: '0 0 40px rgba(201,168,76,0.08)' }}>
                    <div style={{ marginBottom: 28 }}>
                        <span className="badge badge-gold" style={{ marginBottom: 12 }}>✦ Pro</span>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold)', display: 'inline' }}>Rs 349</div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/month</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>or Rs 2,999/year (save Rs 1,189)</div>
                    </div>
                    <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                        {PRO_FEATURES.map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <Check size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} /> {f}
                            </li>
                        ))}
                    </ul>

                    {isPro ? (
                        <div style={{ textAlign: 'center', padding: '12px', borderRadius: 8, background: 'var(--gold-dim)', color: 'var(--gold)', fontSize: '0.875rem', fontWeight: 600 }}>
                            ✦ You're on Pro
                        </div>
                    ) : (
                        <div>
                            <button
                                className="btn btn-gold btn-full"
                                style={{ marginBottom: 10 }}
                                onClick={() => handleUpgrade('monthly')}
                                disabled={loading !== null}
                            >
                                {loading === 'monthly' ? <Spinner size={16} /> : <><Zap size={16} /> Upgrade to Pro</>}
                            </button>
                            <button
                                className="btn btn-secondary btn-full"
                                onClick={() => handleUpgrade('annual')}
                                disabled={loading !== null}
                                style={{ fontSize: '0.8rem' }}
                            >
                                {loading === 'annual' ? <Spinner size={14} /> : 'Or pay annually — Rs 2,999/yr'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
                                Cancel anytime.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Testimonials */}
            <div style={{ marginTop: 60, textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: 32 }}>What our users say</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    {[
                        { quote: "LifeLedger made me realize 80% of my anxiety about decisions disappears when I write them down.", name: "Priya S.", plan: "Pro user" },
                        { quote: "The 6-month reflection feature is mind-blowing. I thought I'd regret my career switch. I don't.", name: "Arjun M.", plan: "Pro user" },
                        { quote: "I discovered that my Finance decisions are always my best ones. Never realized this pattern.", name: "Kavya R.", plan: "Pro user" },
                    ].map((t, i) => (
                        <div key={i} className="card" style={{ padding: 24, textAlign: 'left' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 16 }}>"{t.quote}"</p>
                            <div style={{ fontSize: '0.8rem' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{t.name}</strong>
                                <span style={{ color: 'var(--gold)', marginLeft: 8 }}>✦ {t.plan}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
