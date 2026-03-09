import type { ReactNode } from 'react'

interface EmptyStateProps {
    icon: ReactNode
    title: string
    description: string
    action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: 16, opacity: 0.4 }}>{icon}</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'Playfair Display, serif', fontWeight: 600, fontSize: '1.1rem' }}>
                {title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 320, margin: '0 auto 20px' }}>
                {description}
            </p>
            {action}
        </div>
    )
}
