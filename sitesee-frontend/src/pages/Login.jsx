import { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { HomeModernIcon, ArrowRightIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";

// Magic UI Components
import Particles from "../components/magicui/Particles";
import ShineBorder from "../components/magicui/ShineBorder";
import ShimmerButton from "../components/magicui/ShimmerButton";

const Login = () => {
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

      login(userData, token);

      if (userData.role === 'SCOUT') {
        navigate("/scout");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert("Login Failed: " + (err.response?.data?.error || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans text-slate-800 p-4 relative overflow-hidden bg-slate-950">

      {/* Animated Particles Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={120}
        staticity={30}
        ease={70}
        size={0.5}
        color="#3b82f6"
        vx={0.1}
        vy={0.05}
      />

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-transparent to-purple-950/30 z-[1]"></div>

      {/* Login Card with Shine Border */}
      <ShineBorder
        borderRadius={24}
        borderWidth={2}
        duration={10}
        color={["#3b82f6", "#8b5cf6", "#06b6d4"]}
        className="relative z-10 !bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-blue-500/10 !p-0 w-full max-w-md"
      >
        <div className="p-8 sm:p-10 animate-fade-in">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full"></div>
              <div className="relative bg-gradient-to-tr from-blue-600 to-cyan-400 text-white p-4 rounded-2xl shadow-lg">
                <HomeModernIcon className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">SiteSee</h1>
            <p className="text-slate-400 font-medium mt-2 text-center">Monitor your construction projects.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-slate-400 mb-2 uppercase">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-800/80 border border-slate-700/50 p-4 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-800 transition-all duration-300 outline-none shadow-inner placeholder:text-slate-500"
                placeholder="client@sitesee.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-wider text-slate-400 mb-2 uppercase">Password</label>
              <input
                type="password"
                className="w-full bg-slate-800/80 border border-slate-700/50 p-4 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-800 transition-all duration-300 outline-none shadow-inner placeholder:text-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <ShimmerButton
              type="submit"
              disabled={loading}
              shimmerColor="#60a5fa"
              shimmerSize="0.1em"
              shimmerDuration="2.5s"
              borderRadius="12px"
              background="linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)"
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
                  Access Dashboard
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
                </span>
              )}
            </ShimmerButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              New Client? <Link to="/register" className="text-blue-400 cursor-pointer hover:text-blue-300 hover:underline font-bold transition">Create Account</Link>
            </p>
          </div>

          {/* Scout Section */}
          <div className="mt-8 border-t border-slate-700/50 pt-6">
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">For Scouts</p>

              <Link
                to="/scout-login"
                className="w-full group flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2.5 rounded-lg text-amber-400">
                    <BriefcaseIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-amber-300 transition">Scout Login</p>
                    <p className="text-[11px] text-slate-400">Access your scout dashboard</p>
                  </div>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </Link>

              <p className="text-xs text-slate-500 font-medium">
                Want to join? <Link to="/scout-join" className="text-amber-400 cursor-pointer hover:text-amber-300 hover:underline font-bold transition">Apply as Scout</Link>
              </p>
            </div>
          </div>

        </div>
      </ShineBorder>
    </div>
  );
};

export default Login;