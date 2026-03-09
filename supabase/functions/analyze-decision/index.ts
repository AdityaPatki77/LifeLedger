import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MISTRAL_API_KEY = Deno.env.get('MISTRAL_API_KEY');

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { title, category, what_decided, reasoning, alternatives_rejected, expected_outcome } = await req.json();

        if (!MISTRAL_API_KEY) {
            return new Response(JSON.stringify({
                verdict: "Mock Analysis: This looks like a solid decision based on your reasoning.",
                biases_detected: ["Confirmation Bias"],
                devil_advocate: "What if the alternatives you rejected were actually better long-term?",
                quality_score: 85
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const prompt = `
    Analyze this life decision:
    Title: ${title}
    Category: ${category}
    What decided: ${what_decided}
    Reasoning: ${reasoning}
    Alternatives rejected: ${alternatives_rejected || 'none'}
    Expected outcome: ${expected_outcome || 'none'}

    Return a JSON object with:
    1. "verdict": A 2-3 sentence analysis of the decision quality.
    2. "biases_detected": Array of 1-3 cognitive biases possibly at play here.
    3. "devil_advocate": A strong 1-2 sentence counter-argument challenging the decision.
    4. "quality_score": An integer from 1 to 100 rating the reasoning quality.
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
                messages: [{ role: 'system', content: 'You are an expert decision intelligence analyst.' }, { role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            }),
        });

        const data = await response.json();

        if (data.message || (data.detail && typeof data.detail === "string")) {
            throw new Error(data.message || data.detail || 'Mistral API Error');
        }

        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

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
