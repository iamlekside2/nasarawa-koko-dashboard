import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, EmptyState, num } from '../components/ui'

function urgencyTone(name) {
  return /emergency|immediate/i.test(name) ? 'danger' : /urgent/i.test(name) ? 'warn' : 'default'
}
function statusTone(name) {
  const s = String(name).toLowerCase()
  if (s.includes('complet') || s.includes('closed') || s.includes('accept') || s.includes('arriv')) return 'ok'
  return 'warn'
}

export default function Referrals() {
  const { data, error, loading, reload } = useApi('/state/referrals')

  if (loading) return <Spinner label="Loading referrals…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <div>
      <PageHead title="Referrals" subtitle="Patient referrals from PHCs to secondary & tertiary care across Nasarawa State" />

      {data.total === 0 ? (
        <EmptyState title="No referrals recorded" message="No patient referrals have been logged for Nasarawa State facilities on the Koko platform yet." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total referrals" value={num(data.total)} tone="brand" />
            <StatCard label="Pending / open" value={num(data.pending)} tone={data.pending ? 'warn' : 'ok'} />
            <StatCard label="Urgent / emergency" value={num(data.urgent)} tone={data.urgent ? 'danger' : 'default'} />
            <StatCard label="Destinations" value={num(data.topDestinations?.length)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">By status</h3></div>
              <Table
                columns={[
                  { key: 'name', header: 'Status', render: (r) => <Pill tone={statusTone(r.name)}>{r.name}</Pill> },
                  { key: 'count', header: 'Count', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={data.byStatus}
              />
            </Card>

            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">By urgency</h3></div>
              <Table
                columns={[
                  { key: 'name', header: 'Urgency', render: (r) => <Pill tone={urgencyTone(r.name)}>{r.name}</Pill> },
                  { key: 'count', header: 'Count', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={data.byUrgency}
              />
            </Card>

            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">Reasons / types</h3></div>
              <Table
                empty="No referral types recorded."
                columns={[
                  { key: 'name', header: 'Type' },
                  { key: 'count', header: 'Count', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={data.byType}
              />
            </Card>

            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">Top destinations</h3></div>
              <Table
                empty="No destinations recorded."
                columns={[
                  { key: 'name', header: 'Referred to' },
                  { key: 'count', header: 'Count', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={data.topDestinations}
              />
            </Card>

            <Card className="lg:col-span-2">
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">By Local Government Area</h3></div>
              <Table
                columns={[
                  { key: 'name', header: 'LGA' },
                  { key: 'count', header: 'Referrals', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={data.byLga}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
