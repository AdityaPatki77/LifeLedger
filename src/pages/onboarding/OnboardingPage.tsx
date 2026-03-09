import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, ChevronRight, Zap } from 'lucide-react'
import { Spinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'

const AGE_RANGES = ['Under 18', '18–24', '25–34', '35–44', '45+']
const LIFE_AREAS = ['Career', 'Relationships', 'Health', 'Finance', 'Personal Growth', 'All of the above']

export function OnboardingPage() {
    const { user, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [ageRange, setAgeRange] = useState('')
    const [lifeArea, setLifeArea] = useState('')
    const [firstDecision, setFirstDecision] = useState('')
    const [loading, setLoading] = useState(false)
    const { showToast } = useToast()

    const handleFinish = async () => {
        if (!user) return
        setLoading(true)
        const trialStart = new Date().toISOString()
        const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        const { error } = await supabase.from('users').update({
            age_range: ageRange,
            trial_started_at: trialStart,
            pro_expires_at: trialEnd,
        }).eq('id', user.id)

        if (error) {
            console.error(error)
            showToast('Failed to save profile: ' + error.message, 'error')
            setLoading(false)
            return
        }

        await refreshProfile()
        setLoading(false)

        if (firstDecision.trim()) {
            navigate('/log', { state: { prefill: firstDecision } })
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
            <div style={{ width: '100%', maxWidth: 520 }} className="fade-in">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                        <Zap size={20} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem' }}>LifeLedger</span>
                    </div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: 8 }}>Quick setup</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>3 questions to personalize your experience</p>

                    {/* Progress */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className={`progress-step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                                    {step > s ? <CheckCircle size={14} /> : s}
                                </div>
                                {s < 3 && <div style={{ width: 40, height: 1, background: step > s ? 'var(--success)' : 'var(--border)' }} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: 36 }}>
                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="fade-in">
                            <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8, fontSize: '1.4rem' }}>
                                What's your age range?
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                                Helps us tailor insights to your life stage.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {AGE_RANGES.map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setAgeRange(range)}
                                        style={{
                                            padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                                            background: ageRange === range ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                            border: `1px solid ${ageRange === range ? 'var(--accent)' : 'var(--border)'}`,
                                            color: ageRange === range ? 'var(--accent)' : 'var(--text-secondary)',
                                            fontWeight: ageRange === range ? 600 : 400,
                                            fontSize: '0.9rem', transition: 'all 0.2s',
                                        }}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="btn btn-primary btn-full"
                                style={{ marginTop: 24 }}
                                disabled={!ageRange}
                                onClick={() => setStep(2)}
                            >
                                Continue <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="fade-in">
                            <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8, fontSize: '1.4rem' }}>
                                What area of life do you most want to track?
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                                We'll highlight insights in this area first.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {LIFE_AREAS.map(area => (
                                    <button
                                        key={area}
                                        onClick={() => setLifeArea(area)}
                                        style={{
                                            padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                                            background: lifeArea === area ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                            border: `1px solid ${lifeArea === area ? 'var(--accent)' : 'var(--border)'}`,
                                            color: lifeArea === area ? 'var(--accent)' : 'var(--text-secondary)',
                                            fontWeight: lifeArea === area ? 600 : 400,
                                            fontSize: '0.875rem', transition: 'all 0.2s', textAlign: 'left',
                                        }}
                                    >
                                        {area}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                                <button className="btn btn-primary btn-full" disabled={!lifeArea} onClick={() => setStep(3)}>
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="fade-in">
                            <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8, fontSize: '1.4rem' }}>
                                What's the biggest decision you're facing right now?
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                                Optional — we'll take you straight to your first decision log.
                            </p>
                            <textarea
                                className="input"
                                style={{ minHeight: 120 }}
                                placeholder="e.g. Should I accept the job offer at the new company?"
                                value={firstDecision}
                                onChange={e => setFirstDecision(e.target.value)}
                            />
                            <div style={{
                                background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)',
                                borderRadius: 8, padding: '10px 14px', marginTop: 12, marginBottom: 20,
                                fontSize: '0.8rem', color: 'var(--gold)'
                            }}>
                                🎁 You're getting a free 7-day Pro trial — unlimited decisions & AI analysis!
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                                <button className="btn btn-primary btn-full" onClick={handleFinish} disabled={loading}>
                                    {loading ? <Spinner size={15} /> : 'Start my journey →'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
