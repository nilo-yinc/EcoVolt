import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import logoImg from '../assets/ecovolt-logo.png';

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const demoEmail = 'admin@ecovolt.demo';
    const demoPassword = 'EcoVolt@123';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) {
                setError('Auth API not found. Restart FastAPI and try again.');
            } else {
                setError(err?.response?.data?.detail || err?.message || 'Login failed');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const fillDemoAccount = () => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError('');
    };

    return (
        <div className="min-h-screen bg-[#0b1220] flex items-center justify-center relative overflow-hidden selection:bg-sky-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_85%_85%,rgba(30,64,175,0.12),transparent_35%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.75),rgba(2,6,23,0.92))]" />

            {/* Content Container */}
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center py-12">

                {/* Logo & Branding */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center mb-10 text-center"
                >
                    <div className="relative mb-6 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/30 to-blue-500/30 rounded-2xl blur opacity-50 transition duration-700"></div>
                        <img src={logoImg} alt="EcoVolt Logo" className="w-20 h-20 rounded-2xl relative border border-white/15 shadow-2xl" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                        Eco<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Volt</span>
                    </h1>
                    <p className="text-slate-400 text-sm tracking-wide">
                        Sign in to access the EcoVolt platform
                    </p>
                </motion.div>

                {/* Main Auth Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-[#111b2e]/85 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_60px_rgba(2,6,23,0.55)] relative overflow-hidden">

                        {/* Decorative corner accents */}
                        <div className="absolute top-0 left-0 w-20 h-20 bg-sky-500/10 rounded-br-full blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-tl-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <Shield className="w-5 h-5 text-sky-400" />
                                <h2 className="text-xl font-semibold text-white">System Access</h2>
                            </div>
                            <div className="mb-5 border border-sky-500/25 bg-sky-500/10 rounded-lg px-3 py-3">
                                <p className="text-xs text-slate-200/90 mb-2">
                                    Demo credentials are fixed for now.
                                </p>
                                <button
                                    type="button"
                                    onClick={fillDemoAccount}
                                    className="text-xs font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-2"
                                >
                                    Use demo: admin@ecovolt.demo / EcoVolt@123
                                </button>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#0a1426] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all text-sm"
                                            placeholder="admin@ecovolt.demo"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#0a1426] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all text-sm"
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-red-300 text-xs bg-red-900/30 border border-red-500/30 p-3 rounded-lg flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-sky-500/25 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
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
                        </div>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
