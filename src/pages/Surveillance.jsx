import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, EmptyState, num } from '../components/ui'

const RANGES = [{ k: 'week', l: 'Past week' }, { k: 'month', l: 'Past month' }, { k: 'year', l: 'Past year' }]

export default function Surveillance() {
  const [range, setRange] = useState('month')
  const { data, error, loading, reload } = useApi(`/state/surveillance?range=${range}`, [range])

  return (
    <div>
      <PageHead title="Disease Surveillance" subtitle="Notifiable diseases (IDSR) & outbreak signals across Nasarawa State">
        <div className="flex rounded-lg border border-[var(--color-line)] bg-white p-0.5">
          {RANGES.map((r) => (
            <button key={r.k} onClick={() => setRange(r.k)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${range === r.k ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-body)] hover:bg-[var(--color-surface)]'}`}>
              {r.l}
            </button>
          ))}
        </div>
      </PageHead>

      {loading && <Spinner label="Loading surveillance…" />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (
        <>
          {/* outbreak alerts */}
          {data.alerts?.length > 0 && (
            <Card className="mb-6 overflow-hidden border-red-200">
              <div className="border-b border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-[var(--color-danger)]">⚠ Outbreak signals</div>
              <ul className="divide-y divide-[var(--color-line)]">
                {data.alerts.map((a, i) => (
                  <li key={i} className="px-5 py-3">
                    <div className="text-sm font-medium text-[var(--color-heading)]">{a.title}</div>
                    <div className="text-xs text-[var(--color-muted)]">{a.detail}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Cases reported" value={num(data.total)} tone="brand" />
            <StatCard label="Lab-confirmed" value={num(data.confirmed)} />
            <StatCard label="Deaths" value={num(data.deaths)} tone={data.deaths ? 'danger' : 'default'} />
            <StatCard label="High-priority" value={num(data.highPriority)} tone={data.highPriority ? 'warn' : 'default'} />
          </div>

          {data.total === 0 ? (
            <EmptyState title="No notifiable cases in this period" message="No IDSR surveillance cases were reported for Nasarawa State facilities in the selected range." />
          ) : (
            <>
              <Card className="mb-6 p-5">
                <h3 className="mb-3 text-sm font-semibold">Cases over time</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <defs><linearGradient id="sv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d64545" stopOpacity={0.35} /><stop offset="100%" stopColor="#d64545" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ece8" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#d64545" strokeWidth={2} fill="url(#sv)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">By disease</h3></div>
                  <Table
                    columns={[
                      { key: 'name', header: 'Disease', render: (r) => <span>{r.name} {/high|immediate|urgent/i.test(String(r.priority || '')) && <Pill tone="danger">priority</Pill>}</span> },
                      { key: 'count', header: 'Cases', align: 'right', render: (r) => num(r.count) },
                      { key: 'confirmed', header: 'Confirmed', align: 'right', render: (r) => num(r.confirmed) },
                      { key: 'deaths', header: 'Deaths', align: 'right', render: (r) => r.deaths ? <span className="text-[var(--color-danger)]">{num(r.deaths)}</span> : '—' },
                    ]}
                    rows={data.byDisease}
                  />
                </Card>
                <Card>
                  <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">By LGA</h3></div>
                  <Table
                    columns={[
                      { key: 'lga', header: 'LGA' },
                      { key: 'count', header: 'Cases', align: 'right', render: (r) => num(r.count) },
                    ]}
                    rows={data.byLga}
                  />
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
