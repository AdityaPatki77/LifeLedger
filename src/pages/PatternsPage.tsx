import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { generatePatternInsights } from '../lib/openai'
import type { Decision, Reflection } from '../types/database'
import {
    ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell
} from 'recharts'
import { Sparkles, Brain, Lightbulb, RefreshCw, Lock } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
// Removed ProGate and EmptyState as they are unused

export function PatternsPage() {
    const { user, isPro } = useAuth()
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [reflections, setReflections] = useState<Reflection[]>([])
    const [insights, setInsights] = useState<string[]>([])
    const [personality, setPersonality] = useState('')
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        if (!user || !isPro) { setLoading(false); return }
        Promise.all([
            supabase.from('decisions').select('*').eq('user_id', user.id),
            supabase.from('reflections').select('*').eq('user_id', user.id),
        ]).then(([d, r]) => {
            setDecisions(d.data || [])
            setReflections(r.data || [])
            setLoading(false)
        })
    }, [user, isPro])

    const generateInsights = async () => {
        if (!user) return
        setGenerating(true)
        try {
            const raw = await generatePatternInsights(user.id)
            const parsed = JSON.parse(raw)
            setInsights(parsed.insights || [])
            setPersonality(parsed.personality || '')
        } catch (e) {
            setInsights(['Unable to generate insights at this time. Please try again.'])
        }
        setGenerating(false)
    }

    // Correlation data: confidence at decision time vs happiness at reflection
    const correlationData = reflections.map(r => {
        const dec = decisions.find(d => d.id === r.decision_id)
        if (!dec) return null
        return { confidence: dec.confidence_score, happiness: r.happiness_score, category: dec.category }
    }).filter(Boolean)

    // Category performance table
    const catPerf: Record<string, number[]> = {}
    reflections.forEach(r => {
        const dec = decisions.find(d => d.id === r.decision_id)
        if (dec) {
            if (!catPerf[dec.category]) catPerf[dec.category] = []
            catPerf[dec.category].push(r.happiness_score)
        }
    })
    const catTable = Object.entries(catPerf).map(([cat, scores]) => ({
        category: cat,
        count: scores.length,
        avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
    })).sort((a, b) => +b.avg - +a.avg)

    const CAT_COLORS: Record<string, string> = {
        Career: '#818cf8', Relationships: '#f472b6', Health: '#4ade80',
        Finance: '#C9A84C', Education: '#fb923c', Personal: '#4F8EF7'
    }

    if (!isPro) {
        return (
            <div className="page-padding fade-in">
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>Pattern Intelligence</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Discover what actually makes you happy</p>
                </div>
                <div style={{ position: 'relative' }}>
                    {/* Blurred preview content */}
                    <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            {['You make better decisions when confidence is above 7', 'Career decisions avg happiness: 8.2', 'Quick decisions tend to make you happier', 'Your anxiety rarely affects long-term outcomes'].map((text, i) => (
                                <div key={i} className="card" style={{ padding: 20 }}>
                                    <Lightbulb size={16} style={{ color: 'var(--gold)', marginBottom: 8 }} />
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="card" style={{ padding: 24, height: 200 }} />
                    </div>
                    {/* Gate overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, transparent 10%, var(--bg-primary) 70%)',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 32,
                    }}>
                        <div style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 40px', maxWidth: 400 }}>
                            <Lock size={28} style={{ color: 'var(--gold)', marginBottom: 12 }} />
                            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Pro Feature</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                                Unlock AI-powered patterns across all your decisions. Discover your decision personality and what truly makes you happy.
                            </p>
                            <Link to="/pricing" className="btn btn-gold btn-full"><Sparkles size={16} /> Upgrade to Pro — Rs 349/mo</Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={28} /></div>

    return (
        <div className="page-padding fade-in">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>Pattern Intelligence</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI insights based on {decisions.length} decisions and {reflections.length} reflections</p>
                </div>
                <button className="btn btn-primary" onClick={generateInsights} disabled={generating}>
                    {generating ? <Spinner size={15} /> : <><RefreshCw size={15} /> Generate Insights</>}
                </button>
            </div>

            {/* Insights cards */}
            {insights.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {insights.map((insight, i) => (
                        <div key={i} className="card" style={{ padding: 20, borderColor: 'rgba(201,168,76,0.2)' }}>
                            <Lightbulb size={18} style={{ color: 'var(--gold)', marginBottom: 10 }} />
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{insight}</p>
                        </div>
                    ))}
                </div>
            )}

            {insights.length === 0 && reflections.length === 0 && (
                <div className="card" style={{ padding: 32, marginBottom: 20, textAlign: 'center' }}>
                    <Brain size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Complete some reflections to unlock pattern insights.</p>
                    <button className="btn btn-primary" onClick={generateInsights} disabled={generating}>
                        {generating ? <Spinner size={15} /> : 'Generate Demo Insights'}
                    </button>
                </div>
            )}

            {/* Decision Personality */}
            {personality && (
                <div className="card" style={{ padding: 24, marginBottom: 20, borderColor: 'rgba(79,142,247,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Brain size={18} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Your Decision Personality</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{personality}</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>
                {/* Correlation Chart */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: 16 }}>
                        Confidence vs Happiness
                    </h3>
                    {correlationData.length < 2 ? (
                        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                            Need more reflections to show correlation
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <ScatterChart>
                                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                                <XAxis dataKey="confidence" name="Confidence" domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} label={{ value: 'Confidence at Decision', position: 'bottom', fill: 'var(--text-muted)', fontSize: 11 }} />
                                <YAxis dataKey="happiness" name="Happiness" domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} label={{ value: 'Happiness Later', angle: -90, position: 'left', fill: 'var(--text-muted)', fontSize: 11 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                <Scatter data={correlationData}>
                                    {correlationData.map((entry, i) => (
                                        <Cell key={i} fill={CAT_COLORS[(entry as any).category] || 'var(--accent)'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Category Performance Table */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: 16 }}>Category Performance</h3>
                    {catTable.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No reflected decisions yet</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Category', 'Decisions', 'Avg ⭐'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {catTable.map(row => (
                                    <tr key={row.category}>
                                        <td style={{ padding: '10px 8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: CAT_COLORS[row.category], fontWeight: 600 }}>{row.category}</span>
                                        </td>
                                        <td style={{ padding: '10px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{row.count}</td>
                                        <td style={{ padding: '10px 8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)' }}>{row.avg}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
