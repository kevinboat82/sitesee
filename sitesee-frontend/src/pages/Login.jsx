import { useState, useContext, useEffect, useRef } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader, Briefcase, Sun, Moon } from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import confetti from "canvas-confetti";

// --- CONFETTI COMPONENT ---
const Confetti = ({ manualstart = false, ...rest }) => {
  const instanceRef = useRef(null);

  const canvasRef = (node) => {
    if (node !== null && !instanceRef.current) {
      instanceRef.current = confetti.create(node, { resize: true, useWorker: true });
    }
  };

  return <canvas ref={canvasRef} {...rest} />;
};

// --- BLUR FADE ANIMATION ---
function BlurFade({ children, className, duration = 0.4, delay = 0, yOffset = 6, blur = "6px" }) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: "-50px" });

  const variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: 0, opacity: 1, filter: `blur(0px)` },
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={inViewResult ? "visible" : "hidden"} variants={variants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// --- GRADIENT BACKGROUND ---
const GradientBackground = ({ darkMode }) => (
  <>
    <style>
      {`@keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-15px, 15px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(15px, -15px); } 100% { transform: translate(0, 0); } }`}
    </style>
    <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: darkMode ? '#3b82f6' : '#60a5fa', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: darkMode ? '#06b6d4' : '#22d3ee', stopOpacity: 0.5 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: darkMode ? '#8b5cf6' : '#a78bfa', stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: darkMode ? '#ec4899' : '#f472b6', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: darkMode ? '#f59e0b' : '#fbbf24', stopOpacity: 0.5 }} />
        </linearGradient>
        <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: darkMode ? '#10b981' : '#34d399', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: darkMode ? '#3b82f6' : '#60a5fa', stopOpacity: 0.3 }} />
        </radialGradient>
        <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
        <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
        <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50" /></filter>
      </defs>
      <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
        <ellipse cx="150" cy="480" rx="280" ry="200" fill="url(#grad1)" filter="url(#blur1)" transform="rotate(-25 150 480)" />
        <rect x="480" y="80" width="320" height="280" rx="100" fill="url(#grad2)" filter="url(#blur2)" transform="rotate(12 640 220)" />
      </g>
      <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
        <circle cx="680" cy="420" r="170" fill="url(#grad3)" filter="url(#blur3)" opacity="0.6" />
        <ellipse cx="80" cy="120" rx="200" ry="140" fill={darkMode ? '#8b5cf620' : '#c4b5fd30'} filter="url(#blur2)" opacity="0.7" />
      </g>
    </svg>
  </>
);

// --- GOOGLE ICON ---
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-5 h-5">
    <g fillRule="evenodd" fill="none">
      <g fillRule="nonzero" transform="translate(3, 2)">
        <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"></path>
        <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"></path>
        <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"></path>
        <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"></path>
      </g>
    </g>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, user, authLoading } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const confettiRef = useRef(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'SCOUT') navigate("/scout");
      else if (user.role === 'ADMIN') navigate("/admin");
      else navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const fireConfetti = () => {
    const canvas = confettiRef.current;
    if (canvas) {
      const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899']
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.user;
      const token = res.data.token;

      login(userData, token);
      setLoginSuccess(true);
      fireConfetti();

      setTimeout(() => {
        if (userData.role === 'SCOUT') navigate("/scout");
        else if (userData.role === 'ADMIN') navigate("/admin");
        else navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = /\S+@\S+\.\S+/.test(email);

  return (
    <div className={cn("min-h-screen w-full flex flex-col transition-colors duration-500", darkMode ? "bg-[#0a0a0a]" : "bg-gray-100")}>

      {/* Confetti Canvas */}
      <canvas ref={confettiRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]" />

      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <GradientBackground darkMode={darkMode} />
      </div>



      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">

        {/* Logo Header */}
        <BlurFade delay={0.1} className="mb-8">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              darkMode ? "bg-blue-500" : "bg-blue-600"
            )}>
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
            </div>
            <span className={cn("text-xl font-bold", darkMode ? "text-white" : "text-gray-900")}>
              SiteSee
            </span>
          </div>
        </BlurFade>

        {/* Glass Card */}
        <BlurFade delay={0.2} className="w-full max-w-sm">
          <div className={cn(
            "rounded-3xl p-8 backdrop-blur-2xl border transition-all duration-500",
            darkMode
              ? "bg-white/5 border-white/10 shadow-2xl shadow-black/20"
              : "bg-white/70 border-white/50 shadow-2xl shadow-gray-900/10"
          )}>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className={cn("text-2xl font-bold mb-2", darkMode ? "text-white" : "text-gray-900")}>
                Welcome Back
              </h2>
              <p className={cn("text-sm", darkMode ? "text-white/60" : "text-gray-500")}>
                Sign in to monitor your properties
              </p>
            </div>

            {/* Social Login */}
            <div className="mb-6">
              <button className={cn(
                "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-medium transition-all duration-300",
                darkMode
                  ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
              )}>
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <hr className={cn("flex-1", darkMode ? "border-white/10" : "border-gray-200")} />
              <span className={cn("text-xs font-medium", darkMode ? "text-white/40" : "text-gray-400")}>OR</span>
              <hr className={cn("flex-1", darkMode ? "border-white/10" : "border-gray-200")} />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
                darkMode
                  ? "bg-white/5 border border-white/10 focus-within:border-blue-500/50 focus-within:bg-white/10"
                  : "bg-gray-50 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white"
              )}>
                <Mail className={cn("h-5 w-5 flex-shrink-0", darkMode ? "text-white/40" : "text-gray-400")} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "flex-1 bg-transparent outline-none text-sm",
                    darkMode ? "text-white placeholder:text-white/40" : "text-gray-900 placeholder:text-gray-400"
                  )}
                />
              </div>

              {/* Password */}
              <div className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
                darkMode
                  ? "bg-white/5 border border-white/10 focus-within:border-blue-500/50 focus-within:bg-white/10"
                  : "bg-gray-50 border border-gray-200 focus-within:border-blue-500 focus-within:bg-white"
              )}>
                <Lock className={cn("h-5 w-5 flex-shrink-0", darkMode ? "text-white/40" : "text-gray-400")} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "flex-1 bg-transparent outline-none text-sm",
                    darkMode ? "text-white placeholder:text-white/40" : "text-gray-900 placeholder:text-gray-400"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn("p-1 rounded-lg transition-colors", darkMode ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-gray-600")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-red-500 text-sm px-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {loginSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-green-500 text-sm py-2"
                  >
                    <PartyPopper className="h-5 w-5" />
                    <span className="font-medium">Welcome back!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || loginSuccess}
                className={cn(
                  "w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2",
                  loading || loginSuccess
                    ? "bg-blue-500/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
                )}
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : loginSuccess ? (
                  <>
                    <PartyPopper className="h-5 w-5" />
                    Success!
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className={cn("text-center text-sm mt-6", darkMode ? "text-white/50" : "text-gray-500")}>
              Don't have an account?{" "}
              <Link to="/register" className={cn("font-semibold transition-colors", darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700")}>
                Sign up free
              </Link>
            </p>
          </div>
        </BlurFade>

        {/* Scout Login */}
        <BlurFade delay={0.3} className="mt-8">
          <Link
            to="/scout-login"
            className={cn(
              "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 backdrop-blur-sm",
              darkMode
                ? "bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40"
                : "bg-amber-50 border border-amber-200 hover:border-amber-300"
            )}
          >
            <div className={cn("p-2.5 rounded-xl", darkMode ? "bg-amber-500/20" : "bg-amber-100")}>
              <Briefcase className={cn("h-5 w-5", darkMode ? "text-amber-400" : "text-amber-600")} />
            </div>
            <div>
              <p className={cn("font-semibold", darkMode ? "text-white" : "text-gray-900")}>Scout Access</p>
              <p className={cn("text-sm", darkMode ? "text-white/50" : "text-gray-500")}>Login to your scout dashboard</p>
            </div>
            <ArrowRight className={cn("h-5 w-5 ml-2", darkMode ? "text-amber-400" : "text-amber-600")} />
          </Link>
        </BlurFade>

        {/* User Avatars */}
        <BlurFade delay={0.4} className="mt-10 flex flex-col items-center">
          <p className={cn("text-sm mb-3", darkMode ? "text-white/50" : "text-gray-500")}>
            Trusted by <span className={cn("font-semibold", darkMode ? "text-white" : "text-gray-900")}>property owners</span> across Ghana
          </p>
          <div className="flex -space-x-2">
            {[
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="user"
                className={cn(
                  "w-10 h-10 rounded-full object-cover border-2",
                  darkMode ? "border-[#0a0a0a]" : "border-gray-100"
                )}
              />
            ))}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2",
              darkMode
                ? "bg-blue-500/20 text-blue-400 border-[#0a0a0a]"
                : "bg-blue-50 text-blue-600 border-gray-100"
            )}>
              +99
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  );
};

export default Login;