import { useApi, PageHead, StatCard, Card, Table, Pill, Spinner, ErrorState, EmptyState, num } from '../components/ui'

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Reporting() {
  const { data, error, loading, reload } = useApi('/state/reporting')

  if (loading) return <Spinner label="Loading reporting status…" />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { period, reports, dhis, targets } = data
  const periodLabel = period.year ? `${MONTHS[period.month] || period.month} ${period.year}` : 'latest period'
  const anyData = reports.expected || dhis.clinicsExported || targets.count

  return (
    <div>
      <PageHead title="Reporting & DHIS2" subtitle={`Monthly report submission, DHIS2 sync & targets — ${periodLabel}`} />

      {!anyData ? (
        <EmptyState title="No reporting data yet" message="No monthly reports, DHIS2 exports or targets have been recorded for Nasarawa State facilities yet." />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Report submission" value={`${num(reports.rate)}%`} tone={reports.rate >= 80 ? 'ok' : reports.rate >= 40 ? 'warn' : 'danger'} hint={`${num(reports.submitted)}/${num(reports.expected)} facilities`} />
            <StatCard label="Verified reports" value={num(reports.verified)} />
            <StatCard label="Not submitted" value={num(reports.notSubmitted)} tone={reports.notSubmitted ? 'danger' : 'ok'} />
            <StatCard label="DHIS2 completeness" value={`${num(dhis.avgCompleteness)}%`} hint={`${num(dhis.clinicsExported)} facilities synced`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* non-submitters */}
            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4">
                <h3 className="text-sm font-semibold">Facilities missing this month's report</h3>
                <p className="text-xs text-[var(--color-muted)]">{periodLabel}</p>
              </div>
              {reports.missing?.length ? (
                <ul className="max-h-80 divide-y divide-[var(--color-line)] overflow-y-auto">
                  {reports.missing.map((name, i) => (
                    <li key={i} className="flex items-center justify-between px-5 py-2.5 text-sm">
                      <span>{name}</span><Pill tone="danger">missing</Pill>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 py-8 text-center text-sm text-[var(--color-ok)]">All facilities submitted their report.</div>
              )}
            </Card>

            {/* targets */}
            <Card>
              <div className="border-b border-[var(--color-line)] px-5 py-4">
                <h3 className="text-sm font-semibold">Configured targets</h3>
                <p className="text-xs text-[var(--color-muted)]">{num(targets.count)} target rows across facilities</p>
              </div>
              <Table
                empty="No targets configured."
                columns={[
                  { key: 'indicator', header: 'Indicator' },
                  { key: 'target', header: 'Target (total)', align: 'right', render: (r) => num(r.target) },
                ]}
                rows={targets.list}
              />
            </Card>
          </div>

          {dhis.lastExport && (
            <p className="mt-6 text-xs text-[var(--color-muted)]">
              Last DHIS2 export: {new Date(dhis.lastExport).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  )
}
