import { useState, useEffect } from 'react'
import { Brain, Search, Info, ShieldAlert, Sparkles } from 'lucide-react'
import { GlowingCard } from '../ui/GlowingCard'
import { detectBlindSpots } from '../../lib/openai'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui/Spinner'

export function InsightEngine() {
    const { user } = useAuth()
    const [blindSpots, setBlindSpots] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        detectBlindSpots(user.id).then((spots: string[]) => {
            setBlindSpots(spots)
            setLoading(false)
        })
    }, [user])

    if (loading) return (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <Spinner size={30} />
            <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>AI Engines Initializing...</p>
        </div>
    )

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Brain size={22} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', margin: 0 }}>The Insight Engine</h2>
                <div className="badge badge-gold"><Sparkles size={10} /> Pro</div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
                Advanced pattern recognition detecting subtle cognitive biases in your decision trajectory.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {blindSpots.map((spot, i) => (
                    <GlowingCard key={i} intensity={i === 0 ? 'high' : 'medium'} className="card" style={{ padding: 0 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: i === 0 ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {spot.toLowerCase().includes('bias') ? (
                                    <ShieldAlert size={20} style={{ color: 'var(--danger)' }} />
                                ) : spot.toLowerCase().includes('pattern') ? (
                                    <Search size={20} style={{ color: 'var(--accent)' }} />
                                ) : (
                                    <Info size={20} style={{ color: 'var(--gold)' }} />
                                )}
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    {spot.split(':')[0]}
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {spot.split(':')[1] || spot}
                                </p>
                            </div>
                        </div>
                    </GlowingCard>
                ))}
            </div>
        </div>
    )
}
