import { useState, useContext, useEffect } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { BriefcaseIcon, ArrowRightIcon, ArrowLeftIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";

// Magic UI Components
import Particles from "../components/magicui/Particles";
import ShineBorder from "../components/magicui/ShineBorder";
import ShimmerButton from "../components/magicui/ShimmerButton";
import AnimatedGradient from "../components/magicui/AnimatedGradient";
import GridPattern from "../components/magicui/GridPattern";

const ScoutLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, user, authLoading } = useContext(AuthContext);
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'SCOUT') {
                navigate("/scout");
            } else if (user.role === 'ADMIN') {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        }
    }, [user, authLoading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });

            const userData = res.data.user;
            const token = res.data.token;

            // Verify this is a scout account
            if (userData.role !== 'SCOUT') {
                alert("This login is for Scouts only. Please use the Client login.");
                setLoading(false);
                return;
            }

            login(userData, token);
            navigate("/scout");

        } catch (err) {
            console.error(err);
            alert("Login Failed: " + (err.response?.data?.error || "Server Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center font-sans p-4 relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>

            {/* Background Effects */}
            {darkMode ? (
                <>
                    <Particles
                        className="absolute inset-0 z-0"
                        quantity={100}
                        staticity={30}
                        ease={70}
                        size={0.4}
                        color="#f59e0b"
                        vx={0.08}
                        vy={0.04}
                    />
                    <div className="absolute inset-0 z-[1]">
                        <AnimatedGradient
                            colors={["#f59e0b", "#ea580c", "#dc2626"]}
                            speed={10}
                            blur="heavy"
                        />
                    </div>
                </>
            ) : (
                <>
                    <GridPattern
                        width={32}
                        height={32}
                        className="absolute inset-0 z-0 opacity-40"
                    />
                    <div className="absolute inset-0 z-[1]" style={{
                        background: `
              radial-gradient(at 40% 20%, rgba(245, 158, 11, 0.15) 0, transparent 50%),
              radial-gradient(at 80% 0%, rgba(234, 88, 12, 0.1) 0, transparent 50%),
              radial-gradient(at 0% 50%, rgba(251, 191, 36, 0.1) 0, transparent 50%)
            `
                    }} />
                </>
            )}

            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className={`absolute top-6 left-6 z-50 p-3 rounded-full transition-all duration-300 ${darkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900'
                    }`}
            >
                <ArrowLeftIcon className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button
                onClick={toggleDarkMode}
                className={`absolute top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 ${darkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900'
                    }`}
            >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* Login Card */}
            <ShineBorder
                borderRadius={28}
                borderWidth={2}
                duration={12}
                color={darkMode ? ["#f59e0b", "#ea580c", "#dc2626"] : ["#f59e0b", "#fbbf24", "#fcd34d"]}
                className={`relative z-10 !p-0 w-full max-w-md transition-all duration-500 ${darkMode
                        ? '!bg-slate-900/90 backdrop-blur-2xl border-white/10 shadow-2xl shadow-amber-500/10'
                        : '!bg-white/90 backdrop-blur-2xl border-gray-200/80 shadow-2xl shadow-gray-900/10'
                    }`}
            >
                <div className="p-8 sm:p-10 animate-fade-up">

                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-5">
                            <div className={`absolute inset-0 blur-2xl opacity-50 rounded-full ${darkMode ? 'bg-amber-500' : 'bg-amber-400'}`} />
                            <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-lg shadow-amber-500/30">
                                <BriefcaseIcon className="h-8 w-8" />
                            </div>
                        </div>
                        <img src="/scout-logo.png" alt="SiteSee Scout" className="h-10 w-auto mb-2" />
                        <p className={`text-sm font-medium text-center ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            Access your scout dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className={`block text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none ${darkMode
                                        ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:bg-white/10 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                placeholder="scout@sitesee.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className={`block text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                Password
                            </label>
                            <input
                                type="password"
                                className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none ${darkMode
                                        ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:bg-white/10 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <ShimmerButton
                            type="submit"
                            disabled={loading}
                            shimmerColor={darkMode ? "#fbbf24" : "#f59e0b"}
                            shimmerSize="0.08em"
                            shimmerDuration="2.5s"
                            borderRadius="14px"
                            background={darkMode
                                ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)"
                                : "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
                            }
                            className="w-full font-bold text-sm disabled:opacity-60 gap-2 !py-4"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Access Scout Dashboard
                                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </ShimmerButton>
                    </form>

                    {/* Signup Link */}
                    <div className="mt-6 text-center">
                        <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                            Want to become a scout?{' '}
                            <Link
                                to="/scout-join"
                                className={`font-semibold transition-colors ${darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
                            >
                                Apply Now
                            </Link>
                        </p>
                    </div>

                    {/* Client Login Link */}
                    <div className="mt-6 pt-6 border-t border-dashed text-center" style={{
                        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}>
                        <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                            Are you a property owner?{' '}
                            <Link
                                to="/"
                                className={`font-semibold transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                Client Login
                            </Link>
                        </p>
                    </div>

                </div>
            </ShineBorder>
        </div>
    );
};

export default ScoutLogin;
