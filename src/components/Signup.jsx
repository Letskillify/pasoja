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
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-center items-center relative overflow-hidden px-5 py-12">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-black transition-all duration-300"
      >
        <span className="text-xs">←</span> Back to Home
      </Link>

      <div className="w-full max-w-[1100px] grid lg:grid-cols-12 gap-12 lg:gap-0 border border-zinc-200 bg-white min-h-[580px] z-10 shadow-xl">
        {/* Left Side styling: Editorial brand layout */}
        <div className="lg:col-span-5 bg-[#f4f1ea] p-8 md:p-12 lg:p-14 flex flex-col justify-between border-r border-zinc-200 relative overflow-hidden text-zinc-900">
          <div className="relative z-10">
            <Link to="/" className="inline-block mb-10">
              <img src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png" alt="Pasoja" className="h-9 object-contain brightness-0" />
            </Link>
          </div>
          
          <div className="relative z-10 my-auto">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#b8860b]">Signature Edit</span>
            <h1 className="text-3xl md:text-4xl font-light text-zinc-900 tracking-[0.16em] uppercase leading-[1.25] mt-3 mb-5">
              Begin Your<br />Style Journey
            </h1>
            <div className="w-8 h-[1px] bg-[#b8860b]/50" />
            <p className="text-[12px] text-zinc-600 leading-relaxed mt-5 max-w-xs">
              Create an exclusive account to track shipments, compile wishlist edits, and speed up checks.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-medium">© PASOJA ATELIER</span>
          </div>
        </div>

        {/* Right Side: Form details */}
        <div className="lg:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-between bg-white text-zinc-900">
          {/* Top segment matching logo height alignment */}
          <div className="relative z-10 h-9 flex items-center">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-zinc-400">ATELIER MEMBERSHIP</span>
          </div>

          {/* Middle segment matching central narrative */}
          <div className="max-w-[400px] w-full relative z-10 my-auto py-8">
            <div className="mb-6">
              <h2 className="text-xl font-light text-zinc-900 tracking-[0.2em] uppercase">Create Account</h2>
              <p className="text-[11px] text-[#b8860b] tracking-wider font-medium mt-1">NEW REGISTER INQUIRY</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                  <div className="p-3.5 bg-red-50 border border-red-200 flex items-start gap-3 text-red-600 text-[11px]">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-zinc-500 transition-all duration-300 placeholder:text-zinc-400 uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" required
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-zinc-500 transition-all duration-300 placeholder:text-zinc-400 uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-300 text-xs text-zinc-900 outline-none focus:border-zinc-500 transition-all duration-300 placeholder:text-zinc-400"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-semibold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Create Account</span><ArrowRight size={13} /></>
                )}
              </button>
            </form>
          </div>

          {/* Bottom segment matching copyright height baseline */}
          <div className="relative z-10 pt-6">
            <span className="text-[12px] text-zinc-500 tracking-wider">
              Already have an account?{" "}
              <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-zinc-900 font-bold hover:text-black transition-colors uppercase text-[11px] tracking-wider ml-1">Sign In</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
