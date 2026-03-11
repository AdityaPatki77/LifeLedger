import { Link } from 'react-router-dom'
import { Brain, TrendingUp, Clock, CheckCircle, Zap, ArrowRight, Star, BarChart3, Shield } from 'lucide-react'

const FEATURES = [
    {
        icon: Brain,
        title: 'AI Decision Architecture',
        desc: 'GPT-4 scoring, cognitive bias detection, and devil\'s advocate perspectives for sharp, unbiased clarity.',
        color: '#818cf8',
        size: 'large',
    },
    {
        icon: Clock,
        title: 'Multi-Stage Reflection',
        desc: 'Automated check-ins at 1m, 3m, 6m, and 1y. Discover which choices actualy lead to joy.',
        color: '#f472b6',
        size: 'small',
    },
    {
        icon: TrendingUp,
        title: 'Pattern Intelligence',
        desc: 'Advanced analytics correlating energy, category, and mental models with long-term success.',
        color: '#d4af37',
        size: 'small',
    },
    {
        icon: CheckCircle,
        title: 'Decision Journal & Calendar',
        desc: 'A beautiful, searchable visual history of your life\'s entire decision trajectory.',
        color: '#34d399',
        size: 'small',
    },
    {
        icon: Zap,
        title: 'Mental Model Library',
        desc: 'Pros/Cons, 10-10-10, Eisenhower matrices. Structure your thinking like a stoic philosopher.',
        color: '#fb923c',
        size: 'small',
    },
    {
        icon: Star,
        title: 'Outcome Tracking',
        desc: 'Bridge intent and result. Log final outcomes to train your intuition over time.',
        color: '#a78bfa',
        size: 'large',
    },
]

const STATS = [
    { value: '12,400+', label: 'Decisions logged' },
    { value: '94%', label: 'Clarity improvement' },
    { value: '4.9★', label: 'User rating' },
]

const TESTIMONIALS = [
    {
        quote: 'LifeLedger completely changed how I approach big choices. The AI bias detection alone is worth ten therapy sessions.',
        author: 'Sarah K.',
        role: 'Founder, Paragon Labs',
        avatar: 'SK',
        avatarGrad: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
        quote: 'I\'ve tried every decision journaling app. None come close to the depth and visual polish of LifeLedger. It\'s in a class of its own.',
        author: 'Marcus T.',
        role: 'Partner, Meridian Capital',
        avatar: 'MT',
        avatarGrad: 'linear-gradient(135deg, #d4af37, #f0c93a)',
    },
    {
        quote: 'The reflection check-ins are a game-changer. I can literally see which life areas I\'m thriving in vs guessing wrong.',
        author: 'Priya R.',
        role: 'Product Lead, Stripe',
        avatar: 'PR',
        avatarGrad: 'linear-gradient(135deg, #f472b6, #fb923c)',
    },
]

export function LandingPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <div className="premium-bg" />
            <div className="noise-overlay" />

            {/* ─── Nav ─── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backdropFilter: 'blur(24px)', background: 'rgba(6,6,9,0.75)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 18px rgba(99,102,241,0.5)',
                        fontSize: '0.85rem', fontWeight: 800, color: 'white',
                        fontFamily: 'DM Serif Display, serif', letterSpacing: '-0.02em',
                    }}>
                        LL
                    </div>
                    <span style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 400, fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>LifeLedger</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    <Link to="/pricing" className="landing-nav-link">Pricing</Link>
                    <Link to="/login" className="landing-nav-link">Sign In</Link>
                    <Link to="/signup" className="btn btn-primary btn-sm" style={{ borderRadius: 100, padding: '9px 22px' }}>Get started free</Link>
                </div>
            </nav>

            <main>
                {/* ─── Hero ─── */}
                <section style={{ padding: '180px 48px 100px', textAlign: 'center', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
                    <div className="hero-glow" />

                    {/* Pill badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
                        <div className="feature-chip">
                            <span className="chip-dot" />
                            Introducing Life Architecture
                        </div>
                    </div>

                    <h1 style={{
                        fontFamily: 'DM Serif Display, serif',
                        fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                        marginBottom: 28,
                        lineHeight: 1.06,
                        fontWeight: 400,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.04em',
                    }}>
                        Design your life by<br />
                        <span className="gradient-text">engineering your decisions.</span>
                    </h1>

                    <p style={{
                        color: 'var(--text-secondary)', fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                        maxWidth: 640, margin: '0 auto 52px', lineHeight: 1.7, fontWeight: 400,
                    }}>
                        Stop guessing. Start architecting. LifeLedger combines cognitive science with AI to reveal the hidden patterns behind every choice you make.
                    </p>

                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/signup" className="btn btn-primary btn-lg" style={{ borderRadius: 100, padding: '17px 40px', fontSize: '1rem', gap: 10 }}>
                            Begin Your Journey <ArrowRight size={18} />
                        </Link>
                        <Link to="/pricing" className="btn btn-secondary btn-lg" style={{ borderRadius: 100, padding: '17px 40px', fontSize: '1rem' }}>
                            Explore Pro Tools
                        </Link>
                    </div>

                    {/* Floating mockup hint */}
                    <div style={{ marginTop: 72, display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 20, padding: '20px 28px', backdropFilter: 'blur(20px)',
                            display: 'flex', gap: 24, alignItems: 'center',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.06)',
                        }} className="float">
                            {[
                                { label: 'AI Score', value: '8.4/10', color: '#818cf8' },
                                { label: 'Clarity', value: '94%', color: '#34d399' },
                                { label: 'Bias Risk', value: 'Low', color: '#d4af37' },
                            ].map(m => (
                                <div key={m.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: m.color, fontFamily: 'DM Serif Display, serif' }}>{m.value}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Stats Bar ─── */}
                <section style={{ padding: '60px 48px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="stats-bar" style={{ maxWidth: 800, margin: '0 auto' }}>
                        {STATS.map((s, i) => (
                            <>
                                <div key={s.label} style={{ textAlign: 'center', padding: '0 20px' }}>
                                    <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontFamily: 'DM Serif Display, serif', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
                                </div>
                                {i < STATS.length - 1 && <div className="stat-divider" key={`div-${i}`} />}
                            </>
                        ))}
                    </div>
                </section>

                {/* ─── Features Bento Grid ─── */}
                <section className="section-padding" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <div className="feature-chip" style={{ marginBottom: 20 }}>
                            <BarChart3 size={13} /> Six precision tools
                        </div>
                        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16, color: 'var(--text-primary)' }}>
                            Built for high-stakes clarity.
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
                            Six instruments, engineered together. Bridge the gap between intent and outcome.
                        </p>
                    </div>

                    {/* Bento layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: 20 }}>
                        {/* Large card 1 */}
                        <div className="bento-card" style={{ gridColumn: 'span 1', gridRow: 'span 2', padding: 44, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 18,
                                background: `linear-gradient(135deg, ${FEATURES[0].color}25, ${FEATURES[0].color}08)`,
                                border: `1px solid ${FEATURES[0].color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 28, boxShadow: `0 0 30px ${FEATURES[0].color}20`
                            }}>
                                <Brain size={28} style={{ color: FEATURES[0].color }} />
                            </div>
                            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.7rem', marginBottom: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>{FEATURES[0].title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.75, flex: 1 }}>{FEATURES[0].desc}</p>
                            <div style={{ marginTop: 28, padding: '16px 20px', background: `${FEATURES[0].color}08`, border: `1px solid ${FEATURES[0].color}18`, borderRadius: 12 }}>
                                <div style={{ fontSize: '0.78rem', color: FEATURES[0].color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>AI CONFIDENCE</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ width: '78%', height: '100%', background: `linear-gradient(90deg, ${FEATURES[0].color}, #c4b5fd)`, borderRadius: 3 }} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: FEATURES[0].color }}>78%</span>
                                </div>
                            </div>
                        </div>

                        {/* Small cards row 1 */}
                        {FEATURES.slice(1, 3).map(f => {
                            const Icon = f.icon
                            return (
                                <div key={f.title} className="bento-card" style={{ padding: 32 }}>
                                    <div style={{
                                        width: 46, height: 46, borderRadius: 14,
                                        background: `${f.color}15`, border: `1px solid ${f.color}25`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                                    }}>
                                        <Icon size={22} style={{ color: f.color }} />
                                    </div>
                                    <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', marginBottom: 10, color: 'var(--text-primary)' }}>{f.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                                </div>
                            )
                        })}

                        {/* Small cards row 2 */}
                        {FEATURES.slice(3, 5).map(f => {
                            const Icon = f.icon
                            return (
                                <div key={f.title} className="bento-card" style={{ padding: 32 }}>
                                    <div style={{
                                        width: 46, height: 46, borderRadius: 14,
                                        background: `${f.color}15`, border: `1px solid ${f.color}25`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                                    }}>
                                        <Icon size={22} style={{ color: f.color }} />
                                    </div>
                                    <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', marginBottom: 10, color: 'var(--text-primary)' }}>{f.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                                </div>
                            )
                        })}

                        {/* Large card 2 */}
                        <div className="bento-card" style={{ gridColumn: '3', gridRow: '2', padding: 36, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                width: 46, height: 46, borderRadius: 14,
                                background: `${FEATURES[5].color}15`, border: `1px solid ${FEATURES[5].color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
                            }}>
                                <Star size={22} style={{ color: FEATURES[5].color }} />
                            </div>
                            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', marginBottom: 10, color: 'var(--text-primary)' }}>{FEATURES[5].title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{FEATURES[5].desc}</p>
                        </div>
                    </div>
                </section>

                {/* ─── Testimonials ─── */}
                <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 48px' }}>
                        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 12, color: 'var(--text-primary)' }}>
                            Trusted by clarity-seekers.
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            from founders to partners to product leads
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 20, padding: '8px 48px 24px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {TESTIMONIALS.map(t => (
                            <div key={t.author} className="testimonial-card">
                                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="#d4af37" style={{ color: '#d4af37' }} />
                                    ))}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>
                                    "{t.quote}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%',
                                        background: t.avatarGrad,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                                    }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.author}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section style={{ padding: '120px 48px', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative rings */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '600px', height: '600px', borderRadius: '50%',
                        border: '1px solid rgba(99,102,241,0.08)', pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '900px', height: '900px', borderRadius: '50%',
                        border: '1px solid rgba(99,102,241,0.04)', pointerEvents: 'none'
                    }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

                    <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'var(--gold-dim)', border: '1px solid rgba(212,175,55,0.25)',
                            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
                            fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.05em'
                        }}>
                            <Shield size={12} /> Privacy-first. No data selling. Ever.
                        </div>

                        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2.2rem, 6vw, 4rem)', marginBottom: 20, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                            The best time to start<br />
                            <span className="gradient-text">was a year ago.</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginBottom: 48, maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.7 }}>
                            The second best time is today. Join thousands of high-performers architecting their futures.
                        </p>
                        <Link to="/signup" className="btn btn-primary btn-lg" style={{ borderRadius: 100, padding: '18px 52px', fontSize: '1.05rem', gap: 10 }}>
                            Initialize Your Ledger <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>

            {/* ─── Footer ─── */}
            <footer style={{ padding: '64px 48px 40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, background: 'var(--bg-primary)' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 800, color: 'white',
                        }}>LL</div>
                        <span style={{ fontFamily: 'DM Serif Display, serif', fontWeight: 400, fontSize: '1.2rem', color: 'var(--text-primary)' }}>LifeLedger</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 280, lineHeight: 1.7 }}>
                        The cognitive operating system for your most important decisions. Built for the ambitious.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 72 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-primary)' }}>Product</span>
                        <Link to="/pricing" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pricing</Link>
                        <Link to="/patterns" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Patterns</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-primary)' }}>Legal</span>
                        <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Privacy</a>
                        <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Terms</a>
                    </div>
                </div>
                <div style={{ width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2025 LifeLedger. All rights reserved.</span>
                </div>
            </footer>
        </div>
    )
}
