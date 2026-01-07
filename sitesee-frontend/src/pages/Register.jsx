// src/pages/Register.jsx
import { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { HomeModernIcon, UserPlusIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Send Register Request (Default role is CLIENT)
      const res = await api.post("/auth/register", { 
        ...formData,
        role: "CLIENT" 
      });
      
      // 2. Auto-Login immediately after signing up
      login(res.data.user, res.data.token);
      alert("Account created successfully!");
      navigate("/dashboard");
      
    } catch (err) {
      alert("Registration Failed: " + (err.response?.data?.error || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans text-slate-800 bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 selection:bg-blue-200 p-4">
      
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-linear-to-tr from-blue-600 to-indigo-600 text-white p-3 rounded-2xl shadow-lg mb-4">
            <HomeModernIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Start managing your projects today.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Full Name</label>
            <input name="full_name" placeholder="John Doe" className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Phone Number</label>
            <input name="phone_number" placeholder="055..." className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Email Address</label>
            <input name="email" type="email" placeholder="name@example.com" className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} required />
          </div>
          
          <div>
             <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Password</label>
            <input name="password" type="password" placeholder="••••••••" className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} required />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? "Creating Account..." : "Sign Up"}
            {!loading && <UserPlusIcon className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Already have an account? <Link to="/" className="text-blue-600 cursor-pointer hover:underline font-bold">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;