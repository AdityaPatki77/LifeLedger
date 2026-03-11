import { Link } from 'react-router-dom'
import { Brain, TrendingUp, Clock, CheckCircle, Zap, ArrowRight, Star } from 'lucide-react'

// Feature list
const FEATURES = [
    { icon: Brain, title: 'AI Decision Architecture', desc: 'GPT-4 scoring, cognitive bias detection, and devil\'s advocate perspectives for deep clarity.', color: 'var(--accent)' },
    { icon: Clock, title: 'Multi-Stage Reflection', desc: 'Automated 1m, 3m, 6m, and 1y check-ins. Discover which choices actually led to long-term joy.', color: '#f472b6' },
    { icon: TrendingUp, title: 'Pattern Intelligence', desc: 'Advanced analytics correlating your energy, category, and mental models with outcome success.', color: 'var(--gold)' },
    { icon: CheckCircle, title: 'Decision Journal + Calendar', desc: 'A beautiful, searchable visual history of your life\'s trajectory. Perfect for annual reviews.', color: '#4ade80' },
    { icon: Zap, title: 'Mental Model Library', desc: 'Structure your thinking with Pros/Cons, 10-10-10, and Eisenhower matrices. Think like a stoic.', color: '#818cf8' },
    { icon: Star, title: 'Outcome Tracking', desc: 'Bridge the gap between "intent" and "result." Log final outcomes to train your intuition.', color: '#fb923c' },
]

export function LandingPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <div className="premium-bg" />

            {/* Nav */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backdropFilter: 'var(--glass-blur)', background: 'var(--glass-bg)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px var(--accent-glow)' }}>
                        <Zap size={18} style={{ color: 'white' }} />
                    </div>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}>LifeLedger</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Sign In</Link>
                    <Link to="/signup" className="btn btn-primary btn-sm" style={{ borderRadius: 100, padding: '10px 24px' }}>Get Started</Link>
                </div>
            </nav>

            <main className="stagger-in">
                {/* Hero */}
                <section style={{ padding: '180px 48px 120px', textAlign: 'center', maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
                    <div className="hero-glow" />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', borderRadius: 100, padding: '8px 20px', marginBottom: 32, fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em' }}>
                        <Star size={14} fill="currentColor" /> INTRODUCING LIFE ARCHITECTURE
                    </div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)', marginBottom: 28, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 800 }}>
                        Design your life by <br />
                        <span className="gradient-text">engineering your decisions.</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', maxWidth: 700, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 400 }}>
                        Stop journaling. Start architecting. LifeLedger combines cognitive science with AI to reveal the hidden patterns behind your choices.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/signup" className="btn btn-primary btn-lg" style={{ gap: 12, borderRadius: 100, padding: '18px 40px', fontSize: '1.1rem' }}>
                            Begin Your Journey <ArrowRight size={20} />
                        </Link>
                        <Link to="/pricing" className="btn btn-secondary btn-lg" style={{ borderRadius: 100, padding: '18px 40px', fontSize: '1.1rem' }}>
                            Explore Pro Tools
                        </Link>
                    </div>
                </section>

                {/* Social proof */}
                <div style={{ textAlign: 'center', paddingBottom: 100, opacity: 0.7 }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 20 }}>Trusted by clarity-seekers at</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', filter: 'grayscale(1) brightness(1.5)' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Inter' }}>MASTERCLASS</span>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Inter' }}>MONZO</span>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Inter' }}>STRIPE</span>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Inter' }}>REVOLUT</span>
                    </div>
                </div>

                {/* Features */}
                <section className="section-padding" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', marginBottom: 16, fontWeight: 700 }}>Built for high-stakes clarity.</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '1.1rem' }}>Six precision tools designed to bridge the gap between intent and outcome.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
                        {FEATURES.map(f => {
                            const Icon = f.icon
                            return (
                                <div key={f.title} className="card" style={{ padding: 40, minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: `1px solid ${f.color}25` }}>
                                            <Icon size={26} style={{ color: f.color }} />
                                        </div>
                                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: 12, fontWeight: 600 }}>{f.title}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{f.desc}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* CTA */}
                <section className="section-padding" style={{ textAlign: 'center', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', position: 'relative' }}>
                    <div style={{ maxWidth: 800, margin: '0 auto' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: 24, fontWeight: 800 }}>
                            The best time to start <br />
                            <span className="gradient-text">was a year ago.</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: 48, maxWidth: 540, margin: '0 auto 48px' }}>
                            The second best time is today. Join thousands of high-performers who are architecting their future.
                        </p>
                        <Link to="/signup" className="btn btn-primary btn-lg" style={{ borderRadius: 100, padding: '20px 48px' }}>
                            Initialize Your Ledger
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer style={{ padding: '60px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, background: 'var(--bg-primary)' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <Zap size={20} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: '1.2rem' }}>LifeLedger</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 300 }}>
                        The cognitive operating system for your most important decisions. Built for the ambitious.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 80 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>Product</span>
                        <Link to="/pricing" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pricing</Link>
                        <Link to="/patterns" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Patterns</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>Legal</span>
                        <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Privacy</a>
                        <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
