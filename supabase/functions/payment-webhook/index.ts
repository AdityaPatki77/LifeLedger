// Setup for Razorpay webhook validation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

// Note: Ensure RAZORPAY_WEBHOOK_SECRET is set in Supabase Edge Function secrets
const RAZORPAY_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

serve(async (req) => {
    try {
        const signature = req.headers.get('x-razorpay-signature');
        const bodyText = await req.text();

        if (!RAZORPAY_SECRET || !signature) {
            return new Response('Missing secret or signature', { status: 400 });
        }

        // Verify razorpay signature
        const expectedSignature = createHmac('sha256', RAZORPAY_SECRET)
            .update(bodyText)
            .digest('hex');

        if (expectedSignature !== signature) {
            return new Response('Invalid Signature', { status: 400 });
        }

        const event = JSON.parse(bodyText);

        // If payment captured successfully
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const userEmail = payment.email;

            // Upgrade user to Pro using service_role key to bypass RLS
            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            );

            const { data: user } = await supabaseAdmin.from('users').select('id').eq('email', userEmail).single();

            if (user) {
                await supabaseAdmin.from('users').update({
                    is_pro: true,
                    pro_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                }).eq('id', user.id);
            }
        }

        return new Response('Webhook handled', { status: 200 });

    } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
    }
});
