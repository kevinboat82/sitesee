import { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { UserCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";

// Magic UI Components
import Particles from "../components/magicui/Particles";
import ShineBorder from "../components/magicui/ShineBorder";
import ShimmerButton from "../components/magicui/ShimmerButton";

const ScoutLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });

            const userData = res.data.user;
            const token = res.data.token;

            if (userData.role !== 'SCOUT') {
                alert("This login is for Scouts only. Please use the main login.");
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
        <div className="min-h-screen flex items-center justify-center font-sans text-slate-800 p-4 relative overflow-hidden bg-slate-950">

            {/* Animated Particles Background - Amber theme for Scouts */}
            <Particles
                className="absolute inset-0 z-0"
                quantity={100}
                staticity={30}
                ease={70}
                size={0.5}
                color="#f59e0b"
                vx={0.1}
                vy={0.05}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/50 via-transparent to-orange-950/30 z-[1]"></div>

            {/* Login Card with Shine Border */}
            <ShineBorder
                borderRadius={24}
                borderWidth={2}
                duration={10}
                color={["#f59e0b", "#ea580c", "#fbbf24"]}
                className="relative z-10 !bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-amber-500/10 !p-0 w-full max-w-md"
            >
                <div className="p-8 sm:p-10">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-amber-500 blur-xl opacity-50 rounded-full"></div>
                            <div className="relative bg-gradient-to-tr from-amber-600 to-orange-400 text-white p-4 rounded-2xl shadow-lg">
                                <UserCircleIcon className="h-8 w-8" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Scout Login</h1>
                        <p className="text-slate-400 font-medium mt-2 text-center">Access your scout dashboard.</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold tracking-wider text-slate-400 mb-2 uppercase">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-slate-800/80 border border-slate-700/50 p-4 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-slate-800 transition-all duration-300 outline-none shadow-inner placeholder:text-slate-500"
                                placeholder="scout@sitesee.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold tracking-wider text-slate-400 mb-2 uppercase">Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-800/80 border border-slate-700/50 p-4 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-slate-800 transition-all duration-300 outline-none shadow-inner placeholder:text-slate-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <ShimmerButton
                            type="submit"
                            disabled={loading}
                            shimmerColor="#fbbf24"
                            shimmerSize="0.1em"
                            shimmerDuration="2.5s"
                            borderRadius="12px"
                            background="linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #c2410c 100%)"
                            className="w-full font-bold text-sm disabled:opacity-70 gap-2"
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
                                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
                                </span>
                            )}
                        </ShimmerButton>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Not a scout? <Link to="/" className="text-amber-400 cursor-pointer hover:text-amber-300 hover:underline font-bold transition">Client Login</Link>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-500 font-medium">
                            Want to join? <Link to="/scout-join" className="text-amber-400 cursor-pointer hover:text-amber-300 hover:underline font-bold transition">Apply as Scout</Link>
                        </p>
                    </div>

                </div>
            </ShineBorder>
        </div>
    );
};

export default ScoutLogin;
