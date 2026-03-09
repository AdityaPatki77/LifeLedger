import { supabase } from '../lib/supabase'
import type { AIAnalysis } from '../types/database'

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY

interface DecisionData {
    title: string
    category: string
    what_decided: string
    reasoning: string
    alternatives_rejected: string
    confidence_score: number
    anxiety_score: number
    expected_outcome: string
}

export async function analyzeDecision(decision: DecisionData): Promise<AIAnalysis> {
    if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'your-mistral-api-key') {
        // Mock response for demo when no API key
        return {
            quality_score: 72,
            biases_detected: ['Confirmation Bias', 'Optimism Bias'],
            devil_advocate: 'While your reasoning seems sound, consider that you may be underestimating the risks involved. The alternatives you rejected might have had more merit than you gave them credit for.',
            what_missing: 'You haven\'t fully considered the long-term opportunity cost. What are you giving up by making this choice? Also, how does this align with your values 5 years from now?',
            verdict: 'This appears to be a reasonably well-thought-out decision with moderate confidence. The reasoning is sound but could benefit from more consideration of alternatives. Proceed with awareness of the potential biases noted.',
        }
    }

    try {
        const { data, error } = await supabase.functions.invoke('analyze-decision', {
            body: decision,
        })

        if (error) {
            console.error("Edge function error:", error)
            throw new Error(`Edge function failed: ${error.message}`)
        }

        // The edge function currently returns without 'what_missing' which satisfies our DB, 
        // but we'll map it to the AIAnalysis interface to satisfy TS.
        return {
            quality_score: data.quality_score,
            biases_detected: data.biases_detected || [],
            devil_advocate: data.devil_advocate || '',
            what_missing: data.what_missing || '',
            verdict: data.verdict || ''
        }
    } catch (err) {
        console.error('Failed to invoke analyze-decision edge function:', err)
        throw err
    }
}

export async function generatePatternInsights(userId: string): Promise<string> {
    const { data: decisions } = await supabase
        .from('decisions')
        .select('*, reflections(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (!decisions || decisions.length === 0) {
        return JSON.stringify({
            insights: ['Log more decisions to unlock personalized insights.'],
            personality: 'You\'re just getting started on your decision intelligence journey. Log your first few decisions to see patterns emerge.',
        })
    }

    if (!MISTRAL_API_KEY || MISTRAL_API_KEY === 'your-mistral-api-key') {
        return JSON.stringify({
            insights: [
                'You tend to make better decisions when your confidence score is above 7.',
                'Your career decisions have an average happiness score of 8.2 — your strongest category.',
                'Decisions made decisively (high confidence, low anxiety) tend to make you happier 6 months later.',
                'You\'re most reflective after health-related decisions — a sign of deep self-awareness.',
            ],
            personality: 'You are a thoughtful, deliberate decision-maker who weighs options carefully. You tend to be harder on yourself than necessary — your instincts are better than you think. Your strongest decisions come when you trust your gut after gathering sufficient information.',
        })
    }

    try {
        const { data, error } = await supabase.functions.invoke('generate-insights', {
            body: { decisions },
        })

        if (error) throw new Error(`Edge function failed: ${error.message}`)

        return JSON.stringify(data)
    } catch (err) {
        console.error('Failed to invoke generate-insights edge function:', err)
        throw err
    }
}
