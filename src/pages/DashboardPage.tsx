import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Decision, Reflection, MoodCheckin } from '../types/database'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { PlusCircle, TrendingUp, Star, Clock, CheckCheck, Flame, BarChart2, ArrowRight, Smile } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { format, differenceInDays } from 'date-fns'

const COLORS = ['#6366f1', '#d4af37', '#10b981', '#f472b6', '#fb923c', '#818cf8']

const CAT_COLORS: Record<string, string> = {
    career: '#818cf8',
    relationships: '#f472b6',
    health: '#34d399',
    finance: '#d4af37',
    education: '#fb923c',
    personal: '#a5b4fc',
}

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

    const totalDecisions = decisions.length
    const avgHappiness = reflections.length
        ? (reflections.reduce((s, r) => s + r.happiness_score, 0) / reflections.length).toFixed(1)
        : null

    const catCounts: Record<string, number> = {}
    decisions.forEach(d => { catCounts[d.category] = (catCounts[d.category] || 0) + 1 })
    const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value }))

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

    const trendData = reflections
        .slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(r => ({ date: format(new Date(r.created_at), 'MMM d'), happiness: r.happiness_score }))

    const streak = (() => {
        if (decisions.length === 0) return 0
        let s = 0
        const now = new Date()
        const sorted = decisions.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const lastWeek = Math.floor(differenceInDays(now, new Date(sorted[0].created_at)) / 7)
        if (lastWeek > 1) return 0
        const weeks = new Set(sorted.map(d => Math.floor(differenceInDays(now, new Date(d.created_at)) / 7)))
        for (let i = 0; weeks.has(i); i++) s = i + 1
        return s
    })()

    const dueReflections = decisions.filter(d => {
        const daysSince = differenceInDays(new Date(), new Date(d.created_at))
        const existingTypes = reflections.filter(r => r.decision_id === d.id).map(r => r.reflection_type)
        if (daysSince >= 30 && !existingTypes.includes('1month')) return true
        if (daysSince >= 90 && !existingTypes.includes('3month')) return true
        if (daysSince >= 180 && !existingTypes.includes('6month')) return true
        if (daysSince >= 365 && !existingTypes.includes('1year')) return true
        return false
    })

    const thisMonthDecisions = decisions.filter(d => {
        const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
        return new Date(d.created_at) >= start
    }).length

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙'

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Spinner size={28} label="Loading dashboard..." />
        </div>
    )

    const STATS = [
        { label: 'Total Decisions', value: totalDecisions, icon: BarChart2, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
        { label: 'Avg Happiness', value: avgHappiness ? `${avgHappiness}/10` : '—', icon: Star, color: '#d4af37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.2)' },
        { label: 'Week Streak', value: `${streak}wk`, icon: Flame, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
        { label: 'Due Reflections', value: dueReflections.length, icon: Clock, color: dueReflections.length > 0 ? '#f59e0b' : '#10b981', bg: dueReflections.length > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', border: dueReflections.length > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)' },
    ]

    return (
        <div className="page-padding stagger-in">
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: '1.5rem' }}>{greetingEmoji}</span>
                        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                            {greeting}, {profile?.name?.split(' ')[0] || 'there'}
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: 44 }}>Your decision intelligence at a glance</p>
                </div>
                <Link to="/log" className="btn btn-primary" style={{ gap: 8, borderRadius: 10 }}>
                    <PlusCircle size={16} /> Log a Decision
                </Link>
            </div>

            {/* ── Free user limit bar ── */}
            {!isPro && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(99,102,241,0.04))',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: 12, padding: '12px 18px', marginBottom: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
                }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>Decisions this month:</span>
                        <span style={{
                            fontWeight: 700, fontSize: '0.9rem',
                            color: thisMonthDecisions >= 10 ? 'var(--danger)' : 'var(--text-primary)',
                            background: thisMonthDecisions >= 10 ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.06)',
                            padding: '2px 8px', borderRadius: 6,
                        }}>
                            {thisMonthDecisions}/10
                        </span>
                        {/* Progress bar */}
                        <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(thisMonthDecisions / 10 * 100, 100)}%`, height: '100%', background: thisMonthDecisions >= 10 ? 'var(--danger)' : 'var(--accent)', borderRadius: 2, transition: 'width 0.5s' }} />
                        </div>
                    </div>
                    <Link to="/pricing" className="btn btn-gold btn-sm" style={{ borderRadius: 8 }}>Upgrade to Pro</Link>
                </div>
            )}

            {/* ── Stats Grid ── */}
            <div id="tour-dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                {STATS.map(stat => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={stat.label}
                            className="stat-card"
                            style={{ padding: 24, '--stat-color': stat.color } as React.CSSProperties}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: stat.bg, border: `1px solid ${stat.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 0 20px ${stat.color}15`,
                                }}>
                                    <Icon size={20} style={{ color: stat.color }} />
                                </div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'DM Serif Display, serif', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {stat.label}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Charts Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Happiness trend */}
                <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem', margin: 0, fontWeight: 400 }}>Happiness Trend</h3>
                        </div>
                        {trendData.length > 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trendData.length} data points</span>
                        )}
                    </div>
                    {trendData.length === 0 ? (
                        <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', gap: 8 }}>
                            <TrendingUp size={24} style={{ opacity: 0.3 }} />
                            Complete reflections to see your trend
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={trendData}>
                                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                                <Line type="monotone" dataKey="happiness" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: 'var(--accent)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Category pie */}
                <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <BarChart2 size={16} style={{ color: 'var(--text-muted)' }} />
                        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem', margin: 0, fontWeight: 400 }}>By Category</h3>
                    </div>
                    {pieData.length === 0 ? (
                        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', flexDirection: 'column', gap: 8 }}>
                            <BarChart2 size={24} style={{ opacity: 0.3 }} />
                            Log decisions to see breakdown
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={130}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" paddingAngle={3}>
                                        {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} strokeWidth={0} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                {pieData.map((d, idx) => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Mastery + Mood Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Best category */}
                <div className="card" style={{ padding: 28, borderLeft: '3px solid var(--gold)' }}>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 14 }}>🏆 Mastery Focus</p>
                    {bestCat ? (
                        <div>
                            <div style={{
                                fontSize: '1.8rem', fontFamily: 'DM Serif Display, serif', fontWeight: 400,
                                color: 'var(--gold)', marginBottom: 6, letterSpacing: '-0.02em',
                                textTransform: 'capitalize',
                            }}>
                                {bestCat}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Your most successful decisions are in this area.</p>
                            <div style={{
                                marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'var(--gold-dim)', border: '1px solid rgba(212,175,55,0.2)',
                                borderRadius: 8, padding: '4px 10px',
                            }}>
                                <Star size={12} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>{bestAvg.toFixed(1)}/10 success rate</span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>Log and reflect on more decisions to identify your high-mastery area.</p>
                    )}
                </div>

                {/* Mood check-in */}
                <div id="tour-mood-checkin" className="card" style={{ padding: 24 }}>
                    {!isPro ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <Smile size={16} style={{ color: 'var(--text-muted)' }} />
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Daily Mood Check-in</p>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                                Track your mood and discover when you make your best decisions.
                            </p>
                            <Link to="/pricing" className="btn btn-gold btn-sm" style={{ borderRadius: 8, gap: 6 }}>
                                Unlock with Pro →
                            </Link>
                        </div>
                    ) : todayMood ? (
                        <div>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 16 }}>✅ Today's Check-in</p>
                            <div style={{ display: 'flex', gap: 24 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--accent)', fontFamily: 'DM Serif Display, serif' }}>{todayMood.mood_score}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Mood</div>
                                </div>
                                <div style={{ width: 1, background: 'var(--border)' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--gold)', fontFamily: 'DM Serif Display, serif' }}>{todayMood.energy_score}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Energy</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 14 }}>Check back tomorrow!</p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <Smile size={16} style={{ color: 'var(--accent)' }} />
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>How are you today?</p>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                    <span>Mood</span><span style={{ fontWeight: 600, color: 'var(--accent)' }}>{moodScore}/10</span>
                                </div>
                                <input type="range" min={1} max={10} value={moodScore} onChange={e => setMoodScore(+e.target.value)} style={{ '--progress': `${(moodScore - 1) / 9 * 100}%` } as React.CSSProperties} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                    <span>Energy</span><span style={{ fontWeight: 600, color: 'var(--gold)' }}>{energyScore}/10</span>
                                </div>
                                <input type="range" min={1} max={10} value={energyScore} onChange={e => setEnergyScore(+e.target.value)} style={{ '--progress': `${(energyScore - 1) / 9 * 100}%` } as React.CSSProperties} />
                            </div>
                            <button className="btn btn-primary btn-sm btn-full" onClick={submitMood} disabled={submittingMood} style={{ borderRadius: 8 }}>
                                {submittingMood ? <Spinner size={13} /> : 'Log Mood'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Due Reflections Alert ── */}
            {dueReflections.length > 0 && (
                <div style={{
                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 12, padding: '16px 20px', marginBottom: 20,
                    borderLeft: '3px solid var(--warning)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Clock size={15} style={{ color: 'var(--warning)' }} />
                        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '0.95rem', color: 'var(--warning)', margin: 0, fontWeight: 400 }}>
                            {dueReflections.length} reflection{dueReflections.length > 1 ? 's' : ''} ready for you
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {dueReflections.slice(0, 3).map(d => (
                            <Link key={d.id} to={`/decision/${d.id}`} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 8, padding: '5px 12px', fontSize: '0.8rem',
                                color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6,
                                transition: 'border-color 0.15s',
                            }}>
                                {d.title} <ArrowRight size={12} style={{ opacity: 0.5 }} />
                            </Link>
                        ))}
                        {dueReflections.length > 3 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{dueReflections.length - 3} more</span>}
                    </div>
                </div>
            )}

            {/* ── Recent Decisions Feed ── */}
            <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', margin: 0, fontWeight: 400 }}>Recent Decisions</h3>
                    <Link to="/journal" style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        View all <ArrowRight size={13} />
                    </Link>
                </div>

                {decisions.length === 0 ? (
                    <EmptyState
                        icon="🧭"
                        title="No decisions logged yet"
                        description="Log your first major life decision and get instant AI analysis."
                        action={<Link to="/log" className="btn btn-primary">Log a Decision</Link>}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {decisions.slice(0, 6).map(d => {
                            const decReflections = reflections.filter(r => r.decision_id === d.id)
                            const hasReflection = decReflections.length > 0
                            const avgScore = hasReflection
                                ? (decReflections.reduce((s, r) => s + r.happiness_score, 0) / decReflections.length).toFixed(1)
                                : null
                            const catColor = CAT_COLORS[d.category?.toLowerCase()] || 'var(--accent)'

                            return (
                                <Link key={d.id} to={`/decision/${d.id}`} className="decision-row" style={{ borderLeftColor: `${catColor}50` }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderLeftColor = catColor }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = `${catColor}50` }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                                            {d.title}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span className={`badge category-${d.category?.toLowerCase()}`}>{d.category}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(d.created_at), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                        {avgScore && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Star size={11} fill="var(--gold)" /> {avgScore}
                                            </span>
                                        )}
                                        {hasReflection
                                            ? <span className="badge badge-green"><CheckCheck size={10} /> Reflected</span>
                                            : <span className="badge badge-muted">Pending</span>
                                        }
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
