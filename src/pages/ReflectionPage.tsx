import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Decision } from '../types/database'
import { useAuth } from '../context/AuthContext'
import { format, differenceInMonths } from 'date-fns'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { Toast, useToast } from '../components/ui/Toast'
import { getCategoryStyle, formatReflectionLabel } from '../lib/utils'

type ReflectionType = '1month' | '3month' | '6month' | '1year'

export function ReflectionPage() {
    const { decisionId, type } = useParams<{ decisionId: string; type: ReflectionType }>()
    const { user } = useAuth()
    // Removed navigate
    const { toast, showToast, hideToast } = useToast()

    const [decision, setDecision] = useState<Decision | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [happiness, setHappiness] = useState(5)
    const [actualOutcome, setActualOutcome] = useState('')
    const [reflectionText, setReflectionText] = useState('')

    useEffect(() => {
        if (!decisionId) return
        supabase.from('decisions').select('*').eq('id', decisionId).single()
            .then(({ data }) => { setDecision(data); setLoading(false) })
    }, [decisionId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !decision) return
        setSaving(true)
        const { error } = await supabase.from('reflections').insert({
            decision_id: decisionId,
            user_id: user.id,
            reflection_type: type,
            happiness_score: happiness,
            reflection_text: reflectionText,
            actual_outcome: actualOutcome,
            created_at: new Date().toISOString(),
        })
        if (error) {
            showToast('Failed to save reflection: ' + error.message, 'error')
        } else {
            setSubmitted(true)
        }
        setSaving(false)
    }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={28} /></div>
    if (!decision) return <div className="page-padding"><p>Decision not found.</p></div>

    const monthsAgo = differenceInMonths(new Date(), new Date(decision.created_at))

    return (
        <div className="page-padding fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            <Link to={`/decision/${decisionId}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                <ArrowLeft size={16} /> Back to Decision
            </Link>

            {submitted ? (
                <div className="card fade-in" style={{ padding: 48, textAlign: 'center' }}>
                    <CheckCircle2 size={56} style={{ color: 'var(--success)', margin: '0 auto 20px' }} />
                    <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Reflection saved!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
                        Your happiness score of <strong style={{ color: 'var(--gold)' }}>{happiness}/10</strong> has been recorded.
                        These reflections will help reveal what truly makes you happy.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
                        <Link to={`/decision/${decisionId}`} className="btn btn-primary">View Decision</Link>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ marginBottom: 28 }}>
                        <span className="badge badge-blue" style={{ marginBottom: 10 }}>{formatReflectionLabel(type as string)} Reflection</span>
                        <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>
                            It's been {monthsAgo} month{monthsAgo !== 1 ? 's' : ''}. How did this go?
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Honest reflection is how you discover what actually makes you happy.</p>
                    </div>

                    {/* Original decision reminder */}
                    <div style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '16px 20px', marginBottom: 24
                    }}>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                            Your original decision — {format(new Date(decision.created_at), 'MMMM d, yyyy')}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span className={`badge ${getCategoryStyle(decision.category)}`}>{decision.category}</span>
                            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>{decision.title}</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}><strong>Decided:</strong> {decision.what_decided}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Expected:</strong> {decision.expected_outcome || 'Not specified'}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Happiness slider */}
                        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>How happy are you with this decision?</h3>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: happiness >= 7 ? 'var(--success)' : happiness >= 4 ? 'var(--warning)' : 'var(--danger)' }}>
                                    {happiness}/10
                                </span>
                            </div>
                            <input
                                type="range" min={1} max={10} value={happiness}
                                onChange={e => setHappiness(+e.target.value)}
                                style={{ '--progress': `${(happiness - 1) / 9 * 100}%` } as React.CSSProperties}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                                <span>😞 Regret it</span>
                                <span>😐 Neutral</span>
                                <span>😊 Love it</span>
                            </div>
                        </div>

                        {/* What actually happened */}
                        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">What actually happened?</label>
                                <textarea
                                    className="input" style={{ minHeight: 110 }}
                                    placeholder="Describe the actual outcome — what happened as a result of this decision?"
                                    value={actualOutcome} onChange={e => setActualOutcome(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Would you do differently */}
                        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">What would you have done differently?</label>
                                <textarea
                                    className="input" style={{ minHeight: 100 }}
                                    placeholder="In hindsight, what would you have changed about the decision or how you made it?"
                                    value={reflectionText} onChange={e => setReflectionText(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving}>
                            {saving ? <Spinner size={18} /> : 'Save Reflection'}
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}
