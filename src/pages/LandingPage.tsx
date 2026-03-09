import { Link } from 'react-router-dom'
import { Brain, TrendingUp, Clock, CheckCircle, Zap, ArrowRight, Star } from 'lucide-react'

const FEATURES = [
    { icon: Brain, title: 'AI Decision Architecture', desc: 'GPT-4 scoring, cognitive bias detection, and devil\'s advocate perspectives for deep clarity.', color: 'var(--accent)' },
    { icon: Clock, title: 'Multi-Stage Reflection', desc: 'Automated 1m, 3m, 6m, and 1y check-ins. Discover which choices actually led to long-term joy.', color: '#f472b6' },
    { icon: TrendingUp, title: 'Pattern Intelligence', desc: 'Advanced analytics correlating your energy, category, and mental models with outcome success.', color: 'var(--gold)' },
    { icon: CheckCircle, title: 'Decision Journal + Calendar', desc: 'A beautiful, searchable visual history of your life\'s trajectory. Perfect for annual reviews.', color: '#4ade80' },
    { icon: Zap, title: 'Mental Model Library', desc: 'Structure your thinking with Pros/Cons, 10-10-10, and Eisenhower matrices. Think like a stoic.', color: '#818cf8' },
    { icon: Star, title: 'Outcome Tracking', desc: 'Bridge the gap between "intent" and "result." Log final outcomes to train your intuition.', color: '#fb923c' },
]

const STEPS = [
    { num: '01', title: 'Log your decision', desc: 'Fill in what you decided, your reasoning, alternatives you considered, and how you feel.' },
    { num: '02', title: 'Get instant AI analysis', desc: 'GPT-4 analyzes your decision quality, detects biases, and gives a devil\'s advocate perspective.' },
    { num: '03', title: 'Receive reflection prompts', desc: 'At 1 month, 3 months, 6 months, and 1 year — we ask: how did it go? Rate your happiness.' },
    { num: '04', title: 'Discover your patterns', desc: 'Over time, see which categories make you happiest and when you make your best decisions.' },
]

export function LandingPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* Nav */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backdropFilter: 'blur(20px)', background: 'rgba(10,10,10,0.8)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={16} style={{ color: 'white' }} />
                    </div>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem' }}>LifeLedger</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                    <Link to="/signup" className="btn btn-primary btn-sm">Start Free</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: '140px 48px 100px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-dim)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 24, fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500 }}>
                    <Zap size={13} /> Your Life Operating System
                </div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.2rem, 6vw, 4rem)', marginBottom: 20, lineHeight: 1.1 }}>
                    Your decisions shape your life.{' '}
                    <span className="gradient-text">Start understanding them.</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.7 }}>
                    Log major life decisions, get instant AI analysis, and discover 6 months later what actually made you happy. Think of it as a life operating system, not a journal.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/signup" className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                        Start Free — No CC Required <ArrowRight size={18} />
                    </Link>
                    <Link to="/pricing" className="btn btn-secondary btn-lg">
                        See How It Works
                    </Link>
                </div>
                <p style={{ marginTop: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Free forever · 7-day Pro trial · No credit card
                </p>
            </section>

            {/* Social proof */}
            <div style={{ textAlign: 'center', paddingBottom: 80 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />)}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Trusted by <strong style={{ color: 'var(--text-primary)' }}>2,400+</strong> decision-makers across India</p>
            </div>

            {/* Features */}
            <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Everything you need to make better decisions</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>6 powerful features working together to reveal what truly makes you happy.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {FEATURES.map(f => {
                        const Icon = f.icon
                        return (
                            <div key={f.title} className="card" style={{ padding: 28 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <Icon size={22} style={{ color: f.color }} />
                                </div>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* How it works */}
            <section style={{ padding: '80px 48px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 860, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>How LifeLedger works</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                        {STEPS.map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: 'var(--accent)', opacity: 0.4, marginBottom: 12 }}>{s.num}</div>
                                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', marginBottom: 8 }}>{s.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: '80px 48px', maxWidth: 960, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: 12 }}>Real results from real decisions</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {[
                        { quote: "LifeLedger made me realize that 80% of my anxiety about decisions disappears when I write them down and see them analyzed.", name: "Priya S.", role: "Product Manager, Bangalore" },
                        { quote: "The 6-month reflection feature is genuinely mind-blowing. I was sure I'd regret my career switch — I don't. And I have the data to prove it.", name: "Arjun M.", role: "Engineer turned Founder, Pune" },
                        { quote: "I discovered that my Finance decisions always have the highest happiness score. Never would have guessed this. Changed how I prioritize.", name: "Kavya R.", role: "CFO, Mumbai" },
                    ].map((t, i) => (
                        <div key={i} className="card" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                                {[...Array(5)].map((_, j) => <Star key={j} size={14} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />)}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>"{t.quote}"</p>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '80px 48px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: 16 }}>
                    Your decisions are already shaping your life.
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
                    Start understanding them. It's free, takes 2 minutes to set up, and might be the best decision you make this year.
                </p>
                <Link to="/signup" className="btn btn-primary btn-lg">
                    Start Free — Take Control <ArrowRight size={18} />
                </Link>
                <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free forever · 7-day Pro trial included</p>
            </section>

            {/* Footer */}
            <footer style={{ padding: '32px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={16} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>LifeLedger</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2025 LifeLedger. Built for better decisions.</p>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Link to="/pricing" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pricing</Link>
                    <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sign In</Link>
                </div>
            </footer>
        </div>
    )
}
