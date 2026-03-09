import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../types/database'

interface AuthContextType {
    session: Session | null
    user: SupabaseUser | null
    profile: User | null
    loading: boolean
    isPro: boolean
    refreshProfile: () => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()
        if (data) setProfile(data as User)
    }

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id)
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setProfile(null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const isPro = profile ? (
        profile.is_pro && (profile.pro_expires_at ? new Date(profile.pro_expires_at) > new Date() : true)
    ) || (
            profile.trial_started_at ? new Date(profile.trial_started_at).getTime() + 7 * 24 * 60 * 60 * 1000 > Date.now() : false
        ) : false

    const signOut = async () => {
        await supabase.auth.signOut()
        setProfile(null)
    }

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, isPro, refreshProfile, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
