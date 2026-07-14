import { useState } from 'react'
import { api } from '../lib/api'
import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, EmptyState, num } from '../components/ui'

export default function Pharmacy() {
  const { data, error, loading, reload } = useApi('/state/pharmacy')
  const [open, setOpen] = useState(null)   // clinicId
  const [drill, setDrill] = useState(null) // { loading, error, drugs }

  if (loading) return <Spinner label="Loading store data…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const toggle = async (clinicId) => {
    if (open === clinicId) { setOpen(null); setDrill(null); return }
    setOpen(clinicId)
    setDrill({ loading: true })
    try {
      const res = await api(`/state/pharmacy/clinic/${clinicId}`)
      setDrill({ drugs: res.drugs })
    } catch (e) {
      setDrill({ error: e })
    }
  }

  return (
    <div>
      <PageHead title="Store & Medication" subtitle="Drug stock, dispensing and reorder levels" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Units in stock" value={num(data.totalStockUnits)} tone="brand" />
        <StatCard label="Distinct drugs" value={num(data.distinctDrugs)} />
        <StatCard label="Dispensed today" value={num(data.dispensedTodayUnits)} tone="ok" hint={data.referenceDay} />
        <StatCard label="Below reorder" value={num(data.belowReorder)} tone={data.belowReorder ? 'danger' : 'default'} />
      </div>

      {data.totalStockUnits === 0 && !data.byClinic?.length ? (
        <EmptyState
          title="No pharmacy stock recorded"
          message="No drug batches have been logged for Nasarawa State facilities on the Koko platform yet."
        />
      ) : (
        <Card>
          <div className="border-b border-[var(--color-line)] px-5 py-4">
            <h3 className="text-sm font-semibold">Store by facility</h3>
            <p className="text-xs text-[var(--color-muted)]">Facilities with items below reorder level are shown first</p>
          </div>
          <Table
            empty="No store data."
            columns={[
              { key: 'name', header: 'Facility' },
              { key: 'stockUnits', header: 'Units', align: 'right', render: (r) => num(r.stockUnits) },
              { key: 'drugLines', header: 'Drugs', align: 'right', render: (r) => num(r.drugLines) },
              { key: 'dispensedToday', header: 'Dispensed today', align: 'right', render: (r) => num(r.dispensedToday) },
              {
                key: 'belowReorder', header: 'Low stock', align: 'right',
                render: (r) => r.belowReorder ? <Pill tone="danger">{r.belowReorder} low</Pill> : <span className="text-[var(--color-muted)]">—</span>,
              },
              {
                key: 'x', header: '', align: 'right',
                render: (r) => (
                  <button onClick={() => toggle(r.clinicId)} className="text-xs font-medium text-[var(--color-brand)] hover:underline">
                    {open === r.clinicId ? 'Hide' : 'Drugs'}
                  </button>
                ),
              },
            ]}
            rows={data.byClinic}
          />
          {open && (
            <div className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4">
              {drill?.loading && <Spinner label="Loading drugs…" />}
              {drill?.error && <ErrorState error={drill.error} />}
              {drill?.drugs && (
                drill.drugs.length ? (
                  <div className="overflow-x-auto rounded-lg border border-[var(--color-line)] bg-white">
                    <table className="w-full min-w-[420px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-line)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                          <th className="px-4 py-2.5 font-medium">Drug</th>
                          <th className="px-4 py-2.5 text-right font-medium">Stock</th>
                          <th className="px-4 py-2.5 text-right font-medium">Reorder</th>
                          <th className="px-4 py-2.5 text-right font-medium">Dispensed today</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drill.drugs.map((d, i) => (
                          <tr key={i} className="border-b border-[var(--color-line)] last:border-0">
                            <td className="px-4 py-2.5">
                              {d.drug} {d.below && <Pill tone="danger">low</Pill>}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{num(d.stock)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-muted)]">{num(d.reorder)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{num(d.dispensedToday)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-muted)]">No drugs recorded for this facility.</p>
                )
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
