import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Decision, Reflection, Category } from '../types/database'
import { format, differenceInDays } from 'date-fns'
import { Search, Lock, CheckCheck } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { getCategoryStyle } from '../lib/utils'

const CATEGORIES: Category[] = ['Career', 'Relationships', 'Health', 'Finance', 'Education', 'Personal']

export function JournalPage() {
    const { user, isPro } = useAuth()
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [reflections, setReflections] = useState<Reflection[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState<Category | ''>('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'reflected' | 'pending'>('all')

    useEffect(() => {
        if (!user) return
        Promise.all([
            supabase.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('reflections').select('*').eq('user_id', user.id),
        ]).then(([d, r]) => {
            setDecisions(d.data || [])
            setReflections(r.data || [])
            setLoading(false)
        })
    }, [user])

    // Removed unused cutoffDate

    const filtered = decisions.filter(d => {
        const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.what_decided?.toLowerCase().includes(search.toLowerCase())
        const matchCat = !filterCategory || d.category === filterCategory
        const hasReflection = reflections.some(r => r.decision_id === d.id)
        const matchStatus = filterStatus === 'all' || (filterStatus === 'reflected' ? hasReflection : !hasReflection)
        return matchSearch && matchCat && matchStatus
    })

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner size={28} /></div>

    return (
        <div className="page-padding fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>Decision Journal</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your complete decision timeline — {decisions.length} decisions logged</p>
            </div>

            {/* Search + Filters */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: 42, height: 48, borderRadius: 12, fontSize: '1rem' }}
                        placeholder="Search titles, decisions, or categories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                        <button
                            onClick={() => setFilterCategory('')}
                            className={`badge ${filterCategory === '' ? 'badge-blue' : 'badge-muted'}`}
                            style={{ cursor: 'pointer', border: 'none', padding: '6px 14px' }}
                        >
                            All Categories
                        </button>
                        {CATEGORIES.map(c => (
                            <button
                                key={c}
                                onClick={() => setFilterCategory(c)}
                                className={`badge ${filterCategory === c ? 'badge-blue' : 'badge-muted'}`}
                                style={{ cursor: 'pointer', border: 'none', padding: '6px 14px' }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                        {(['all', 'reflected', 'pending'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                style={{
                                    border: 'none',
                                    background: filterStatus === s ? 'var(--bg-elevated)' : 'transparent',
                                    color: filterStatus === s ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                                    cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon="📖"
                    title={search ? 'No results found' : 'No decisions yet'}
                    description={search ? 'Try a different search term.' : 'Start logging your decisions to build your journal.'}
                    action={!search ? <Link to="/log" className="btn btn-primary">Log First Decision</Link> : undefined}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filtered.map(d => {
                        const decReflections = reflections.filter(r => r.decision_id === d.id)
                        const hasReflection = decReflections.length > 0
                        const avgScore = hasReflection
                            ? (decReflections.reduce((s, r) => s + r.happiness_score, 0) / decReflections.length).toFixed(1)
                            : null
                        const daysSince = differenceInDays(new Date(), new Date(d.created_at))
                        const isOld = daysSince > 30
                        const isBlurred = isOld && !isPro

                        return (
                            <div key={d.id} style={{ position: 'relative' }}>
                                {isBlurred && (
                                    <div style={{
                                        position: 'absolute', inset: 0, zIndex: 10, borderRadius: 10,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(4px)',
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Lock size={18} style={{ color: 'var(--gold)', marginBottom: 6 }} />
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                                Full history requires Pro
                                            </p>
                                            <Link to="/pricing" className="btn btn-gold btn-sm">Upgrade →</Link>
                                        </div>
                                    </div>
                                )}
                                <Link to={isBlurred ? '#' : `/decision/${d.id}`} style={{ textDecoration: 'none', pointerEvents: isBlurred ? 'none' : 'auto' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 18px', borderRadius: 10, marginBottom: 2,
                                        border: '1px solid transparent', transition: 'all 0.2s',
                                        background: 'var(--bg-card)',
                                        filter: isBlurred ? 'blur(2px)' : 'none',
                                    }}
                                        onMouseEnter={e => !isBlurred && (e.currentTarget.style.borderColor = 'var(--border)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {d.title}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <span className={`badge ${getCategoryStyle(d.category)}`}>{d.category}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(d.created_at), 'MMM d, yyyy')}</span>
                                                {d.confidence_score && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence: {d.confidence_score}/10</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                            {avgScore && <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold)' }}>⭐ {avgScore}</span>}
                                            {hasReflection
                                                ? <span className="badge badge-green"><CheckCheck size={10} /> Reflected</span>
                                                : <span className="badge badge-muted">Pending</span>
                                            }
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )}

            {!isPro && decisions.some(d => differenceInDays(new Date(), new Date(d.created_at)) > 30) && (
                <div style={{ textAlign: 'center', marginTop: 24, padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <Lock size={24} style={{ color: 'var(--gold)', marginBottom: 10 }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 14, fontSize: '0.9rem' }}>
                        Some decisions are hidden. Upgrade to Pro to access your complete decision history.
                    </p>
                    <Link to="/pricing" className="btn btn-gold">Unlock Full History</Link>
                </div>
            )}
        </div>
    )
}
