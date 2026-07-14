import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useApi, PageHead, StatCard, Card, Table, Spinner, ErrorState, EmptyState, num } from '../components/ui'

const ROLE_LABELS = {
  doctors: 'Doctors', nurses: 'Nurses', pharmacists: 'Pharmacists',
  lab: 'Lab', admin: 'Admin', chw: 'Community Health', other: 'Other',
}

export default function Staff() {
  const { data, error, loading, reload } = useApi('/state/staff')
  const [open, setOpen] = useState(null)

  if (loading) return <Spinner label="Loading staff…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const roleData = Object.entries(data.byRole || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ role: ROLE_LABELS[k] || k, count: v }))

  return (
    <div>
      <PageHead title="Staff & Personnel" subtitle="Health workers on the Koko platform in Nasarawa State" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total staff" value={num(data.total)} tone="brand" />
        <StatCard label="Online (24h)" value={num(data.online)} tone="ok" />
        <StatCard label="Doctors" value={num(data.byRole?.doctors)} />
        <StatCard label="Nurses" value={num(data.byRole?.nurses)} />
      </div>

      {data.total === 0 ? (
        <EmptyState
          title="No staff records yet"
          message="No health workers have been registered on the Koko platform for Nasarawa State facilities yet. Counts will populate as facilities onboard their teams."
        />
      ) : (
        <>
          <Card className="mb-6 p-5">
            <h3 className="mb-3 text-sm font-semibold">Staff by role</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ece8" />
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0a7d3f" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="border-b border-[var(--color-line)] px-5 py-4">
              <h3 className="text-sm font-semibold">By facility</h3>
              <p className="text-xs text-[var(--color-muted)]">Click a facility for the role breakdown</p>
            </div>
            <Table
              empty="No facility staff data."
              columns={[
                { key: 'name', header: 'Facility' },
                { key: 'lga', header: 'LGA' },
                { key: 'total', header: 'Staff', align: 'right', render: (r) => num(r.total) },
                { key: 'online', header: 'Online', align: 'right', render: (r) => num(r.online) },
                {
                  key: 'x', header: '', align: 'right',
                  render: (r) => (
                    <button
                      onClick={() => setOpen(open?.clinicId === r.clinicId ? null : r)}
                      className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                    >
                      {open?.clinicId === r.clinicId ? 'Hide' : 'View roles'}
                    </button>
                  ),
                },
              ]}
              rows={data.byClinic}
            />
            {open && (
              <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4">
                <div className="mb-2 text-sm font-semibold">{open.name} — role breakdown</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(open.byRole || {}).filter(([, v]) => v > 0).map(([k, v]) => (
                    <span key={k} className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs">
                      <span className="font-semibold">{num(v)}</span>{' '}
                      <span className="text-[var(--color-muted)]">{ROLE_LABELS[k] || k}</span>
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
