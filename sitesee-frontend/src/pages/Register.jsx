import { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { HomeModernIcon, UserPlusIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";

// Magic UI Components
import Particles from "../components/magicui/Particles";
import ShineBorder from "../components/magicui/ShineBorder";
import ShimmerButton from "../components/magicui/ShimmerButton";
import AnimatedGradient from "../components/magicui/AnimatedGradient";
import GridPattern from "../components/magicui/GridPattern";

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        ...formData,
        role: "CLIENT"
      });

      login(res.data.user, res.data.token);
      alert("Account created successfully!");
      navigate("/dashboard");

    } catch (err) {
      alert("Registration Failed: " + (err.response?.data?.error || "Server Error"));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none ${darkMode
      ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
    }`;

  const labelClasses = `block text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-slate-400' : 'text-gray-500'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans p-4 relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>

      {/* Background Effects */}
      {darkMode ? (
        <>
          <Particles
            className="absolute inset-0 z-0"
            quantity={80}
            staticity={30}
            ease={70}
            size={0.4}
            color="#8b5cf6"
            vx={0.06}
            vy={0.03}
          />
          <div className="absolute inset-0 z-[1]">
            <AnimatedGradient
              colors={["#8b5cf6", "#3b82f6", "#06b6d4"]}
              speed={12}
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
          <div className="absolute inset-0 gradient-mesh z-[1]" />
        </>
      )}

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

      {/* Register Card */}
      <ShineBorder
        borderRadius={28}
        borderWidth={2}
        duration={12}
        color={darkMode ? ["#8b5cf6", "#3b82f6", "#06b6d4"] : ["#8b5cf6", "#a78bfa", "#c4b5fd"]}
        className={`relative z-10 !p-0 w-full max-w-md transition-all duration-500 ${darkMode
            ? '!bg-slate-900/90 backdrop-blur-2xl border-white/10 shadow-2xl shadow-purple-500/10'
            : '!bg-white/90 backdrop-blur-2xl border-gray-200/80 shadow-2xl shadow-gray-900/10'
          }`}
      >
        <div className="p-8 sm:p-10 animate-fade-up">

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className={`absolute inset-0 blur-2xl opacity-50 rounded-full ${darkMode ? 'bg-purple-500' : 'bg-purple-400'}`} />
              <div className="relative bg-gradient-to-br from-purple-500 to-blue-500 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/30">
                <HomeModernIcon className="h-8 w-8" />
              </div>
            </div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Account
            </h1>
            <p className={`text-sm font-medium text-center ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Start monitoring your projects today.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className={labelClasses}>Full Name</label>
              <input
                name="full_name"
                placeholder="John Doe"
                className={inputClasses}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className={labelClasses}>Phone Number</label>
              <input
                name="phone_number"
                placeholder="055 123 4567"
                className={inputClasses}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className={labelClasses}>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className={inputClasses}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className={labelClasses}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className={inputClasses}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <ShimmerButton
                type="submit"
                disabled={loading}
                shimmerColor={darkMode ? "#a78bfa" : "#8b5cf6"}
                shimmerSize="0.08em"
                shimmerDuration="2.5s"
                borderRadius="14px"
                background={darkMode
                  ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                }
                className="w-full font-bold text-sm disabled:opacity-60 gap-2 !py-4"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign Up
                    <UserPlusIcon className="h-4 w-4" />
                  </span>
                )}
              </ShimmerButton>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
              Already have an account?{' '}
              <Link
                to="/"
                className={`font-semibold transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </ShineBorder>
    </div>
  );
};

export default Register;