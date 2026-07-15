import { Link } from 'react-router-dom'
import { useApi, PageHead, StatCard, Card, Spinner, ErrorState, num } from '../components/ui'

const ALERT_ICON = {
  facility: 'M3 21h18M5 21V7l7-4 7 4v14',
  stock: 'M4 7h16l-1 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 7z',
  surveillance: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01',
  reporting: 'M4 4h16v16H4zM9 17v-6M12 17V7M15 17v-3',
}

export default function Overview() {
  const { data, error, loading, reload } = useApi('/state/overview')

  if (loading) return <Spinner label="Loading state overview…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const f = data.facilities, s = data.staff, p = data.pharmacy
  const alerts = data.alerts || []

  return (
    <div>
      <PageHead title="State Health Overview" subtitle="Nasarawa State · Koko PHC network — live snapshot" />

      {/* alerts */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
          <h3 className="text-sm font-semibold">Needs attention</h3>
          <span className="text-xs text-[var(--color-muted)]">{alerts.length} active</span>
        </div>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 px-5 py-6 text-sm text-[var(--color-ok)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            All clear — no active alerts across the state.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-line)]">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.severity === 'danger' ? 'bg-red-50 text-[var(--color-danger)]' : 'bg-amber-50 text-amber-700'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ALERT_ICON[a.type] || 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'} /></svg>
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--color-heading)]">{a.title}</div>
                  <div className="text-xs text-[var(--color-muted)]">{a.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* headline KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link to="/facilities"><StatCard label="Facilities" value={num(f.total)} tone="brand" hint={`${num(f.online)} online now`} /></Link>
        <Link to="/staff"><StatCard label="Health workers" value={num(s.total)} hint={`${num(s.online)} online`} /></Link>
        <StatCard label="Registered patients" value={num(data.patients)} />
        <StatCard label="Encounters (30d)" value={num(data.encounters30d)} tone="ok" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link to="/pharmacy"><StatCard label="Stock units" value={num(p.totalStockUnits)} hint={`${num(p.belowReorder)} below reorder`} tone={p.belowReorder ? 'warn' : 'default'} /></Link>
        <Link to="/surveillance"><StatCard label="Notifiable cases (30d)" value={num(data.surveillance.total)} tone={data.surveillance.highPriority ? 'danger' : 'default'} hint={`${num(data.surveillance.highPriority)} high-priority`} /></Link>
        <Link to="/reporting"><StatCard label="Report submission" value={`${num(data.reporting.rate)}%`} hint={`${num(data.reporting.submitted)}/${num(data.reporting.expected)} facilities`} /></Link>
        <Link to="/facilities"><StatCard label="Silent facilities" value={num(f.silentMonth)} tone={f.silentMonth ? 'danger' : 'default'} hint="> 30 days" /></Link>
      </div>

      {/* facility status + top LGAs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Facility reporting status</h3>
          <div className="space-y-2">
            {Object.entries(f.byStatus || {}).map(([k, v]) => {
              const pct = f.total ? Math.round((v / f.total) * 100) : 0
              const color = { active: 'var(--color-ok)', warning: 'var(--color-warn)', inactive: 'var(--color-danger)', offline: 'var(--color-muted)' }[k]
              return (
                <div key={k}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="capitalize text-[var(--color-body)]">{k}</span>
                    <span className="tabular-nums text-[var(--color-muted)]">{num(v)} · {pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface)]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Coverage by LGA</h3>
            <Link to="/facilities" className="text-xs font-medium text-[var(--color-brand)] hover:underline">View all →</Link>
          </div>
          <div className="max-h-56 overflow-y-auto pr-1">
            <table className="w-full text-left text-sm">
              <tbody>
                {(f.byLga || []).slice(0, 10).map((g) => (
                  <tr key={g.lga} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="py-2 font-medium">{g.lga}</td>
                    <td className="py-2 text-right tabular-nums">{num(g.total)}</td>
                    <td className="py-2 text-right text-xs tabular-nums text-[var(--color-muted)]">{num(g.online)} online</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
