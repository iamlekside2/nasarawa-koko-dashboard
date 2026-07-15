import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, EmptyState, num } from '../components/ui'

export default function Mnch() {
  const { data, error, loading, reload } = useApi('/state/mnch')

  if (loading) return <Spinner label="Loading maternal & child health…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { anc, deliveries, immunizations, familyPlanning, nutrition, pncVisits } = data
  const anyData = anc.total || deliveries.total || immunizations.totalDoses || familyPlanning.total || nutrition.screened || pncVisits

  return (
    <div>
      <PageHead title="Maternal, Newborn & Child Health" subtitle="ANC, deliveries, immunization, family planning & nutrition across Nasarawa State" />

      {!anyData ? (
        <EmptyState title="No MNCH records yet" message="No maternal, newborn or child-health activity has been recorded for Nasarawa State facilities on the Koko platform yet." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="ANC registrations" value={num(anc.total)} tone="brand" />
            <StatCard label="Deliveries" value={num(deliveries.total)} hint={`${num(deliveries.sbaDeliveries)} skilled`} />
            <StatCard label="Immunization doses" value={num(immunizations.totalDoses)} tone="ok" />
            <StatCard label="Family planning" value={num(familyPlanning.total)} hint={`${num(familyPlanning.newAcceptors)} new acceptors`} />
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="PNC visits" value={num(pncVisits)} />
            <StatCard label="Nutrition screened" value={num(nutrition.screened)} />
            <StatCard label="Severe malnutrition (SAM)" value={num(nutrition.sam)} tone={nutrition.sam ? 'danger' : 'default'} />
            <StatCard label="Stillbirths / maternal deaths" value={`${num(deliveries.stillbirths)} / ${num(deliveries.maternalDeaths)}`} tone={deliveries.maternalDeaths ? 'danger' : 'default'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* immunization by vaccine */}
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Immunization by vaccine</h3>
              {immunizations.byVaccine?.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={immunizations.byVaccine.slice(0, 10)} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ece8" />
                      <XAxis dataKey="vaccine" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0a7d3f" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="py-10 text-center text-sm text-[var(--color-muted)]">No immunization records.</p>}
            </Card>

            {/* family planning methods */}
            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">Family planning methods</h3></div>
              <Table
                empty="No family-planning records."
                columns={[
                  { key: 'method', header: 'Method' },
                  { key: 'count', header: 'Clients', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={familyPlanning.byMethod}
              />
            </Card>

            {/* deliveries by mode */}
            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">Deliveries by mode</h3></div>
              <Table
                empty="No delivery records."
                columns={[
                  { key: 'mode', header: 'Mode' },
                  { key: 'count', header: 'Count', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={Object.entries(deliveries.byMode || {}).map(([mode, count]) => ({ mode, count }))}
              />
            </Card>

            {/* nutrition breakdown */}
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Nutrition screening outcomes</h3>
              {nutrition.screened ? (
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between"><span>Normal</span><Pill tone="ok">{num(nutrition.normal)}</Pill></li>
                  <li className="flex items-center justify-between"><span>Moderate malnutrition (MAM)</span><Pill tone="warn">{num(nutrition.mam)}</Pill></li>
                  <li className="flex items-center justify-between"><span>Severe malnutrition (SAM)</span><Pill tone="danger">{num(nutrition.sam)}</Pill></li>
                  <li className="flex items-center justify-between border-t border-[var(--color-line)] pt-3 font-medium"><span>Total screened</span><span className="tabular-nums">{num(nutrition.screened)}</span></li>
                </ul>
              ) : <p className="py-10 text-center text-sm text-[var(--color-muted)]">No nutrition screenings recorded.</p>}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
