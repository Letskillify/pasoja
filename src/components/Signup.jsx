import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, displayName);
      navigate(redirectPath);
    } catch {
      setError("Failed to create account. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col justify-center items-center relative overflow-hidden px-5 py-12">
      {/* Autofill styles to prevent chrome default light blue overlay */}
      <style dangerouslySetInnerHTML={{
        __html: `
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #0d0d0d inset !important;
            -webkit-text-fill-color: #ffffff !important;
            caret-color: #ffffff !important;
          }
        `
      }} />

      {/* Decorative luxury gradient background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#c9a962]/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#c9a962]/[0.02] blur-[120px] pointer-events-none" />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all duration-300"
      >
        <span className="text-xs">←</span> Back to Home
      </Link>

      <div className="w-full max-w-[1100px] grid lg:grid-cols-12 gap-12 lg:gap-0 border border-white/5 bg-[#0a0a0a] min-h-[580px] z-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
        {/* Left Side styling: Editorial brand layout */}
        <div className="lg:col-span-5 bg-[#0d0d0d] p-8 md:p-12 lg:p-14 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 mix-blend-overlay bg-[radial-gradient(#c9a962_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-10">
              <img src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png" alt="Pasoja" className="h-9 object-contain brightness-0 invert" />
            </Link>
          </div>
          
          <div className="relative z-10 my-auto">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#c9a962]">Signature Edit</span>
            <h1 className="text-3xl md:text-4xl font-light text-white tracking-[0.16em] uppercase leading-[1.25] mt-3 mb-5">
              Begin Your<br />Style Journey
            </h1>
            <div className="w-8 h-[1px] bg-[#c9a962]/50" />
            <p className="text-[12px] text-white/35 leading-relaxed mt-5 max-w-xs">
              Create an exclusive account to track shipments, compile wishlist edits, and speed up checks.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <span className="text-[9px] text-white/20 uppercase tracking-widest font-medium">© PASOJA ATELIER</span>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="lg:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-between bg-[#0a0a0a]">
          {/* Top segment matching logo height alignment */}
          <div className="relative z-10 h-9 flex items-center">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/35">ATELIER MEMBERSHIP</span>
          </div>

          {/* Middle segment matching central narrative */}
          <div className="max-w-[400px] w-full relative z-10 my-auto py-8">
            <div className="mb-6">
              <h2 className="text-xl font-light text-white tracking-[0.2em] uppercase">Create Account</h2>
              <p className="text-[11px] text-[#c9a962] tracking-wider font-medium mt-1">NEW REGISTER INQUIRY</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                  <div className="p-3.5 bg-red-950/20 border border-red-900/30 flex items-start gap-3 text-red-400 text-[11px]">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" required
                    className="w-full pl-10 pr-4 py-3 bg-[#0d0d0d] border border-white/5 text-xs text-white outline-none focus:border-[#c9a962]/40 transition-all duration-300 placeholder:text-white/20 uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" required
                    className="w-full pl-10 pr-4 py-3 bg-[#0d0d0d] border border-white/5 text-xs text-white outline-none focus:border-[#c9a962]/40 transition-all duration-300 placeholder:text-white/20 uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full pl-10 pr-10 py-3 bg-[#0d0d0d] border border-white/5 text-xs text-white outline-none focus:border-[#c9a962]/40 transition-all duration-300 placeholder:text-white/20"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c9a962]/60 hover:text-[#c9a962] transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-white hover:bg-white/90 text-black font-semibold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <><span>Create Account</span><ArrowRight size={13} /></>
                )}
              </button>
            </form>
          </div>

          {/* Bottom segment matching copyright height baseline */}
          <div className="relative z-10 pt-6">
            <span className="text-[12px] text-white/20 tracking-wider">
              Already have an account?{" "}
              <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-white font-bold hover:text-white/60 transition-colors uppercase text-[11px] tracking-wider ml-1">Sign in</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
