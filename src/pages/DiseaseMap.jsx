import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useApi, PageHead, StatCard, Card, Table, Spinner, ErrorState, EmptyState, num } from '../components/ui'

const RANGES = [{ k: 'week', l: 'Past week' }, { k: 'month', l: 'Past month' }, { k: 'year', l: 'Past year' }]

export default function DiseaseMap() {
  const [range, setRange] = useState('year')
  const [disease, setDisease] = useState('')
  const qs = `?range=${range}${disease ? `&disease=${encodeURIComponent(disease)}` : ''}`
  const { data, error, loading, reload } = useApi(`/state/diseases/map${qs}`, [range, disease])

  return (
    <div>
      <PageHead title="Disease Mapping" subtitle="Case distribution by LGA and spread over time">
        <div className="flex rounded-lg border border-[var(--color-line)] bg-white p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.k}
              onClick={() => setRange(r.k)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                range === r.k ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-body)] hover:bg-[var(--color-surface)]'
              }`}
            >
              {r.l}
            </button>
          ))}
        </div>
      </PageHead>

      {loading && <Spinner label="Loading disease map…" />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <label className="text-sm text-[var(--color-muted)]">Filter condition:</label>
            <select
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">All conditions</option>
              {(data.diseases || []).map((d) => (
                <option key={d.name} value={d.name}>{d.name} ({d.count})</option>
              ))}
            </select>
            {disease && (
              <button onClick={() => setDisease('')} className="text-xs font-medium text-[var(--color-brand)] hover:underline">Clear</button>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Cases in range" value={num(data.total)} tone="brand" />
            <StatCard label="LGAs affected" value={num(data.byLga?.length)} />
            <StatCard label="Conditions" value={num(data.diseases?.length)} />
            <StatCard label="Range" value={RANGES.find((r) => r.k === range)?.l} />
          </div>

          {data.total === 0 ? (
            <EmptyState
              title="No cases in this range"
              message="No diagnoses were recorded for Nasarawa State facilities in the selected period. Try a wider range, or check back as encounters are logged."
            />
          ) : (
            <>
              <Card className="mb-6 p-5">
                <h3 className="mb-3 text-sm font-semibold">
                  Spread over time {disease && <span className="text-[var(--color-muted)]">· {disease}</span>}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0a7d3f" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#0a7d3f" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ece8" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#0a7d3f" strokeWidth={2} fill="url(#g)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <div className="border-b border-[var(--color-line)] px-5 py-4">
                  <h3 className="text-sm font-semibold">By Local Government Area</h3>
                </div>
                <Table
                  empty="No LGA data."
                  columns={[
                    { key: 'lga', header: 'LGA' },
                    { key: 'count', header: 'Cases', align: 'right', render: (r) => num(r.count) },
                    {
                      key: 'top', header: 'Leading conditions',
                      render: (r) => (
                        <span className="text-xs text-[var(--color-muted)]">
                          {(r.top || []).slice(0, 3).map((t) => `${t.name} (${t.count})`).join(', ') || '—'}
                        </span>
                      ),
                    },
                  ]}
                  rows={data.byLga}
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
