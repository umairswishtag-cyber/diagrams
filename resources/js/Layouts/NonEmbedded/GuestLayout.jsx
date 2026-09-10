import { Link } from '@inertiajs/react';
import { Check, Network, Sparkles } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="auth-page">
            <aside className="auth-showcase">
                <div className="auth-showcase__glow auth-showcase__glow--one" />
                <div className="auth-showcase__glow auth-showcase__glow--two" />
                <Link href="/" className="auth-brand auth-brand--light" aria-label="FlowCraft home">
                    <span className="auth-brand__mark"><Network size={20} strokeWidth={2.2} /></span>
                    <span>FlowCraft</span>
                </Link>

                <div className="auth-showcase__content">
                    <span className="auth-kicker"><Sparkles size={14} /> Visual workspace</span>
                    <h1>Turn complex ideas into clear, shareable systems.</h1>
                    <p>Build polished diagrams, organize them across pages, and export everything in the format your team needs.</p>

                    <div className="auth-diagram-preview" aria-hidden="true">
                        <svg viewBox="0 0 560 270" preserveAspectRatio="none">
                            <defs>
                                <marker id="auth-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#a99eff" /></marker>
                            </defs>
                            <path d="M140 70 C210 70 190 134 260 134" />
                            <path d="M350 134 C420 134 400 202 468 202" />
                            <path d="M305 94 V70 C305 48 326 40 360 40" />
                        </svg>
                        <div className="auth-demo-node auth-demo-node--start"><i /><span>New idea</span></div>
                        <div className="auth-demo-node auth-demo-node--decision"><span>Review</span></div>
                        <div className="auth-demo-node auth-demo-node--share"><i /><span>Share</span></div>
                        <div className="auth-demo-note"><Check size={14} /><span>Ready to export</span></div>
                    </div>

                    <div className="auth-benefits">
                        <span><Check size={14} /> Multi-page canvas</span>
                        <span><Check size={14} /> Vector PDF export</span>
                        <span><Check size={14} /> Rich text & media</span>
                    </div>
                </div>

                <p className="auth-showcase__footer">Design workflows that are easy to understand.</p>
            </aside>

            <main className="auth-main">
                <Link href="/" className="auth-brand auth-brand--mobile" aria-label="FlowCraft home">
                    <span className="auth-brand__mark"><Network size={19} strokeWidth={2.2} /></span>
                    <span>FlowCraft</span>
                </Link>
                <section className="auth-card">{children}</section>
                <p className="auth-main__footer">Secure access to your visual workspace</p>
            </main>
        </div>
    );
}
