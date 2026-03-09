import type { ReactNode } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProGateProps {
    children: ReactNode
    isVisible?: boolean
}

// Shows blurred content with an upgrade prompt
export function ProGate({ children, isVisible = false }: ProGateProps) {
    if (isVisible) return <>{children}</>

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', maxHeight: 400, overflow: 'hidden' }}>
                {children}
            </div>
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 30%, var(--bg-primary) 80%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 40,
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '32px 40px',
                        maxWidth: 400,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                    }}>
                        <Lock size={28} style={{ color: 'var(--gold)', marginBottom: 12 }} />
                        <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 8, color: 'var(--text-primary)' }}>
                            Pro Feature
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                            Upgrade to unlock this powerful feature and discover what actually makes you happy.
                        </p>
                        <Link to="/pricing" className="btn btn-gold btn-full">
                            <Sparkles size={16} />
                            Upgrade to Pro — Rs 349/mo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
