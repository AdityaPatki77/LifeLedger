export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface User {
    id: string
    email: string
    name: string | null
    age_range: string | null
    created_at: string
    is_pro: boolean
    pro_expires_at: string | null
    trial_started_at: string | null
}

export type Category = 'Career' | 'Relationships' | 'Health' | 'Finance' | 'Education' | 'Personal'

export interface Decision {
    id: string
    user_id: string
    title: string
    category: Category
    what_decided: string
    reasoning: string
    alternatives_rejected: string | null
    confidence_score: number
    anxiety_score: number
    expected_outcome: string | null
    ai_analysis: string | null
    ai_bias_detected: string[] | null
    ai_devil_advocate: string | null
    ai_quality_score: number | null
    tags: string[] | null
    is_resolved: boolean
    final_outcome: string | null
    success_score: number | null
    resolved_at: string | null
    created_at: string
}

export type ReflectionType = '1month' | '3month' | '6month' | '1year'

export interface Reflection {
    id: string
    decision_id: string
    user_id: string
    reflection_type: ReflectionType
    happiness_score: number
    reflection_text: string | null
    actual_outcome: string | null
    created_at: string
}

export interface MoodCheckin {
    id: string
    user_id: string
    mood_score: number
    energy_score: number
    created_at: string
}

export interface DecisionWithReflections extends Decision {
    reflections?: Reflection[]
}

export interface AIAnalysis {
    quality_score: number
    biases_detected: string[]
    devil_advocate: string
    what_missing: string
    verdict: string
}
