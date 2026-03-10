import React from 'react'

interface GlowingCardProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    intensity?: 'low' | 'medium' | 'high'
}

export function GlowingCard({ children, className = '', style = {}, onClick, intensity = 'medium' }: GlowingCardProps) {
    const glowOpacity = intensity === 'low' ? 0.15 : intensity === 'medium' ? 0.3 : 0.6

    return (
        <div
            className={`premium-border ${className}`}
            onClick={onClick}
            style={{
                ...style,
                cursor: onClick ? 'pointer' : 'default',
            }}
        >
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,${glowOpacity}) 0%, transparent 100%)`,
                opacity: 0,
                transition: 'opacity 0.3s',
                pointerEvents: 'none',
                zIndex: 2
            }} className="mouse-glow" />
            <div style={{ position: 'relative', zIndex: 3, padding: 24 }}>
                {children}
            </div>
        </div>
    )
}
