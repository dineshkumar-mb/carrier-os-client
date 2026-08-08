import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Send, User, Settings, Bot, LogOut, Sparkles, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
        isActive
          ? 'bg-zinc-800/80 text-white shadow-sm glow-accent border border-zinc-700/50'
          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
      }`
    }
  >
    <Icon className="w-4.5 h-4.5 mr-3 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
    {label}
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-900 bg-[#0c0c0e] flex flex-col justify-between">
        <div className="flex flex-col flex-1">
          {/* Header Brand */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-900/80 gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight block text-zinc-100 leading-none">Carrier-OS</span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wide uppercase">AI Career System</span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Overview" />
            <SidebarItem to="/jobs" icon={Briefcase} label="Job Discovery" />
            <SidebarItem to="/interview" icon={Bot} label="AI Interview prep" />
            <SidebarItem to="/applications" icon={Send} label="Application Tracker" />
            <SidebarItem to="/resumes" icon={FileText} label="Resumes & Tailor" />
          </nav>
        </div>

        {/* Footer Account Details */}
        <div className="p-4 border-t border-zinc-900/80 bg-[#0a0a0c] space-y-1">
          <SidebarItem to="/profile" icon={User} label="Profile" />
          <SidebarItem to="/settings" icon={Settings} label="Settings" />
          
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-red-400 rounded-lg transition-all duration-200 mt-1 border border-transparent"
          >
            <LogOut className="w-4.5 h-4.5 mr-3 text-zinc-500 group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#09090b]">
        {/* Top Header Navigation */}
        <header className="h-16 border-b border-zinc-900/80 flex items-center justify-between px-8 bg-[#0c0c0e]/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <span className="text-xs text-zinc-400 font-medium">Copilot Agent Online</span>
          </div>

          {/* Theme Toggle Button & User Profile */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Control (Light / Dark / System) */}
            <div className="flex items-center gap-1 bg-[#141622] border border-white/10 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setTheme('light')}
                title="Light Mode"
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  theme === 'light' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title="Dark Mode"
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  theme === 'dark' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                title="System Theme"
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  theme === 'system' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Candidate User Name & Avatar */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="text-right">
                <span className="text-xs font-semibold text-zinc-200 block">{user?.name || 'Candidate'}</span>
                <span className="text-[10px] text-zinc-500 block leading-none">{user?.email}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 border border-indigo-400/30 flex items-center justify-center text-sm font-bold text-white shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Outlet */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
