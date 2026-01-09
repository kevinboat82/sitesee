import { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { HomeModernIcon, ArrowRightIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";

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
    // UPDATED: Background Image with Overlay
    <div 
      className="min-h-screen flex items-center justify-center font-sans text-slate-800 p-4 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1563166423-482a8c14b2d6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

      {/* Glass Card (Z-Index ensures it sits on top) */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-12 w-full max-w-md animate-fade-in-up">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-linear-to-tr from-slate-700 to-slate-900 text-white p-3 rounded-2xl shadow-lg mb-4">
            <HomeModernIcon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SiteSee</h1>
          <p className="text-slate-600 font-medium mt-2 text-center">Monitor your construction projects.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Email Address</label>
            <input
              type="email"
              className="w-full bg-white/70 border border-white/60 p-3.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white transition outline-none shadow-sm placeholder:text-slate-400"
              placeholder="client@sitesee.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
             <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Password</label>
            <input
              type="password"
              className="w-full bg-white/70 border border-white/60 p-3.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:bg-white transition outline-none shadow-sm placeholder:text-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2 group disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Access Dashboard"}
            {!loading && <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 font-medium">
            New Client? <Link to="/register" className="text-blue-700 cursor-pointer hover:underline font-bold">Create Account</Link>
          </p>
        </div>

        {/* Scout Section */}
        <div className="mt-8 border-t border-slate-300/60 pt-6">
            <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Work with us</p>
                
                <Link 
                    to="/scout-join"
                    className="w-full group flex items-center justify-between p-3 rounded-xl border border-yellow-200 bg-yellow-50/80 hover:bg-yellow-100 transition cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                            <BriefcaseIcon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-yellow-800 transition">Become a Scout</p>
                            <p className="text-[10px] text-slate-600">Join the team & earn money</p>
                        </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 group-hover:text-yellow-600 transition" />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;