import { CheckCircle2, Search, Bell, Sun, Menu } from 'lucide-react';

const AdminHeader = ({ activeItem, searchVal, setSearchVal, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between pb-5 border-b border-zinc-200 mb-8 bg-[#faf9f5]">
      <div className="flex items-center gap-3 md:gap-6 flex-1 max-w-lg">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-200/60"
        >
          <Menu size={18} />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products, orders..."
            value={searchVal || ''}
            onChange={(e) => setSearchVal?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* View Store link */}
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-1.5 border border-zinc-300 bg-white text-zinc-700 hover:text-black hover:border-black text-xs font-semibold rounded-lg transition-all shadow-sm"
        >
          View Store &nearr;
        </a>

        {/* Notifications and Profile */}
        <button className="p-2 text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-200/60 relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center text-xs font-bold text-zinc-900 uppercase overflow-hidden shadow-sm">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" alt="Profile" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-zinc-900 leading-none">Admin</p>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
