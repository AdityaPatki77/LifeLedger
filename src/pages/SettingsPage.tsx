import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/ui/Spinner'
import { Toast, useToast } from '../components/ui/Toast'
import { Modal } from '../components/ui/Modal'
import { Link } from 'react-router-dom'
import { User, Lock, Bell, CreditCard, Trash2, AlertTriangle, Palette, Download } from 'lucide-react'
import { useTheme, type Theme } from '../context/ThemeContext'

export function SettingsPage() {
    const { user, profile, isPro, refreshProfile, signOut } = useAuth()
    const { toast, showToast, hideToast } = useToast()
    const { theme, setTheme } = useTheme()

    const themes: { id: Theme; label: string; bg: string; accent: string }[] = [
        { id: 'dark', label: 'Classic Dark', bg: '#0a0a0a', accent: '#4F8EF7' },
        { id: 'light', label: 'Clean Light', bg: '#f8fafc', accent: '#2563eb' },
        { id: 'midnight', label: 'Nord Midnight', bg: '#0f172a', accent: '#38bdf8' },
        { id: 'nature', label: 'Earth Nature', bg: '#fdfbf7', accent: '#556b2f' },
        { id: 'sunset', label: 'Warm Sunset', bg: '#1a0b16', accent: '#ff4d6d' },
    ]

    const [name, setName] = useState(profile?.name || '')
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)
    const [, setCurrentPw] = useState('')
    const [newPw, setNewPw] = useState('')
    const [savingPw, setSavingPw] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [exporting, setExporting] = useState(false)

    useEffect(() => { setName(profile?.name || '') }, [profile])

    const saveProfile = async () => {
        if (!user) return
        setSavingProfile(true)
        const { error } = await supabase.from('users').update({ name }).eq('id', user.id)
        if (error) showToast('Failed to update profile', 'error')
        else { await refreshProfile(); showToast('Profile updated!', 'success') }
        setSavingProfile(false)
    }

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }
        setSavingPw(true)
        const { error } = await supabase.auth.updateUser({ password: newPw })
        if (error) showToast('Failed to change password: ' + error.message, 'error')
        else { showToast('Password updated!', 'success'); setCurrentPw(''); setNewPw('') }
        setSavingPw(false)
    }

    const deleteAllData = async () => {
        if (!user || deleteConfirm !== 'DELETE') return
        setDeleting(true)
        await supabase.from('reflections').delete().eq('user_id', user.id)
        await supabase.from('decisions').delete().eq('user_id', user.id)
        await supabase.from('mood_checkins').delete().eq('user_id', user.id)
        await supabase.from('users').delete().eq('id', user.id)
        await signOut()
    }

    const exportData = async () => {
        if (!user) return
        if (!isPro) {
            showToast('Data Export is a Pro feature. Upgrade to unlock.', 'info')
            return
        }
        setExporting(true)
        const [d, r, m] = await Promise.all([
            supabase.from('decisions').select('*').eq('user_id', user.id),
            supabase.from('reflections').select('*').eq('user_id', user.id),
            supabase.from('mood_checkins').select('*').eq('user_id', user.id)
        ])

        const data = {
            profile,
            decisions: d.data || [],
            reflections: r.data || [],
            mood_checkins: m.data || [],
            export_date: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lifeledger-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        setExporting(false)
        showToast('Data exported successfully!', 'success')
    }

    const trialEnd = profile?.trial_started_at
        ? new Date(new Date(profile.trial_started_at).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null
    const isOnTrial = trialEnd && trialEnd > new Date() && !profile?.is_pro

    return (
        <div className="page-padding fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

            {/* Delete modal */}
            <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete All Data">
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            This will permanently delete all your decisions, reflections, and account data. This cannot be undone.
                        </p>
                    </div>
                    <label className="input-label">Type DELETE to confirm</label>
                    <input className="input" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={() => { setDeleteModal(false); setDeleteConfirm('') }}>Cancel</button>
                    <button className="btn btn-danger" onClick={deleteAllData} disabled={deleteConfirm !== 'DELETE' || deleting}>
                        {deleting ? <Spinner size={14} /> : <><Trash2 size={14} /> Delete Everything</>}
                    </button>
                </div>
            </Modal>

            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your account and preferences</p>
            </div>

            {/* Profile */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <User size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Profile</h3>
                </div>
                <div className="form-group">
                    <label className="input-label">Name</label>
                    <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="input-label">Email</label>
                    <input className="input" value={profile?.email || user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={savingProfile}>
                    {savingProfile ? <Spinner size={14} /> : 'Save Changes'}
                </button>
            </div>

            {/* Password */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Lock size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Change Password</h3>
                </div>
                <form onSubmit={changePassword}>
                    <div className="form-group">
                        <label className="input-label">New Password</label>
                        <input type="password" className="input" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 characters" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={savingPw}>
                        {savingPw ? <Spinner size={14} /> : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Appearance */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Palette size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Appearance</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>Choose your favorite visual flavor for LifeLedger.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                    {themes.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            style={{
                                padding: '12px', border: `2px solid ${theme === t.id ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: 12, background: t.bg, cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                width: 20, height: 20, borderRadius: '50%', background: t.accent,
                                marginBottom: 12, border: '2px solid rgba(255,255,255,0.2)'
                            }} />
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                color: t.id === 'light' || t.id === 'nature' ? '#2d2a24' : '#fff'
                            }}>
                                {t.label}
                            </span>
                            {theme === t.id && (
                                <div style={{
                                    position: 'absolute', top: 8, right: 8, width: 8, height: 8,
                                    borderRadius: '50%', background: 'var(--accent)'
                                }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Bell size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Notifications</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <p style={{ fontWeight: 500, marginBottom: 2, fontSize: '0.9rem' }}>Reflection reminders</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Email at 1mo, 3mo, 6mo, 1yr after each decision</p>
                    </div>
                    <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        style={{
                            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                            background: emailNotifications ? 'var(--accent)' : 'var(--border)',
                            position: 'relative', transition: 'background 0.2s',
                        }}
                    >
                        <div style={{
                            width: 18, height: 18, borderRadius: '50%', background: 'white',
                            position: 'absolute', top: 3, left: emailNotifications ? 23 : 3,
                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }} />
                    </button>
                </div>
            </div>

            {/* Plan */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <CreditCard size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Subscription</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>{isPro ? 'Pro Plan' : isOnTrial ? 'Pro Trial' : 'Free Plan'}</span>
                            {isPro && <span className="badge badge-gold">Active</span>}
                            {isOnTrial && <span className="badge badge-blue">Trial</span>}
                        </div>
                        {isPro && profile?.pro_expires_at && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Renews {new Date(profile.pro_expires_at).toLocaleDateString()}
                            </p>
                        )}
                        {isOnTrial && trialEnd && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Trial ends {trialEnd.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    {!isPro && <Link to="/pricing" className="btn btn-gold btn-sm">Upgrade to Pro</Link>}
                    {isPro && (
                        <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            onClick={() => showToast('Contact support@lifeledger.app to cancel your subscription.', 'info')}>
                            Cancel Subscription
                        </button>
                    )}
                </div>
            </div>

            {/* Data Export */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Download size={18} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0 }}>Data & Privacy</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                    Download a complete copy of your decision history, reflections, and mood data in JSON format.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={exportData} disabled={exporting}>
                    {exporting ? <Spinner size={14} /> : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Download size={14} />
                            Export My Data (JSON)
                            {!isPro && <Lock size={12} style={{ color: 'var(--gold)' }} />}
                        </div>
                    )}
                </button>
            </div>

            {/* Danger zone */}
            <div className="card" style={{ padding: 24, borderColor: 'rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', margin: 0, color: 'var(--danger)' }}>Danger Zone</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                    Delete all your decisions, reflections, and account data permanently.
                </p>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(true)}>
                    <Trash2 size={14} /> Delete All My Data
                </button>
            </div>
        </div>
    )
}
