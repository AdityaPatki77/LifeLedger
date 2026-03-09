import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { user_id } = await req.json();

        // Fetch decisions for context
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: decisions } = await supabaseClient
            .from('decisions')
            .select('category, what_decided, confidence_score, ai_quality_score')
            .eq('user_id', user_id)
            .limit(20);

        if (!MISTRAL_API_KEY) {
            return new Response(JSON.stringify({
                insights: ["You tend to make health decisions with high confidence.", "Career decisions cause the most anxiety."],
                personality: "The Analytical Optimist"
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const prompt = `
    Analyze these past decisions for patterns:
    ${JSON.stringify(decisions)}

    Return a JSON object with:
    1. "insights": Array of 3-4 string sentences describing patterns (e.g. correlative trends, category biases).
    2. "personality": A 2-3 word title of their decision-making personality (e.g. "The Analytical Optimist").
    Ensure pure JSON output.
    `;

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [{ role: 'system', content: 'You are an expert decision intelligence analyst finding patterns.' }, { role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            }),
        });

        const data = await response.json();

        if (data.message || (data.detail && typeof data.detail === "string")) {
            throw new Error(data.message || data.detail || 'Mistral API Error');
        }
        const result = JSON.parse(data.choices[0].message.content);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
