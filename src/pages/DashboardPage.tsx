import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Decision, Reflection, MoodCheckin } from '../types/database'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { PlusCircle, TrendingUp, Star, Clock, CheckCheck, Flame, BarChart2 } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { format, differenceInDays } from 'date-fns'
// Removed getCategoryStyle as it's unused

const COLORS = ['#4F8EF7', '#C9A84C', '#22c55e', '#f472b6', '#fb923c', '#818cf8']

export function DashboardPage() {
    const { user, profile, isPro } = useAuth()
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [reflections, setReflections] = useState<Reflection[]>([])
    const [todayMood, setTodayMood] = useState<MoodCheckin | null>(null)
    const [loading, setLoading] = useState(true)
    const [moodScore, setMoodScore] = useState(5)
    const [energyScore, setEnergyScore] = useState(5)
    const [submittingMood, setSubmittingMood] = useState(false)

    useEffect(() => {
        if (!user) return
        async function load() {
            const [d, r, m] = await Promise.all([
                supabase.from('decisions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
                supabase.from('reflections').select('*').eq('user_id', user!.id),
                supabase.from('mood_checkins').select('*').eq('user_id', user!.id).gte('created_at', new Date().toISOString().split('T')[0]).maybeSingle(),
            ])
            setDecisions(d.data || [])
            setReflections(r.data || [])
            setTodayMood(m.data)
            setLoading(false)
        }
        load()
    }, [user])

    const submitMood = async () => {
        if (!user) return
        setSubmittingMood(true)
        const { data } = await supabase.from('mood_checkins').insert({ user_id: user.id, mood_score: moodScore, energy_score: energyScore, created_at: new Date().toISOString() }).select().single()
        if (data) setTodayMood(data)
        setSubmittingMood(false)
    }

    // Stats
    const totalDecisions = decisions.length
    const avgHappiness = reflections.length
        ? (reflections.reduce((s, r) => s + r.happiness_score, 0) / reflections.length).toFixed(1)
        : null

    // Category distribution
    const catCounts: Record<string, number> = {}
    decisions.forEach(d => { catCounts[d.category] = (catCounts[d.category] || 0) + 1 })
    const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value }))

    // Best category
    const catHappiness: Record<string, number[]> = {}
    reflections.forEach(r => {
        const dec = decisions.find(d => d.id === r.decision_id)
        if (dec) {
            if (!catHappiness[dec.category]) catHappiness[dec.category] = []
            catHappiness[dec.category].push(r.happiness_score)
        }
    })
    let bestCat = ''
    let bestAvg = 0
    Object.entries(catHappiness).forEach(([cat, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        if (avg > bestAvg) { bestAvg = avg; bestCat = cat }
    })

    // Happiness trend chart
    const trendData = reflections
        .slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(r => ({ date: format(new Date(r.created_at), 'MMM d'), happiness: r.happiness_score }))

    // Streak calculation
    const streak = (() => {
        if (decisions.length === 0) return 0
        let s = 0
        const now = new Date()
        const sorted = decisions.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        let lastWeek = Math.floor(differenceInDays(now, new Date(sorted[0].created_at)) / 7)
        if (lastWeek > 1) return 0
        const weeks = new Set(sorted.map(d => Math.floor(differenceInDays(now, new Date(d.created_at)) / 7)))
        for (let i = 0; weeks.has(i); i++) s = i + 1
        return s
    })()

    // Due reflections (decisions without reflections that are >= 30 days old)
    const dueReflections = decisions.filter(d => {
        const daysSince = differenceInDays(new Date(), new Date(d.created_at))
        const existingTypes = reflections.filter(r => r.decision_id === d.id).map(r => r.reflection_type)
        if (daysSince >= 30 && !existingTypes.includes('1month')) return true
        if (daysSince >= 90 && !existingTypes.includes('3month')) return true
        if (daysSince >= 180 && !existingTypes.includes('6month')) return true
        if (daysSince >= 365 && !existingTypes.includes('1year')) return true
        return false
    })

    // Monthly counter for free users
    const thisMonthDecisions = decisions.filter(d => {
        const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
        return new Date(d.created_at) >= start
    }).length

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={28} label="Loading dashboard..." /></div>

    return (
        <div className="page-padding fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
                        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                        {profile?.name?.split(' ')[0] || 'there'} 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your decision intelligence at a glance</p>
                </div>
                <Link to="/log" className="btn btn-primary">
                    <PlusCircle size={16} /> Log a Decision
                </Link>
            </div>

            {/* Free user limit bar */}
            {!isPro && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>Decisions this month: <strong style={{ color: thisMonthDecisions >= 10 ? 'var(--danger)' : 'var(--text-primary)' }}>{thisMonthDecisions}/10</strong></span>
                    </div>
                    <Link to="/pricing" className="btn btn-gold btn-sm">Upgrade to Pro</Link>
                </div>
            )}

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Decisions', value: totalDecisions, icon: BarChart2, color: 'var(--accent)' },
                    { label: 'Avg Happiness', value: avgHappiness ? `${avgHappiness}/10` : '—', icon: Star, color: 'var(--gold)' },
                    { label: 'Week Streak', value: `${streak} wk${streak !== 1 ? 's' : ''}`, icon: Flame, color: '#fb923c' },
                    { label: 'Due Reflections', value: dueReflections.length, icon: Clock, color: dueReflections.length > 0 ? 'var(--warning)' : 'var(--success)' },
                ].map(stat => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${stat.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} style={{ color: stat.color }} />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {stat.label}
                                </span>
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                                {stat.value}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Happiness trend */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Happiness Trend</h3>
                    </div>
                    {trendData.length === 0 ? (
                        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Complete reflections to see your trend
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={trendData}>
                                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                <Line type="monotone" dataKey="happiness" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Category pie */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>By Category</h3>
                    </div>
                    {pieData.length === 0 ? (
                        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Log decisions to see breakdown
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                                    {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Best decision category + mood prompt row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Best category */}
                <div className="card" style={{ padding: 20 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>🏆 Best Decision Category</p>
                    {bestCat ? (
                        <div>
                            <div style={{ fontSize: '1.4rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>
                                {bestCat}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg happiness: {bestAvg.toFixed(1)}/10</p>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Complete reflections to discover your best category</p>
                    )}
                </div>

                {/* Mood check-in */}
                <div className="card" style={{ padding: 20 }}>
                    {!isPro ? (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>😊 Daily Mood Check-in</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <Link to="/pricing" style={{ color: 'var(--gold)' }}>Upgrade to Pro</Link> to track your mood and discover when you make your best decisions.
                            </p>
                        </div>
                    ) : todayMood ? (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>✅ Today's Check-in</p>
                            <div style={{ display: 'flex', gap: 20 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{todayMood.mood_score}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mood</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>{todayMood.energy_score}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Energy</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Check back tomorrow!</p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>😊 How are you feeling today?</p>
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                    <span>Mood</span><span>{moodScore}/10</span>
                                </div>
                                <input type="range" min={1} max={10} value={moodScore} onChange={e => setMoodScore(+e.target.value)} style={{ '--progress': `${(moodScore - 1) / 9 * 100}%` } as React.CSSProperties} />
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                                    <span>Energy</span><span>{energyScore}/10</span>
                                </div>
                                <input type="range" min={1} max={10} value={energyScore} onChange={e => setEnergyScore(+e.target.value)} style={{ '--progress': `${(energyScore - 1) / 9 * 100}%` } as React.CSSProperties} />
                            </div>
                            <button className="btn btn-primary btn-sm btn-full" onClick={submitMood} disabled={submittingMood}>
                                {submittingMood ? <Spinner size={13} /> : 'Log mood'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Due reflections */}
            {dueReflections.length > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Clock size={16} style={{ color: 'var(--warning)' }} />
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', color: 'var(--warning)', margin: 0 }}>
                            {dueReflections.length} reflection{dueReflections.length > 1 ? 's' : ''} due
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {dueReflections.slice(0, 3).map(d => (
                            <Link key={d.id} to={`/decision/${d.id}`} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem',
                                color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                {d.title}
                            </Link>
                        ))}
                        {dueReflections.length > 3 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{dueReflections.length - 3} more</span>}
                    </div>
                </div>
            )}

            {/* Recent decisions feed */}
            <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Recent Decisions</h3>
                    <Link to="/journal" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>View all →</Link>
                </div>

                {decisions.length === 0 ? (
                    <EmptyState
                        icon="🧭"
                        title="No decisions logged yet"
                        description="Log your first major life decision and get instant AI analysis."
                        action={<Link to="/log" className="btn btn-primary">Log a Decision</Link>}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {decisions.slice(0, 6).map(d => {
                            const decReflections = reflections.filter(r => r.decision_id === d.id)
                            const hasReflection = decReflections.length > 0
                            const avgScore = hasReflection
                                ? (decReflections.reduce((s, r) => s + r.happiness_score, 0) / decReflections.length).toFixed(1)
                                : null

                            return (
                                <Link key={d.id} to={`/decision/${d.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 14px', borderRadius: 8, transition: 'background 0.2s', gap: 12
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                                                {d.title}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <span className={`badge category-${d.category.toLowerCase()}`}>{d.category}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(d.created_at), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                            {avgScore && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>⭐ {avgScore}</span>
                                            )}
                                            {hasReflection
                                                ? <span className="badge badge-green"><CheckCheck size={10} /> Reflected</span>
                                                : <span className="badge badge-muted">Pending</span>
                                            }
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
