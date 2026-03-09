import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { MoodCheckin, Decision } from '../types/database'
import { format, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Heart, Zap, Lock, Sparkles } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { Toast, useToast } from '../components/ui/Toast'

export function MoodTrackerPage() {
    const { user, isPro } = useAuth()
    const { toast, showToast, hideToast } = useToast()
    const [checkins, setCheckins] = useState<MoodCheckin[]>([])
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [loading, setLoading] = useState(true)
    const [todayCheckin, setTodayCheckin] = useState<MoodCheckin | null>(null)
    const [mood, setMood] = useState(5)
    const [energy, setEnergy] = useState(5)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!user || !isPro) { setLoading(false); return }
        const today = new Date().toISOString().split('T')[0]
        const thirtyAgo = subDays(new Date(), 30).toISOString()
        Promise.all([
            supabase.from('mood_checkins').select('*').eq('user_id', user.id).gte('created_at', thirtyAgo).order('created_at'),
            supabase.from('mood_checkins').select('*').eq('user_id', user.id).gte('created_at', today).maybeSingle(),
            supabase.from('decisions').select('*').eq('user_id', user.id),
        ]).then(([all, today, decs]) => {
            setCheckins(all.data || [])
            setTodayCheckin(today.data)
            setDecisions(decs.data || [])
            setLoading(false)
        })
    }, [user, isPro])

    const submit = async () => {
        if (!user) return
        setSaving(true)
        const { data, error } = await supabase.from('mood_checkins').insert({
            user_id: user.id, mood_score: mood, energy_score: energy, created_at: new Date().toISOString()
        }).select().single()
        if (error) showToast('Failed to save check-in', 'error')
        else { setTodayCheckin(data); setCheckins(prev => [...prev, data]) }
        setSaving(false)
    }

    // Correlation: find mood/energy combo for best decisions
    const bestMood = (() => {
        if (decisions.length === 0 || checkins.length === 0) return null
        const topDecisions = decisions.filter(d => d.ai_quality_score && d.ai_quality_score >= 70)
        const correlatedMoods = topDecisions.map(d => {
            const dayOf = d.created_at.split('T')[0]
            return checkins.find(c => c.created_at.startsWith(dayOf))
        }).filter(Boolean) as MoodCheckin[]
        if (correlatedMoods.length === 0) return null
        const avgMood = Math.round(correlatedMoods.reduce((s, c) => s + c.mood_score, 0) / correlatedMoods.length)
        const avgEnergy = Math.round(correlatedMoods.reduce((s, c) => s + c.energy_score, 0) / correlatedMoods.length)
        return { mood: avgMood, energy: avgEnergy }
    })()

    const chartData = checkins.map(c => ({
        date: format(new Date(c.created_at), 'MMM d'),
        Mood: c.mood_score,
        Energy: c.energy_score,
    }))

    if (!isPro) {
        return (
            <div className="page-padding fade-in">
                <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>Mood Tracker</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>Track mood & energy daily, discover when you make your best decisions</p>
                <div style={{ position: 'relative' }}>
                    <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div className="card" style={{ padding: 20 }}>
                                <div style={{ marginBottom: 12 }}><Heart size={20} style={{ color: '#f472b6' }} /></div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>7</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Mood</div>
                            </div>
                            <div className="card" style={{ padding: 20 }}>
                                <div style={{ marginBottom: 12 }}><Zap size={20} style={{ color: 'var(--gold)' }} /></div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold)' }}>8</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Energy</div>
                            </div>
                        </div>
                        <div className="card" style={{ padding: 24, height: 240 }} />
                    </div>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, var(--bg-primary) 70%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 32 }}>
                        <div style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 40px', maxWidth: 400 }}>
                            <Lock size={28} style={{ color: 'var(--gold)', marginBottom: 12 }} />
                            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>Pro Feature</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                                Track your mood and energy daily. Discover the emotional conditions under which you make your best decisions.
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
        <div className="page-padding fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>Mood Tracker</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Last 30 days of mood and energy data</p>
            </div>

            {/* Daily check-in */}
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                {todayCheckin ? (
                    <div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: 16 }}>✅ Today's Mood Logged</h3>
                        <div style={{ display: 'flex', gap: 28 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f472b6' }}>{todayCheckin.mood_score}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mood /10</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold)' }}>{todayCheckin.energy_score}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Energy /10</div>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 12 }}>Come back tomorrow to log again!</p>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: 20 }}>😊 How are you feeling today?</h3>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}><Heart size={14} style={{ display: 'inline', marginRight: 4, color: '#f472b6' }} />Mood</span>
                                <span style={{ fontWeight: 700, color: '#f472b6' }}>{mood}/10</span>
                            </div>
                            <input type="range" min={1} max={10} value={mood} onChange={e => setMood(+e.target.value)} style={{ '--progress': `${(mood - 1) / 9 * 100}%`, accentColor: '#f472b6' } as React.CSSProperties} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}><Zap size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--gold)' }} />Energy</span>
                                <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{energy}/10</span>
                            </div>
                            <input type="range" min={1} max={10} value={energy} onChange={e => setEnergy(+e.target.value)} style={{ '--progress': `${(energy - 1) / 9 * 100}%`, accentColor: '#C9A84C' } as React.CSSProperties} />
                        </div>
                        <button className="btn btn-primary" onClick={submit} disabled={saving}>
                            {saving ? <Spinner size={15} /> : 'Log Today\'s Mood'}
                        </button>
                    </div>
                )}
            </div>

            {/* Correlation insight */}
            {bestMood && (
                <div style={{ background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Zap size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Your highest quality decisions happen when mood is <strong style={{ color: 'var(--gold)' }}>{bestMood.mood}/10</strong> and energy is <strong style={{ color: 'var(--gold)' }}>{bestMood.energy}/10</strong>
                    </p>
                </div>
            )}

            {/* 30-day chart */}
            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: 20 }}>Last 30 Days</h3>
                {chartData.length < 2 ? (
                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Check in daily to see your mood trends
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                            <Line type="monotone" dataKey="Mood" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="Energy" stroke="var(--gold)" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
