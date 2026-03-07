import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Globe2,
  LayoutDashboard,
  Leaf,
  Lock,
  Menu,
  MessageSquareQuote,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import logoImg from '../assets/ecovolt-logo.png';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function HomeGateway() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Parallax effects
  const yHeroBg = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jump = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-200 selection:bg-cyan-500/30 font-sans overflow-x-hidden">

      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-700/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation Layer */}
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${isScrolled
          ? 'bg-[#0a1120]/95 backdrop-blur-xl border-white/10 shadow-lg py-3'
          : 'bg-transparent border-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-3 items-center">
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative flex items-center shrink-0">
                <div className="absolute inset-0 bg-cyan-400 rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                <img src={logoImg} alt="EcoVolt Logo" className="w-10 h-10 rounded-xl border border-white/10 relative z-10" />
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-white shrink-0">EcoVolt</span>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 text-lg font-medium text-slate-300">
            {['Platform', 'Solutions', 'Customers', 'Pricing'].map((item) => (
              <button
                key={item}
                onClick={() => jump(item.toLowerCase())}
                className="hover:text-cyan-300 transition-colors py-2 relative group whitespace-nowrap"
              >
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-[2px] bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </button>
            ))}
          </nav>

          <div className="flex items-center justify-end"></div>
        </div>
      </motion.header>

      <main className="relative z-10 pt-44 lg:pt-56 pb-16 flex flex-col gap-12">

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto w-full px-6 lg:px-8 relative mt-32">
          <motion.div className="flex flex-col items-center text-center w-full">

            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="flex flex-col items-center"
              >
                <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1] ">
                  Intelligent <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">energy</span> surveillance.
                </motion.h1>

                <motion.p variants={fadeIn} className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                  Transform massive campuses into hyper-efficient ecosystems. EcoVolt detects hidden waste, automates controls, and slashes electricity bills through military-grade analytics.
                </motion.p>

                <motion.div variants={fadeIn} className="flex justify-center w-full">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex justify-center flex-row items-center gap-3 rounded-2xl bg-gradient-to-b from-cyan-400 to-cyan-600 hover:to-cyan-500 text-slate-950 py-4 sm:py-5 text-lg sm:text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(34,211,238,0.35)] w-full max-w-[320px] sm:max-w-[420px]"
                  >
                    Open Platform <ArrowRight size={24} />
                  </button>
                </motion.div>

                <motion.div variants={fadeIn} className="mt-14 flex items-center justify-center gap-4 text-sm text-slate-400 font-medium">
                  <p>Trusted by <span className="text-slate-200 font-bold">500+</span> campuses worldwide</p>

                </motion.div>
              </motion.div>
            </div>

            {/* Hero text takes full width now */}
          </motion.div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section id="platform" className="max-w-7xl mx-auto px-6 lg:px-8 mt-32 scroll-mt-32 w-full">
          <div className="mb-16 md:text-center w-full">
            <h2 className="text-cyan-400 font-semibold tracking-wide uppercase text-sm mb-3">The Platform</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for precision. Designed for scale.</h3>
            <p className="text-lg text-slate-400">Stop guessing where your energy goes. EcoVolt maps your entire infrastructure and highlights anomalies in real-time, right down to the plug.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Big Bento 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-900/40 p-8 overflow-hidden relative group h-full"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-700/10 blur-[80px] rounded-full group-hover:bg-cyan-600/10 transition-colors" />
              <div className="relative z-10 w-full md:w-2/3">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-6 border border-cyan-400/20">
                  <MonitorSmartphone className="text-cyan-400" size={24} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">Live Infrastructure Topology</h4>
                <p className="text-slate-400 leading-relaxed mb-8">View every building, floor, room, and appliance on a single unified canvas. Instantly spot what's drawing power and what shouldn't be.</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={18} className="text-cyan-400" /> Interactive Heatmaps</li>
                  <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={18} className="text-cyan-400" /> Granular Device Telemetry</li>
                  <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={18} className="text-cyan-400" /> Ghost Device Tracking</li>
                </ul>
              </div>
            </motion.div>

            {/* Small Bento 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 flex flex-col justify-between group h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                  <BellRing className="text-red-400" size={24} />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Threat & Waste Alerts</h4>
                <p className="text-slate-400 text-sm leading-relaxed">AI-driven anomaly detection flags unusual consumption spikes before they hit your monthly bill.</p>
              </div>
              <div className="mt-8 p-4 rounded-xl border border-red-500/20 bg-red-950/30 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse shrink-0" />
                <p className="text-xs text-red-200">Alert: Computer Lab B showing 4.2kWh phantom load after hours.</p>
              </div>
            </motion.div>

            {/* Small Bento 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 group h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                <Leaf className="text-emerald-400" size={24} />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Automated ESG Auditing</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Generate one-click compliance reports. Track your carbon reduction metrics over time to prove campus sustainability goals.</p>
            </motion.div>

            {/* Big Bento 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-900/40 p-8 overflow-hidden"
            >
              <div className="max-w-2xl">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                  <Zap className="text-blue-400" size={24} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">Instant Action Automation</h4>
                <p className="text-slate-400 leading-relaxed mb-6">Don't just monitor—control. Set operational rules to automatically shut down entire zones when occupancy sensors detect zero activity.</p>
                <button className="text-blue-400 font-semibold text-sm flex items-center gap-1 hover:text-blue-300 transition-colors">
                  Explore Automation Rules <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>

          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="customers" className="max-w-7xl mx-auto px-6 lg:px-8 mt-40 scroll-mt-32 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 w-full">
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by the best</h2>
              <p className="text-slate-400">Hear how operational leaders are transforming their campuses from massive energy sinks into highly efficient grids.</p>
            </div>
            <button className="shrink-0 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold hover:bg-white/10 transition-colors">Read all case studies</button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "EcoVolt paid for itself in month one. The ghost-view feature revealed three entire computer labs running 24/7 without anyone noticing.",
                author: "Dr. Sarah Jenkins",
                role: "Director of Facilities, Tech University",
                bg: "bg-slate-900/40",
                avatar: "https://i.pravatar.cc/100?img=47"
              },
              {
                quote: "We used to rely on manual sweeps by security guards to turn off lights. Now, the system handles it automatically based on occupancy trends.",
                author: "Michael Chang",
                role: "Operations Head, Nexus Corp",
                bg: "bg-slate-900/40",
                avatar: "https://i.pravatar.cc/100?img=14"
              },
              {
                quote: "The visual heatmap makes it incredibly easy to show the board exactly where our sustainability budget is going and the literal impact it has.",
                author: "Elena Rodriguez",
                role: "Chief Sustainability Officer",
                bg: "bg-cyan-900/20 border-cyan-500/20",
                avatar: "https://i.pravatar.cc/100?img=32"
              }
            ].map((t, i) => (
              <div key={i} className={`rounded-3xl border border-white/10 p-8 flex flex-col justify-between h-full ${t.bg}`}>
                <MessageSquareQuote className="text-cyan-400 mb-6 opacity-50" size={32} />
                <p className="text-slate-300 text-lg leading-relaxed mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border border-slate-500/60"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 lg:px-8 mt-40 scroll-mt-32 w-full py-20">
          <div className="text-center w-full mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">Start for free, then scale when your campus needs advanced automation and longer telemetry retention.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch w-full max-w-5xl mx-auto mt-16">
            {/* Starter */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-8 lg:p-10 flex flex-col space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Starter</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Perfect for pilot rollouts and single buildings.</p>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-500"> /mo forever</span>
              </div>
              <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 font-semibold hover:bg-white/5 transition-colors">Start Free</button>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-500 shrink-0" /> 1 Campus Location</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-500 shrink-0" /> Basic Dashboard & Alerts</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-500 shrink-0" /> 7-day data retention</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border-2 border-cyan-500/50 bg-slate-900/80 p-8 lg:p-10 relative shadow-[0_0_40px_rgba(34,211,238,0.1)] flex flex-col space-y-6">
              <div className="inline-flex self-start bg-cyan-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">Professional</h3>
                <p className="text-slate-400 text-sm leading-relaxed">For growing institutions requiring advanced controls.</p>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-slate-500"> /month</span>
              </div>
              <button className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/25">Upgrade to Pro</button>
              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-cyan-400 shrink-0" /> Up to 5 Campuses</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-cyan-400 shrink-0" /> Automated Action Rules</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-cyan-400 shrink-0" /> Ghost Device Detection</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-cyan-400 shrink-0" /> 1-Year data retention</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-8 lg:p-10 flex flex-col space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Enterprise</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Custom architecture for city-scale deployments.</p>
              </div>
              <div>
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
              <button className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-3 font-semibold hover:bg-white/5 transition-colors">Contact Sales</button>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-500 shrink-0" /> Unlimited Campuses</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-500 shrink-0" /> On-premise deployment</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-500 shrink-0" /> Dedicated success manager</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 mt-52 mb-28">
          <div className="rounded-[3rem] p-12 lg:p-16 border border-cyan-500/20 bg-[linear-gradient(110deg,#09101d_0%,#0c1d33_100%)] relative overflow-hidden text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stop leaking energy. Start optimizing today.</h2>
              <p className="text-lg text-slate-400 mb-10">Join hundreds of facilities managers who trust EcoVolt to secure their infrastructure and hit sustainability targets.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-white text-slate-950 px-8 py-4 font-bold text-lg hover:bg-slate-100 transition-colors shadow-xl">Deploy Free Setup</button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#060b14] pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoImg} alt="EcoVolt" className="w-8 h-8 rounded-lg border border-white/20" />
                <span className="text-lg font-bold text-white">EcoVolt</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-8">
                The modern standard for physical infrastructure surveillance and automated energy conservation.
              </p>
              <div className="flex items-center gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors"><span className="font-bold text-sm">X</span></div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors"><span className="font-bold text-sm">in</span></div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors"><span className="font-bold text-sm">GH</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Live Map</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Ghost Detection</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Automations</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} EcoVolt Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}

// Helper icon component since lucide-react Activity might be named differently depending on version, fallback to a generic shape if needed, but we imported LayoutDashboard
const ActivityIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
