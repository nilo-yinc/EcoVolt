import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Lock, User, ArrowRight, Activity, Cpu } from 'lucide-react';
import logoImg from '../assets/ecovolt-logo.png';
import { Spotlight } from '../components/ui/spotlight';
import { BackgroundBeams } from '../components/ui/background-beams';

export default function LandingPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGuestLoading, setIsGuestLoading] = useState(false);
    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGuestLogin = async () => {
        setError('');
        setIsGuestLoading(true);
        try {
            await loginAsGuest();
            navigate('/');
        } catch (err) {
            setError('Failed to login as guest');
            setIsGuestLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center relative overflow-hidden selection:bg-cyan-500/30">
            {/* Background Effects */}
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(34, 211, 238, 0.2)" />
            <BackgroundBeams />

            {/* Content Container */}
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center">

                {/* Logo & Branding */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center mb-10 text-center"
                >
                    <div className="relative mb-6 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <img src={logoImg} alt="EcoVolt Logo" className="w-20 h-20 rounded-2xl relative border border-white/10 shadow-2xl" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                        Eco<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Volt</span>
                    </h1>
                    <p className="text-[var(--text-3)] font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={14} className="text-cyan-400" />
                        Campus Energy Surveillance
                        <Cpu size={14} className="text-cyan-400" />
                    </p>
                </motion.div>

                {/* Main Auth Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-[#0e1525]/80 backdrop-blur-xl border border-white/[0.05] p-8 rounded-3xl shadow-2xl relative overflow-hidden">

                        {/* Decorative corner accents */}
                        <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/10 rounded-br-full blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-tl-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <Shield className="w-5 h-5 text-cyan-400" />
                                <h2 className="text-xl font-semibold text-white">System Access</h2>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-mono text-[var(--text-3)] uppercase tracking-wider mb-2">Operator ID</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-[var(--text-4)] group-focus-within:text-cyan-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-white/[0.06] rounded-xl bg-black/40 text-white placeholder-[var(--text-4)] focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
                                            placeholder="Enter ID (Admin)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-[var(--text-3)] uppercase tracking-wider mb-2">Access Code</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-[var(--text-4)] group-focus-within:text-cyan-400 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-white/[0.06] rounded-xl bg-black/40 text-white placeholder-[var(--text-4)] focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
                                            placeholder="Enter password"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-500/20 p-3 rounded-lg flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isGuestLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Authenticate <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 mb-4 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/[0.06]"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-[#0e1525] text-[var(--text-4)] font-mono uppercase tracking-widest">Or</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGuestLogin}
                                disabled={isSubmitting || isGuestLoading}
                                className="w-full group relative flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-500/30 text-[var(--text-2)] hover:text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
                            >
                                {/* Subtle hover sweep effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent group-hover:animate-shimmer" />

                                {isGuestLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] transition-all" />
                                        <span>Continue as Guest User</span>
                                    </>
                                )}
                            </button>

                            <p className="mt-6 text-center text-[10px] font-mono text-[var(--text-4)]">
                                SECURE CONNECTION · FASTAPI BACKEND PENDING
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer specs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-6 w-full text-center flex justify-center items-center gap-6 text-[10px] font-mono text-[var(--text-4)]"
                >
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> SYSTEMS ONLINE</span>
                    <span>V 1.0.4-BETA</span>
                    <span>ENCRYPTION: AES-256</span>
                </motion.div>
            </div>

            {/* Shimmer animation keyframe */}
            <style jsx="true">{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
}
