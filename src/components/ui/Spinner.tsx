import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface SpinnerProps {
    size?: number
    className?: string
    label?: string
}

export function Spinner({ size = 20, className, label }: SpinnerProps) {
    return (
        <div className={clsx('flex items-center gap-2', className)}>
            <Loader2 size={size} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--accent)' }} />
            {label && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>}
        </div>
    )
}

export function PageLoader() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
                <Spinner size={32} />
                <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
            </div>
        </div>
    )
}
