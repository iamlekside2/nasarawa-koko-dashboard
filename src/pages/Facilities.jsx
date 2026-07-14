import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, num } from '../components/ui'

const TYPE_LABELS = { PHC: 'Primary', SECONDARY: 'Secondary', TERTIARY: 'Tertiary', PRIVATE: 'Private' }
const COLORS = ['#0a7d3f', '#2f9e63', '#c9a227', '#5aa9e6', '#8b5cf6', '#e3a008']

function statusTone(s) {
  return { ACTIVE: 'ok', WARNING: 'warn', INACTIVE: 'danger', OFFLINE: 'default' }[s] || 'default'
}

export default function Facilities() {
  const { data, error, loading, reload } = useApi('/state/facilities')
  const [filter, setFilter] = useState('ALL')

  if (loading) return <Spinner label="Loading facilities…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const types = Object.entries(data.byType || {})
  const pie = types.map(([k, v]) => ({ name: TYPE_LABELS[k] || k, value: v }))
  const rows = (data.facilities || []).filter((f) => filter === 'ALL' || f.type === filter)

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
        <Card className="p-5 lg:col-span-1">
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

        {/* ownership + status */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">Ownership &amp; status</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Ownership</div>
              <ul className="space-y-2 text-sm">
                {Object.entries(data.byOwnership || {}).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between">
                    <span>{k}</span><span className="font-semibold tabular-nums">{num(v)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">Reporting status</div>
              <ul className="space-y-2 text-sm">
                {Object.entries(data.byStatus || {}).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between">
                    <Pill tone={statusTone(k.toUpperCase())}>{k}</Pill>
                    <span className="font-semibold tabular-nums">{num(v)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* list */}
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-line)] px-5 py-4">
          <h3 className="mr-2 text-sm font-semibold">Facilities</h3>
          {['ALL', ...types.map(([k]) => k)].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === t ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-body)] hover:bg-[var(--color-brand-50)]'
              }`}
            >
              {t === 'ALL' ? 'All' : TYPE_LABELS[t] || t}
            </button>
          ))}
          <span className="ml-auto text-xs text-[var(--color-muted)]">{rows.length} shown</span>
        </div>
        <Table
          empty="No facilities in this category."
          columns={[
            { key: 'name', header: 'Facility' },
            { key: 'lga', header: 'LGA' },
            { key: 'type', header: 'Type', render: (r) => TYPE_LABELS[r.type] || r.type },
            { key: 'ownership', header: 'Ownership' },
            { key: 'status', header: 'Status', render: (r) => <Pill tone={statusTone(r.status)}>{r.status}</Pill> },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  )
}
