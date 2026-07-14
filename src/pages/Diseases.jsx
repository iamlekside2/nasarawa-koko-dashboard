import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useApi, PageHead, StatCard, Card, Table, Spinner, ErrorState, EmptyState, num } from '../components/ui'

export default function Diseases() {
  const { data, error, loading, reload } = useApi('/state/diseases')
  const [open, setOpen] = useState(null)

  if (loading) return <Spinner label="Loading diseases…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const chart = (data.top || []).slice(0, 10).map((d) => ({ name: d.name, count: d.count }))

  return (
    <div>
      <PageHead title="Diseases Treated" subtitle="Diagnoses recorded across Nasarawa State facilities" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total diagnoses" value={num(data.totalDiagnoses)} tone="brand" />
        <StatCard label="Distinct conditions" value={num(data.top?.length)} />
        <StatCard label="Reporting facilities" value={num(data.byClinic?.length)} />
        <StatCard label="Top condition" value={data.top?.[0]?.name || '—'} hint={data.top?.[0] ? `${num(data.top[0].count)} cases` : undefined} />
      </div>

      {data.totalDiagnoses === 0 ? (
        <EmptyState
          title="No diagnoses recorded yet"
          message="No encounter diagnoses have been logged for Nasarawa State facilities on the Koko platform. This view will populate as clinical encounters are recorded."
        />
      ) : (
        <>
          <Card className="mb-6 p-5">
            <h3 className="mb-3 text-sm font-semibold">Most treated conditions</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5ece8" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0a7d3f" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="border-b border-[var(--color-line)] px-5 py-4">
              <h3 className="text-sm font-semibold">By facility</h3>
              <p className="text-xs text-[var(--color-muted)]">Click a facility for its leading conditions</p>
            </div>
            <Table
              empty="No facility diagnosis data."
              columns={[
                { key: 'name', header: 'Facility' },
                { key: 'total', header: 'Diagnoses', align: 'right', render: (r) => num(r.total) },
                {
                  key: 'x', header: '', align: 'right',
                  render: (r) => (
                    <button onClick={() => setOpen(open?.clinicId === r.clinicId ? null : r)} className="text-xs font-medium text-[var(--color-brand)] hover:underline">
                      {open?.clinicId === r.clinicId ? 'Hide' : 'View top'}
                    </button>
                  ),
                },
              ]}
              rows={data.byClinic}
            />
            {open && (
              <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4">
                <div className="mb-2 text-sm font-semibold">{open.name} — leading conditions</div>
                <div className="flex flex-wrap gap-2">
                  {(open.top || []).map((t, i) => (
                    <span key={i} className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs">
                      <span className="font-semibold">{num(t.count)}</span> <span className="text-[var(--color-muted)]">{t.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
