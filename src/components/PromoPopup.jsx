import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [notify, setNotify] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed or submitted the popup in this session
    const hasBeenDismissed = sessionStorage.getItem('pasoja_promo_dismissed');
    if (hasBeenDismissed) return;

    // Show popup 8 seconds after website loading
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('pasoja_promo_dismissed', 'true');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    sessionStorage.setItem('pasoja_promo_dismissed', 'true');
    setTimeout(() => {
      setIsVisible(false);
    }, 2500);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
      onClick={handleClose}
    >
      {/* Modal Card */}
      <div 
        className="relative bg-white max-w-3xl w-full rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-zinc-900 border border-zinc-200 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-1.5 rounded-full bg-white/90 md:bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
          aria-label="Close popup"
        >
          <X size={18} />
        </button>

        {/* Left Column: Visual Banner Graphic */}
        <div className="md:col-span-6 relative bg-black min-h-[240px] md:min-h-[460px] flex items-center justify-center overflow-hidden group">
          <img
            src="https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317398/yastxilcsghbsdmkcp2x.jpg"
            alt="Pasoja Sale Campaign"
            className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Graphical Poster Typography Overlay */}
          <div className="relative z-10 p-6 text-center text-white space-y-2 flex flex-col items-center justify-end h-full">
            <span className="px-3 py-1 bg-[#b8860b] text-white font-black text-[9px] uppercase tracking-[0.25em] rounded-sm shadow-md flex items-center gap-1">
              <Sparkles size={11} /> PASOJA COUTURE
            </span>

            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none text-white drop-shadow-md">
              PASOJA SALE
            </h3>
            
            <div className="w-full py-1.5 bg-black/85 text-[#c9a962] border border-[#c9a962]/40 font-black text-xs md:text-sm uppercase tracking-[0.25em] shadow-lg my-1">
              LIVE NOW
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-300">
              
            </span>
          </div>
        </div>

        {/* Right Column: Lead Form */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center relative bg-white">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-amber-50 text-[#b8860b] border border-amber-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check size={28} strokeWidth={2.5} />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 uppercase tracking-wide">You're On The List!</h4>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                Thank you for joining Pasoja Couture. Use code <span className="font-mono font-bold text-[#b8860b] bg-amber-50 px-2.5 py-1 border border-amber-200 rounded">PASOJA15</span> 
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Text */}
              <div>
                <h4 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-1.5">
                  Pasoja Sale is LIVE <span className="text-base">✨</span>
                </h4>
                <p className="text-xs text-zinc-600 mt-1 leading-snug">
                  Your favourite luxury fits just dropped. <br />
                  <span className="font-semibold text-zinc-800">Log in and claim your discount 💖</span>
                </p>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Phone Input with +91 Country Code */}
                <div className="flex gap-2">
                  <span className="px-3 py-2.5 bg-zinc-100 border border-zinc-300 rounded-lg text-xs font-bold text-zinc-700 flex items-center justify-center shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter Mobile Number*"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-black focus:bg-white transition-all"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email*"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-black focus:bg-white transition-all"
                  />
                </div>

                {/* Birthday Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Birthday (DD-MM-YYYY)"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-black focus:bg-white transition-all"
                  />
                </div>

                {/* Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer accent-black"
                  />
                  <span className="text-[11px] text-zinc-600 font-medium">
                    Notify me for any updates & offers
                  </span>
                </label>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#505050] hover:bg-black text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all duration-300 shadow-md active:scale-[0.99] mt-2 cursor-pointer"
                >
                  Join Us
                </button>
              </form>

              {/* Footer Terms Micro-text */}
              <p className="text-[10px] text-zinc-400 text-center leading-normal pt-1">
                By logging in, you're agreeing to our{' '}
                <Link to="/privacy" onClick={handleClose} className="underline text-zinc-600 hover:text-black">
                  Privacy Policy
                </Link>{' '}
                &{' '}
                <Link to="/terms" onClick={handleClose} className="underline text-zinc-600 hover:text-black">
                  Terms of Service
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;
