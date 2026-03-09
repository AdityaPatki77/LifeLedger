import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'info'
    onClose: () => void
    duration?: number
}

export function Toast({ message, type = 'info', onClose, duration = 3500 }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, duration)
        return () => clearTimeout(t)
    }, [])

    const icons = { success: CheckCircle, error: XCircle, info: Info }
    const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--accent)' }
    const Icon = icons[type]

    return (
        <div className="toast">
            <Icon size={18} style={{ color: colors[type], flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{message}</span>
        </div>
    )
}

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => setToast({ message, type })
    const hideToast = () => setToast(null)
    return { toast, showToast, hideToast }
}
