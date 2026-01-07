// src/pages/Login.jsx
import { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { HomeModernIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // ... inside Login.jsx

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await api.post("/auth/login", { 
        email,
        password,
      });
      
      const userData = res.data.user;
      login(userData, res.data.token);

      // --- NEW LOGIC HERE ---
      if (userData.role === 'SCOUT') {
        navigate("/scout");
      } else {
        navigate("/dashboard");
      }
      // ----------------------
      
    } catch (err) {
      alert("Login Failed: " + (err.response?.data?.error || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans text-slate-800 bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 selection:bg-blue-200 p-4">
      
      {/* Glass Card */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-12 w-full max-w-md animate-fade-in-up">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-linear-to-tr from-slate-700 to-slate-900 text-white p-3 rounded-2xl shadow-lg mb-4">
            <HomeModernIcon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">SiteSee</h1>
          <p className="text-slate-500 font-medium mt-2 text-center">Monitor your construction projects from anywhere.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white/50 border border-white/60 p-3.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
             <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/50 border border-white/60 p-3.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none shadow-sm"
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

        <div className="mt-8 text-center">
  <p className="text-xs text-slate-400 font-medium">
    Don't have an account? <Link to="/register" className="text-blue-600 cursor-pointer hover:underline font-bold">Create Account</Link>
  </p>
</div>
      </div>

    </div>
  );
};

export default Login;