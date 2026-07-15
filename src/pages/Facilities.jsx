import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, num } from '../components/ui'

const TYPE_LABELS = { PHC: 'Primary', SECONDARY: 'Secondary', TERTIARY: 'Tertiary', PRIVATE: 'Private' }
const COLORS = ['#0a7d3f', '#2f9e63', '#c9a227', '#5aa9e6', '#8b5cf6', '#e3a008']

function statusTone(s) {
  return { ACTIVE: 'ok', WARNING: 'warn', INACTIVE: 'danger', OFFLINE: 'default' }[s] || 'default'
}

export default function Facilities() {
  const nav = useNavigate()
  const { data, error, loading, reload } = useApi('/state/facilities')
  const [type, setType] = useState('ALL')
  const [lga, setLga] = useState('ALL')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    if (!data) return []
    const needle = q.trim().toLowerCase()
    return (data.facilities || []).filter((f) =>
      (type === 'ALL' || f.type === type) &&
      (lga === 'ALL' || f.lga === lga) &&
      (!needle || `${f.name} ${f.code || ''} ${f.lga || ''} ${f.ward || ''}`.toLowerCase().includes(needle))
    )
  }, [data, type, lga, q])

  if (loading) return <Spinner label="Loading facilities…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const types = Object.entries(data.byType || {})
  const pie = types.map(([k, v]) => ({ name: TYPE_LABELS[k] || k, value: v }))

  return (
    <div>
      <PageHead title="Hospitals & Facilities" subtitle="Koko PHC network across Nasarawa State" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total facilities" value={num(data.total)} tone="brand" />
        <StatCard label="Online now" value={num(data.onlineNow)} tone="ok" hint="Activity in last 24h" />
        <StatCard label="Silent > 1 week" value={num(data.notSeenWeek)} tone="warn" />
        <StatCard label="Silent > 1 month" value={num(data.notSeenMonth)} tone="danger" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* by category */}
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">By category</h3>
          {pie.length ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2} isAnimationActive={false}>
                    {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[var(--color-muted)]">No categories yet.</p>
          )}
        </Card>

        {/* by LGA */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">By Local Government Area</h3>
          <div className="max-h-52 overflow-y-auto pr-1">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  <th className="pb-2 font-medium">LGA</th>
                  <th className="pb-2 text-right font-medium">Facilities</th>
                  <th className="pb-2 text-right font-medium">Online</th>
                  <th className="pb-2 text-right font-medium">Silent</th>
                </tr>
              </thead>
              <tbody>
                {(data.byLga || []).map((g) => (
                  <tr
                    key={g.lga}
                    onClick={() => setLga(lga === g.lga ? 'ALL' : g.lga)}
                    className={`cursor-pointer border-t border-[var(--color-line)] ${lga === g.lga ? 'bg-[var(--color-brand-50)]' : 'hover:bg-[var(--color-surface)]'}`}
                  >
                    <td className="py-2 font-medium">{g.lga}</td>
                    <td className="py-2 text-right tabular-nums">{num(g.total)}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--color-ok)]">{num(g.online)}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--color-muted)]">{num(g.inactive)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ownership + status compact */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Ownership</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byOwnership || {}).map(([k, v]) => (
              <span key={k} className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-xs"><span className="font-semibold">{num(v)}</span> <span className="text-[var(--color-muted)]">{k}</span></span>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Reporting status</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byStatus || {}).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1.5"><Pill tone={statusTone(k.toUpperCase())}>{k}</Pill><span className="text-xs font-semibold tabular-nums">{num(v)}</span></span>
            ))}
          </div>
        </Card>
      </div>

      {/* list */}
      <Card>
        <div className="flex flex-col gap-3 border-b border-[var(--color-line)] px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="mr-1 text-sm font-semibold">Facilities</h3>
            {['ALL', ...types.map(([k]) => k)].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${type === t ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-body)] hover:bg-[var(--color-brand-50)]'}`}
              >
                {t === 'ALL' ? 'All types' : TYPE_LABELS[t] || t}
              </button>
            ))}
            <span className="ml-auto text-xs text-[var(--color-muted)]">{rows.length} shown</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, code, LGA or ward…"
                className="w-full rounded-lg border border-[var(--color-line)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand-100)]"
              />
            </div>
            {lga !== 'ALL' && (
              <button onClick={() => setLga('ALL')} className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand-dark)]">
                LGA: {lga} ✕
              </button>
            )}
          </div>
        </div>
        <Table
          empty="No facilities match your filters."
          columns={[
            { key: 'name', header: 'Facility', render: (r) => (
              <span><span className="font-medium text-[var(--color-heading)]">{r.name}</span>{r.code && <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">{r.code}</span>}</span>
            ) },
            { key: 'lga', header: 'LGA' },
            { key: 'type', header: 'Type', render: (r) => TYPE_LABELS[r.type] || r.type },
            { key: 'status', header: 'Status', render: (r) => <Pill tone={statusTone(r.status)}>{r.status}</Pill> },
            { key: 'x', header: '', align: 'right', render: () => (
              <span className="text-xs font-medium text-[var(--color-brand)]">View →</span>
            ) },
          ]}
          rows={rows}
          onRowClick={(r) => nav(`/facility/${encodeURIComponent(r.id)}`)}
        />
      </Card>
    </div>
  )
}
