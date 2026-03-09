import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Decision } from '../types/database'
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Lock, Zap } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { getCategoryStyle } from '../lib/utils'

export function CalendarPage() {
    const { user, isPro } = useAuth()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [isPaywalled, setIsPaywalled] = useState(false)

    useEffect(() => {
        if (!user) return
        async function loadDecisions() {
            if (!user) return
            setLoading(true)
            const firstDay = startOfMonth(currentMonth)
            const lastDay = endOfMonth(currentMonth)

            const { data } = await supabase
                .from('decisions')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', firstDay.toISOString())
                .lte('created_at', lastDay.toISOString())

            setDecisions(data || [])
            setLoading(false)
        }
        loadDecisions()
    }, [user, currentMonth])

    const nextMonth = () => {
        if (!isPro) { setIsPaywalled(true); return }
        setCurrentMonth(addMonths(currentMonth, 1))
    }
    const prevMonth = () => {
        if (!isPro) { setIsPaywalled(true); return }
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
    const selectedDecisions = decisions.filter(d => selectedDate && isSameDay(new Date(d.created_at), selectedDate))

    return (
        <div className="page-padding fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Modal isOpen={isPaywalled} onClose={() => setIsPaywalled(false)} title="Pro Feature">
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Lock size={30} style={{ color: 'var(--gold)' }} />
                    </div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Unlock Full History</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
                        Free users can only view decisions from the current month. Upgrade to **Pro** to browse your entire life timeline and discover patterns across years.
                    </p>
                    <Link to="/app/pricing" className="btn btn-gold btn-full btn-lg">
                        <Zap size={16} fill="currentColor" /> Upgrade to Pro
                    </Link>
                </div>
            </Modal>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', margin: 0 }}>Decision Calendar</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <button onClick={prevMonth} className="btn-icon" style={{ padding: 4 }}><ChevronLeft size={20} /></button>
                    <span style={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={nextMonth} className="btn-icon" style={{ padding: 4 }}><ChevronRight size={20} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                {/* Calendar Grid */}
                <div className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 12 }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', paddingBottom: 8 }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                        {calendarDays.map((day, i) => {
                            const dayDecisions = decisions.filter(d => isSameDay(new Date(d.created_at), day))
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const isToday = isSameDay(day, new Date())
                            const isCurrentMonth = isSameMonth(day, monthStart)

                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedDate(day)}
                                    style={{
                                        minHeight: 90,
                                        padding: 8,
                                        background: isCurrentMonth ? 'transparent' : 'var(--bg-primary)',
                                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        opacity: isCurrentMonth ? 1 : 0.4,
                                        boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: isToday || isSelected ? 700 : 400,
                                        color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                                        marginBottom: 4
                                    }}>
                                        {format(day, 'd')}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {dayDecisions.slice(0, 3).map(d => (
                                            <div key={d.id} style={{
                                                fontSize: '0.65rem',
                                                padding: '2px 4px',
                                                borderRadius: 4,
                                                background: 'var(--accent-dim)',
                                                color: 'var(--accent)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {d.title}
                                            </div>
                                        ))}
                                        {dayDecisions.length > 3 && (
                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>+ {dayDecisions.length - 3} more</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Day Detail Sidebar */}
                <div style={{ position: 'sticky', top: 24 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <CalendarIcon size={18} style={{ color: 'var(--accent)' }} />
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', margin: 0 }}>
                                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
                            </h2>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Spinner size={20} /></div>
                        ) : selectedDecisions.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {selectedDecisions.map(d => (
                                    <Link
                                        key={d.id}
                                        to={`/decision/${d.id}`}
                                        className="card-hover"
                                        style={{
                                            padding: 12,
                                            borderRadius: 10,
                                            border: '1px solid var(--border)',
                                            textDecoration: 'none',
                                            display: 'block'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <span className={`badge ${getCategoryStyle(d.category)}`} style={{ fontSize: '0.65rem' }}>{d.category}</span>
                                            {d.is_resolved && <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />}
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>{d.title}</div>
                                        <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <span>QA: {d.ai_quality_score || 'N/A'}</span>
                                            <span>Conf: {d.confidence_score}/10</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No decisions made today.</p>
                                <Link to="/log" state={{ prefill: format(selectedDate || new Date(), 'yyyy-MM-dd') }} style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: 8, display: 'inline-block' }}>Log one now</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
