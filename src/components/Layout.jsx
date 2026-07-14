import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { auth } from '../lib/api'

const NAV = [
  { to: '/', label: 'Facilities', end: true, icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6' },
  { to: '/staff', label: 'Staff', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { to: '/pharmacy', label: 'Store & Medication', icon: 'M4 7h16M4 7l1 12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l1-12M9 7V5a3 3 0 0 1 6 0v2' },
  { to: '/diseases', label: 'Diseases Treated', icon: 'M12 21C7 17 3 13 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 13 17 17 12 21z' },
  { to: '/disease-map', label: 'Disease Mapping', icon: 'M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15' },
]

export default function Layout() {
  const nav = useNavigate()
  const logout = () => { auth.clear(); nav('/login', { replace: true }) }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      {/* sidebar */}
      <aside className="hidden flex-col border-r border-[var(--color-line)] bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M10 21v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[var(--color-heading)]">Nasarawa State</div>
            <div className="text-[11px] text-[var(--color-muted)]">Koko PHC Dashboard</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-dark)]'
                    : 'text-[var(--color-body)] hover:bg-[var(--color-surface)]'
                }`
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.icon} />
              </svg>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-line)] px-3 py-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-body)] hover:bg-[var(--color-surface)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-col">
        {/* mobile top bar */}
        <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white text-xs font-bold">N</div>
            <span className="text-sm font-semibold">Nasarawa · Koko PHC</span>
          </div>
          <button onClick={logout} className="text-sm font-medium text-[var(--color-brand)]">Sign out</button>
        </header>

        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-[var(--color-line)] bg-white px-3 py-2 lg:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-dark)]' : 'text-[var(--color-body)]'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-[var(--color-line)] px-6 py-4 text-center text-xs text-[var(--color-muted)]">
          Nasarawa State Government · Powered by Koko EMR &amp; Calm Global
        </footer>
      </div>
    </div>
  )
}
