import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Decision, Reflection } from '../types/database'
import { useAuth } from '../context/AuthContext'
import { format, differenceInDays } from 'date-fns'
import { ArrowLeft, Brain, AlertCircle, Swords, Award, Edit, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { Toast, useToast } from '../components/ui/Toast'
import { getCategoryStyle, getReflectionDueDates, formatReflectionLabel } from '../lib/utils'

function CircularScore({ score }: { score: number }) {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="100" height="100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>{score}</text>
            </svg>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quality Score</span>
        </div>
    )
}

const REFLECTION_TYPES = ['1month', '3month', '6month', '1year'] as const

export function DecisionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user: _user } = useAuth()
    const { toast, hideToast } = useToast()
    const [decision, setDecision] = useState<Decision | null>(null)
    const [reflections, setReflections] = useState<Reflection[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Outcome tracking state
    const [isResolving, setIsResolving] = useState(false)
    const [outcomeText, setOutcomeText] = useState('')
    const [successScore, setSuccessScore] = useState(5)
    const [savingOutcome, setSavingOutcome] = useState(false)

    useEffect(() => {
        if (!id) return
        async function load() {
            const [d, r] = await Promise.all([
                supabase.from('decisions').select('*').eq('id', id).single(),
                supabase.from('reflections').select('*').eq('decision_id', id).order('created_at'),
            ])
            setDecision(d.data)
            setReflections(r.data || [])
            setLoading(false)
        }
        load()
    }, [id])

    const handleDelete = async () => {
        if (!id) return
        setDeleting(true)
        await supabase.from('reflections').delete().eq('decision_id', id)
        await supabase.from('decisions').delete().eq('id', id)
        navigate('/journal')
    }

    const handleResolve = async () => {
        if (!id || !decision) return
        setSavingOutcome(true)
        const { data, error } = await supabase.from('decisions').update({
            is_resolved: true,
            final_outcome: outcomeText,
            success_score: successScore,
            resolved_at: new Date().toISOString()
        }).eq('id', id).select().single()

        if (error) {
            console.error('Error resolving decision:', error)
        } else {
            setDecision(data)
            setIsResolving(false)
        }
        setSavingOutcome(false)
    }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={28} /></div>
    if (!decision) return <div className="page-padding"><p>Decision not found.</p></div>

    const dueDates = getReflectionDueDates(decision.created_at)
    // Removed unused daysSince

    return (
        <div className="page-padding fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            {/* Delete modal */}
            <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Decision">
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Are you sure you want to delete "<strong>{decision.title}</strong>"? This will also delete all reflections. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => setDeleteModal(false)}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? <Spinner size={14} /> : <><Trash2 size={14} /> Delete</>}
                    </button>
                </div>
            </Modal>

            {/* Back + actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <Link to="/journal" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <ArrowLeft size={16} /> Back to Journal
                </Link>
                <div style={{ display: 'flex', gap: 8 }}>
                    {!decision.is_resolved && !isResolving && (
                        <button className="btn btn-primary btn-sm" onClick={() => setIsResolving(true)}>
                            <CheckCircle2 size={14} /> Resolve
                        </button>
                    )}
                    <Link to={`/decision/${id}/edit`} className="btn btn-secondary btn-sm"><Edit size={14} /> Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(true)}><Trash2 size={14} /></button>
                </div>
            </div>

            {/* Header */}
            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span className={`badge ${getCategoryStyle(decision.category)}`}>{decision.category}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {format(new Date(decision.created_at), 'MMMM d, yyyy')}
                            </span>
                        </div>
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', marginBottom: 16 }}>
                            {decision.title}
                        </h1>
                        <div style={{ display: 'flex', gap: 20 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{decision.confidence_score}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Confidence</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f472b6' }}>{decision.anxiety_score}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Anxiety</div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="divider" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What I decided</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{decision.what_decided}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>My reasoning</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{decision.reasoning}</p>
                    </div>
                    {decision.alternatives_rejected && (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alternatives rejected</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{decision.alternatives_rejected}</p>
                        </div>
                    )}
                    {decision.expected_outcome && (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected outcome</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{decision.expected_outcome}</p>
                        </div>
                    )}
                </div>

                {/* Outcome Form / View */}
                {isResolving ? (
                    <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-elevated)', border: '1px solid var(--accent)', borderRadius: 12 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: 16 }}>Resolve Decision</h3>
                        <div className="form-group">
                            <label className="input-label">Actual Outcome</label>
                            <textarea
                                className="input"
                                value={outcomeText}
                                onChange={e => setOutcomeText(e.target.value)}
                                placeholder="What actually happened? Was it the right call?"
                                style={{ minHeight: 120 }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Success Score: {successScore}/10</label>
                            <input
                                type="range" min={1} max={10} value={successScore}
                                onChange={e => setSuccessScore(+e.target.value)}
                                style={{ '--progress': `${(successScore - 1) / 9 * 100}%` } as any}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setIsResolving(false)}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleResolve} disabled={savingOutcome}>
                                {savingOutcome ? <Spinner size={14} /> : 'Save Outcome'}
                            </button>
                        </div>
                    </div>
                ) : decision.is_resolved ? (
                    <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-elevated)', border: '1px solid var(--gold-dim)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', margin: 0 }}>Final Outcome</h3>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)' }}>⭐ {decision.success_score}/10</div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Success Score</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{decision.final_outcome}</p>
                        <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Resolved on {format(new Date(decision.resolved_at!), 'MMMM d, yyyy')}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* AI Analysis */}
            {decision.ai_quality_score !== null ? (
                <div className="card" style={{ padding: 28, marginBottom: 16, borderColor: 'rgba(79,142,247,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <Brain size={20} style={{ color: 'var(--accent)' }} />
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', margin: 0 }}>AI Analysis</h2>
                        <span className="badge badge-blue">Mistral AI</span>
                    </div>

                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <CircularScore score={decision.ai_quality_score} />

                        <div style={{ flex: 1, minWidth: 260 }}>
                            {/* Verdict */}
                            {decision.ai_analysis && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        <Award size={15} style={{ color: 'var(--accent)' }} />
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>AI Verdict</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{decision.ai_analysis}</p>
                                </div>
                            )}

                            {/* Biases */}
                            {decision.ai_bias_detected && decision.ai_bias_detected.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        <AlertCircle size={15} style={{ color: 'var(--warning)' }} />
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Cognitive Biases Detected</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {decision.ai_bias_detected.map(bias => (
                                            <span key={bias} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {bias}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Devil's advocate */}
                    {decision.ai_devil_advocate && (
                        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '14px 16px', marginTop: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <Swords size={15} style={{ color: 'var(--danger)' }} />
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Devil's Advocate</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{decision.ai_devil_advocate}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card" style={{ padding: 24, marginBottom: 16, borderStyle: 'dashed' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Brain size={20} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>AI analysis not available for this decision.</span>
                    </div>
                </div>
            )}

            {/* Reflection Timeline */}
            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: 20 }}>Reflection Timeline</h2>
                <div className="timeline">
                    {REFLECTION_TYPES.map((type) => {
                        const dueDate = dueDates[type]
                        const daysUntil = differenceInDays(dueDate, new Date())
                        const isDue = daysUntil <= 0
                        const existing = reflections.find(r => r.reflection_type === type)
                        // Removed unused isNext

                        return (
                            <div key={type} className="timeline-item">
                                <div className={`timeline-dot ${existing ? 'done' : isDue ? 'active' : ''}`} />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                                            {formatReflectionLabel(type)} Reflection
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {existing
                                                ? `Completed ${format(new Date(existing.created_at), 'MMM d, yyyy')}`
                                                : isDue
                                                    ? 'Due now'
                                                    : `Due ${format(dueDate, 'MMM d, yyyy')} (${daysUntil} days)`
                                            }
                                        </div>
                                    </div>
                                    {existing ? (
                                        <span className="badge badge-green"><CheckCircle2 size={10} /> Done · {existing.happiness_score}/10</span>
                                    ) : isDue ? (
                                        <Link to={`/reflect/${decision.id}/${type}`} className="btn btn-primary btn-sm">
                                            Reflect Now
                                        </Link>
                                    ) : (
                                        <span className="badge badge-muted"><Clock size={10} /> Upcoming</span>
                                    )}
                                </div>

                                {/* Show filled reflection */}
                                {existing && (
                                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginTop: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Happiness</span>
                                            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>⭐ {existing.happiness_score}/10</span>
                                        </div>
                                        {existing.actual_outcome && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}><strong>What happened:</strong> {existing.actual_outcome}</p>}
                                        {existing.reflection_text && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Reflection:</strong> {existing.reflection_text}</p>}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
