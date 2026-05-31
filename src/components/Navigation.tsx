import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Dashboard' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/reports', label: 'Reports' },
  { path: '/settings', label: 'Settings' }
];

const Navigation = () => {
  return (
    <nav className="glass-card p-4 mb-6 shadow-glow">
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-neon text-slate-950 shadow-[0_0_20px_rgba(57,197,255,0.18)]'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`
            }
            end={tab.path === '/'}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
