import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, EmptyState, num } from '../components/ui'

export default function Lab() {
  const { data, error, loading, reload } = useApi('/state/lab')

  if (loading) return <Spinner label="Loading laboratory data…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { orders, results } = data
  const anyData = orders.total || results.total

  return (
    <div>
      <PageHead title="Laboratory & Diagnostics" subtitle="Test orders, results & abnormal findings across Nasarawa State" />

      {!anyData ? (
        <EmptyState title="No laboratory data yet" message="No lab orders or results have been recorded for Nasarawa State facilities on the Koko platform yet." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Test orders" value={num(orders.total)} tone="brand" />
            <StatCard label="Pending / open" value={num(orders.pending)} tone={orders.pending ? 'warn' : 'ok'} />
            <StatCard label="Results recorded" value={num(results.total)} tone="ok" />
            <StatCard label="Abnormal results" value={num(results.abnormal)} tone={results.abnormal ? 'danger' : 'default'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">Most ordered tests</h3></div>
              <Table
                empty="No test orders."
                columns={[
                  { key: 'name', header: 'Test' },
                  { key: 'count', header: 'Orders', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={orders.byTest}
              />
            </Card>

            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">By category</h3></div>
              <Table
                empty="No categories."
                columns={[
                  { key: 'name', header: 'Category' },
                  { key: 'count', header: 'Orders', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={orders.byCategory}
              />
            </Card>

            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">Order status</h3></div>
              <Table
                columns={[
                  { key: 'name', header: 'Status', render: (r) => <Pill tone={/complet|result|verif|done/i.test(r.name) ? 'ok' : 'warn'}>{r.name}</Pill> },
                  { key: 'count', header: 'Count', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={orders.byStatus}
              />
            </Card>

            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">Result flags</h3></div>
              <Table
                empty="No results recorded."
                columns={[
                  { key: 'name', header: 'Flag', render: (r) => <Pill tone={/normal/i.test(r.name) ? 'ok' : 'danger'}>{r.name}</Pill> },
                  { key: 'count', header: 'Count', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={results.byFlag}
              />
            </Card>

            <Card className="lg:col-span-2">
              <div className="border-b border-[var(--color-line)] px-5 py-4"><h3 className="text-sm font-semibold">By Local Government Area</h3></div>
              <Table
                columns={[
                  { key: 'name', header: 'LGA' },
                  { key: 'count', header: 'Orders', align: 'right', render: (r) => num(r.count) },
                ]}
                rows={orders.byLga}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
