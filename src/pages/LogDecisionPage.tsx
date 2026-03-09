import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { analyzeDecision } from '../lib/openai'
import type { Category } from '../types/database'
import { Spinner } from '../components/ui/Spinner'
import { Toast, useToast } from '../components/ui/Toast'
import { Modal } from '../components/ui/Modal'
import { Link, useParams } from 'react-router-dom'
import { Brain, Lock, Zap } from 'lucide-react'

const CATEGORIES: Category[] = ['Career', 'Relationships', 'Health', 'Finance', 'Education', 'Personal']

type TemplateType = 'standard' | 'pros-cons' | '10-10-10' | 'eisenhower'

const TEMPLATES = [
    { id: 'standard', name: 'Standard', desc: 'Free-form reasoning' },
    { id: 'pros-cons', name: 'Pros & Cons', desc: 'List and weight individual factors' },
    { id: '10-10-10', name: '10-10-10 Rule', desc: 'Future-focused perspective' },
    { id: 'eisenhower', name: 'Eisenhower Matrix', desc: 'Urgent vs. Important quadrants' },
]

export function LogDecisionPage() {
    const { user, isPro } = useAuth()
    const navigate = useNavigate()
    const { id: editId } = useParams<{ id: string }>()
    const location = useLocation()
    const { toast, showToast, hideToast } = useToast()

    const [title, setTitle] = useState((location.state as any)?.prefill || '')
    const [category, setCategory] = useState<Category>('Personal')
    const [whatDecided, setWhatDecided] = useState('')
    const [reasoning, setReasoning] = useState('')
    const [alternatives, setAlternatives] = useState('')

    // Template State
    const [template, setTemplate] = useState<TemplateType>('standard')
    const [structuredReasoning, setStructuredReasoning] = useState<any>({
        pros: [{ text: '', weight: 5 }],
        cons: [{ text: '', weight: 5 }],
        t10m: '', t10mo: '', t10y: '',
        urgent: '', important: '', neither: '', both: ''
    })
    const [confidence, setConfidence] = useState(5)
    const [anxiety, setAnxiety] = useState(5)
    const [expectedOutcome, setExpectedOutcome] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [limitModal, setLimitModal] = useState<'decisions' | 'ai' | null>(null)

    // Monthly counts
    const [monthDecisions, setMonthDecisions] = useState(0)
    const [monthAiAnalyses, setMonthAiAnalyses] = useState(0)

    useEffect(() => {
        if (!user) return
        const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
        supabase.from('decisions').select('id, ai_quality_score', { count: 'exact' })
            .eq('user_id', user.id).gte('created_at', start.toISOString())
            .then(({ data }) => {
                setMonthDecisions(data?.length || 0)
                setMonthAiAnalyses(data?.filter(d => d.ai_quality_score !== null).length || 0)
            })
    }, [user])

    useEffect(() => {
        if (!editId || !user) return
        setFetching(true)
        supabase.from('decisions').select('*').eq('id', editId).single()
            .then(({ data, error }) => {
                if (data) {
                    setTitle(data.title)
                    setCategory(data.category)
                    setWhatDecided(data.what_decided)
                    setReasoning(data.reasoning)
                    setAlternatives(data.alternatives_rejected || '')
                    setConfidence(data.confidence_score)
                    setAnxiety(data.anxiety_score)
                    setExpectedOutcome(data.expected_outcome || '')
                } else if (error) {
                    showToast('Could not load decision to edit', 'error')
                }
                setFetching(false)
            })
    }, [editId, user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (!isPro && monthDecisions >= 10) { setLimitModal('decisions'); return }

        setLoading(true)
        try {
            let decisionId = editId

            // Consolidate structured reasoning if not standard
            let finalReasoning = reasoning
            if (template === 'pros-cons') {
                finalReasoning = `PROS:\n${structuredReasoning.pros.map((p: any) => `- ${p.text} (Weight: ${p.weight}/10)`).join('\n')}\n\nCONS:\n${structuredReasoning.cons.map((c: any) => `- ${c.text} (Weight: ${c.weight}/10)`).join('\n')}`
            } else if (template === '10-10-10') {
                finalReasoning = `How I will feel in 10 minutes: ${structuredReasoning.t10m}\nHow I will feel in 10 months: ${structuredReasoning.t10mo}\nHow I will feel in 10 years: ${structuredReasoning.t10y}`
            } else if (template === 'eisenhower') {
                finalReasoning = `Urgent & Important: ${structuredReasoning.both}\nImportant (Not Urgent): ${structuredReasoning.important}\nUrgent (Not Important): ${structuredReasoning.urgent}\nNeither: ${structuredReasoning.neither}`
            }

            const decisionData = {
                user_id: user.id,
                title,
                category,
                what_decided: whatDecided,
                reasoning: finalReasoning,
                alternatives_rejected: alternatives,
                confidence_score: confidence,
                anxiety_score: anxiety,
                expected_outcome: expectedOutcome,
            }

            if (editId) {
                // Update existing
                const { error } = await supabase.from('decisions').update(decisionData).eq('id', editId)
                if (error) throw error
            } else {
                // Insert new
                const { data: decision, error } = await supabase.from('decisions').insert({
                    ...decisionData,
                    created_at: new Date().toISOString(),
                }).select().single()
                if (error) throw error
                decisionId = decision.id
            }

            // AI analysis
            let analysis = null
            if (!isPro && monthAiAnalyses >= 3 && !editId) { // Only count towards limit on new creations if not pro
                setLimitModal('ai')
                navigate(`/decision/${decisionId}`)
                return
            }

            try {
                analysis = await analyzeDecision({
                    title, category, what_decided: whatDecided,
                    reasoning, alternatives_rejected: alternatives,
                    confidence_score: confidence, anxiety_score: anxiety,
                    expected_outcome: expectedOutcome,
                })

                await supabase.from('decisions').update({
                    ai_analysis: analysis.verdict,
                    ai_bias_detected: analysis.biases_detected,
                    ai_devil_advocate: analysis.devil_advocate,
                    ai_quality_score: analysis.quality_score,
                }).eq('id', decisionId)
            } catch (aiError) {
                console.error('AI analysis failed:', aiError)
                showToast('Decision saved! AI analysis will retry shortly.', 'info')
            }

            navigate(`/decision/${decisionId}`)
        } catch (err: any) {
            showToast(err.message || 'Failed to save decision', 'error')
        }
        setLoading(false)
    }

    if (fetching) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={30} /></div>

    return (
        <div className="page-padding fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            {/* Limit modals */}
            <Modal isOpen={limitModal === 'decisions'} onClose={() => setLimitModal(null)} title="Monthly Limit Reached">
                <div style={{ textAlign: 'center' }}>
                    <Lock size={40} style={{ color: 'var(--gold)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                        Free accounts can log 10 decisions per month. You've reached your limit.
                        Upgrade to <strong style={{ color: 'var(--gold)' }}>Pro</strong> for unlimited decisions, unlimited AI analysis, and full history.
                    </p>
                    <Link to="/pricing" className="btn btn-gold btn-full"><Zap size={16} /> Upgrade to Pro — Rs 349/mo</Link>
                </div>
            </Modal>

            <Modal isOpen={limitModal === 'ai'} onClose={() => setLimitModal(null)} title="AI Analysis Limit Reached">
                <div style={{ textAlign: 'center' }}>
                    <Brain size={40} style={{ color: 'var(--gold)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                        Free accounts get 3 AI analyses per month. Your decision was saved, but upgrade to <strong style={{ color: 'var(--gold)' }}>Pro</strong> for unlimited AI analysis.
                    </p>
                    <Link to="/pricing" className="btn btn-gold btn-full"><Zap size={16} /> Upgrade for Unlimited AI</Link>
                </div>
            </Modal>

            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>
                    {editId ? 'Edit Decision' : 'Log a Decision'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    The more detail you provide, the better your AI analysis will be.
                </p>
                {!isPro && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        Decisions this month: <strong style={{ color: monthDecisions >= 10 ? 'var(--danger)' : 'var(--text-primary)' }}>{monthDecisions}/10</strong> ·
                        AI analyses: <strong style={{ color: monthAiAnalyses >= 3 ? 'var(--danger)' : 'var(--text-primary)' }}>{monthAiAnalyses}/3</strong>
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Decision Title *</label>
                        <input
                            className="input"
                            placeholder="e.g. Accept the job offer at TechCorp"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                    <label className="input-label" style={{ marginBottom: 12, display: 'block' }}>Category *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                style={{
                                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                                    background: category === cat ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                    border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                                    color: category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontSize: '0.85rem', fontWeight: category === cat ? 600 : 400, transition: 'all 0.2s',
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Decision details */}
                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="input-label">What did you decide? *</label>
                        <textarea className="input" placeholder="Describe exactly what you've decided to do..." value={whatDecided} onChange={e => setWhatDecided(e.target.value)} required />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label className="input-label">Decision Framework</label>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                            {TEMPLATES.map(t => {
                                const isLocked = t.id !== 'standard' && !isPro
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            if (isLocked) {
                                                setLimitModal('ai') // Reusing AI modal as it's a "Pro" modal, or I can refine later
                                            } else {
                                                setTemplate(t.id as TemplateType)
                                            }
                                        }}
                                        style={{
                                            flex: 1, minWidth: 120, padding: '10px', borderRadius: 10, cursor: 'pointer',
                                            background: template === t.id ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                            border: `1px solid ${template === t.id ? 'var(--accent)' : 'var(--border)'}`,
                                            textAlign: 'left', transition: 'all 0.2s',
                                            position: 'relative',
                                            opacity: isLocked ? 0.7 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: template === t.id ? 'var(--accent)' : 'var(--text-primary)' }}>{t.name}</div>
                                            {isLocked && <Lock size={12} style={{ color: 'var(--gold)' }} />}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.desc}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {template === 'standard' && (
                        <div className="form-group">
                            <label className="input-label">Why did you decide this? *</label>
                            <textarea className="input" placeholder="What's your reasoning? What factors influenced this decision?" value={reasoning} onChange={e => setReasoning(e.target.value)} required />
                        </div>
                    )}

                    {template === 'pros-cons' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                            <div>
                                <label className="input-label">Pros</label>
                                {structuredReasoning.pros.map((p: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <input className="input" placeholder="Pro..." value={p.text} onChange={e => {
                                            const newPros = [...structuredReasoning.pros]; newPros[i].text = e.target.value; setStructuredReasoning({ ...structuredReasoning, pros: newPros })
                                        }} />
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStructuredReasoning({ ...structuredReasoning, pros: [...structuredReasoning.pros, { text: '', weight: 5 }] })}>+ Add Pro</button>
                            </div>
                            <div>
                                <label className="input-label">Cons</label>
                                {structuredReasoning.cons.map((c: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <input className="input" placeholder="Con..." value={c.text} onChange={e => {
                                            const newCons = [...structuredReasoning.cons]; newCons[i].text = e.target.value; setStructuredReasoning({ ...structuredReasoning, cons: newCons })
                                        }} />
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStructuredReasoning({ ...structuredReasoning, cons: [...structuredReasoning.cons, { text: '', weight: 5 }] })}>+ Add Con</button>
                            </div>
                        </div>
                    )}

                    {template === '10-10-10' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                            <div>
                                <label className="input-label">How will I feel in 10 minutes?</label>
                                <textarea className="input" style={{ minHeight: 60 }} value={structuredReasoning.t10m} onChange={e => setStructuredReasoning({ ...structuredReasoning, t10m: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">How will I feel in 10 months?</label>
                                <textarea className="input" style={{ minHeight: 60 }} value={structuredReasoning.t10mo} onChange={e => setStructuredReasoning({ ...structuredReasoning, t10mo: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">How will I feel in 10 years?</label>
                                <textarea className="input" style={{ minHeight: 60 }} value={structuredReasoning.t10y} onChange={e => setStructuredReasoning({ ...structuredReasoning, t10y: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {template === 'eisenhower' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            <div>
                                <label className="input-label" style={{ color: 'var(--danger)' }}>Urgent & Important</label>
                                <textarea className="input" style={{ minHeight: 60 }} value={structuredReasoning.both} onChange={e => setStructuredReasoning({ ...structuredReasoning, both: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label" style={{ color: 'var(--accent)' }}>Important (Not Urgent)</label>
                                <textarea className="input" style={{ minHeight: 60 }} value={structuredReasoning.important} onChange={e => setStructuredReasoning({ ...structuredReasoning, important: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label" style={{ color: 'var(--warning)' }}>Urgent (Not Important)</label>
                                <textarea className="input" style={{ minHeight: 60 }} value={structuredReasoning.urgent} onChange={e => setStructuredReasoning({ ...structuredReasoning, urgent: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label" style={{ color: 'var(--text-muted)' }}>Neither</label>
                                <textarea className="input" style={{ minHeight: 60 }} value={structuredReasoning.neither} onChange={e => setStructuredReasoning({ ...structuredReasoning, neither: e.target.value })} />
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">What alternatives did you reject?</label>
                        <textarea className="input" placeholder="What other options did you consider? Why did you rule them out?" value={alternatives} onChange={e => setAlternatives(e.target.value)} />
                    </div>
                </div>

                {/* Sliders */}
                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <label className="input-label" style={{ marginBottom: 0 }}>How confident do you feel?</label>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{confidence}/10</span>
                        </div>
                        <input
                            type="range" min={1} max={10} value={confidence}
                            onChange={e => setConfidence(+e.target.value)}
                            style={{ '--progress': `${(confidence - 1) / 9 * 100}%` } as React.CSSProperties}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            <span>Uncertain</span><span>Certain</span>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <label className="input-label" style={{ marginBottom: 0 }}>How anxious do you feel?</label>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f472b6' }}>{anxiety}/10</span>
                        </div>
                        <input
                            type="range" min={1} max={10} value={anxiety}
                            onChange={e => setAnxiety(+e.target.value)}
                            style={{ '--progress': `${(anxiety - 1) / 9 * 100}%`, accentColor: '#f472b6' } as React.CSSProperties}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            <span>Calm</span><span>Anxious</span>
                        </div>
                    </div>
                </div>

                {/* Expected outcome */}
                <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">What outcome do you expect?</label>
                        <textarea className="input" placeholder="What do you hope or expect to happen as a result of this decision?" value={expectedOutcome} onChange={e => setExpectedOutcome(e.target.value)} />
                    </div>
                </div>

                {/* AI indicator */}
                <div style={{
                    background: 'var(--accent-dim)', border: '1px solid rgba(79,142,247,0.2)',
                    borderRadius: 10, padding: '14px 18px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 12
                }}>
                    <Brain size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>AI Analysis included</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Mistral AI will analyze your reasoning quality, detect cognitive biases, and challenge your decision.
                            {!isPro && ` (${3 - monthAiAnalyses} analyses remaining this month)`}
                        </p>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? (
                        <><Spinner size={18} /> Analyzing with AI...</>
                    ) : (
                        <><Brain size={18} /> Save & Analyze Decision</>
                    )}
                </button>
            </form>
        </div>
    )
}
