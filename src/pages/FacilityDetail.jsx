import { useParams, useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { useApi, StatCard, Card, Table, Pill, Spinner, ErrorState, EmptyState, num } from '../components/ui'

const ROLE_LABELS = {
  doctors: 'Doctors', nurses: 'Nurses', pharmacists: 'Pharmacists',
  lab: 'Lab', admin: 'Admin', chw: 'Community Health', other: 'Other',
}
function statusTone(s) {
  return { ACTIVE: 'ok', WARNING: 'warn', INACTIVE: 'danger', OFFLINE: 'default' }[s] || 'default'
}
function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return '—' }
}
function fmtDateTime(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '—' }
}

export default function FacilityDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data, error, loading, reload } = useApi(`/state/facilities/${encodeURIComponent(id)}`, [id])

  if (loading) return <Spinner label="Loading facility…" />
  if (error) return (
    <div>
      <BackLink nav={nav} />
      <ErrorState error={error} onRetry={reload} />
    </div>
  )

  const { profile, patients, staff, pharmacy, encounters, diseases, activity } = data

  return (
    <div>
      <BackLink nav={nav} />

      {/* header */}
      <Card className="mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
              <Pill tone={statusTone(profile.status)}>{profile.status}</Pill>
            </div>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {profile.code && <span className="font-mono">{profile.code}</span>}
              {profile.code && ' · '}{profile.type === 'PHC' ? 'Primary' : profile.type} · {profile.ownership}
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="text-[var(--color-muted)]">Last activity</div>
            <div className="font-medium">{fmtDateTime(profile.lastActivity)}</div>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 border-t border-[var(--color-line)] pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Field label="LGA" value={profile.lga} />
          <Field label="Ward" value={profile.ward} />
          <Field label="Contact" value={profile.contact} />
          <Field label="Registered" value={fmtDate(profile.createdAt)} />
          {profile.address && <div className="sm:col-span-2 lg:col-span-4"><Field label="Address" value={profile.address} /></div>}
        </dl>
      </Card>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Registered patients" value={num(patients.total)} tone="brand" hint={`${num(patients.active)} active`} />
        <StatCard label="Staff" value={num(staff.total)} hint={`${num(staff.online)} online`} />
        <StatCard label="Stock units" value={num(pharmacy.totalStockUnits)} tone={pharmacy.belowReorder ? 'warn' : 'default'} hint={`${num(pharmacy.distinctDrugs)} drugs`} />
        <StatCard label="Encounters (90d)" value={num(encounters.total)} tone="ok" />
      </div>

      {/* encounters trend */}
      {encounters.total > 0 && (
        <Card className="mb-6 p-5">
          <h3 className="mb-3 text-sm font-semibold">Patient encounters — last 90 days</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={encounters.trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="fd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a7d3f" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0a7d3f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ece8" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0a7d3f" strokeWidth={2} fill="url(#fd)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* staff */}
        <Section title="Staff" count={staff.total}>
          {staff.total === 0 ? (
            <EmptyState title="No staff recorded" message="No health workers registered here yet." />
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-2 px-1">
                {Object.entries(staff.byRole).filter(([, v]) => v > 0).map(([k, v]) => (
                  <span key={k} className="rounded-lg border border-[var(--color-line)] px-2.5 py-1 text-xs">
                    <span className="font-semibold">{num(v)}</span> <span className="text-[var(--color-muted)]">{ROLE_LABELS[k] || k}</span>
                  </span>
                ))}
              </div>
              <Table
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'role', header: 'Role' },
                  { key: 'online', header: 'Status', align: 'right', render: (r) => r.online ? <Pill tone="ok">online</Pill> : <span className="text-[var(--color-muted)]">offline</span> },
                ]}
                rows={staff.list}
              />
            </>
          )}
        </Section>

        {/* pharmacy */}
        <Section title="Store & Medication" count={pharmacy.distinctDrugs}>
          {pharmacy.distinctDrugs === 0 ? (
            <EmptyState title="No stock recorded" message="No drug batches logged for this facility." />
          ) : (
            <>
              {(pharmacy.belowReorder > 0 || pharmacy.expiringSoon > 0) && (
                <div className="mb-3 flex flex-wrap gap-2 px-1">
                  {pharmacy.belowReorder > 0 && <Pill tone="danger">{pharmacy.belowReorder} below reorder</Pill>}
                  {pharmacy.expiringSoon > 0 && <Pill tone="warn">{pharmacy.expiringSoon} expiring &lt; 90d</Pill>}
                </div>
              )}
              <Table
                columns={[
                  { key: 'drug', header: 'Drug', render: (r) => (
                    <span>{r.drug} {r.strength && <span className="text-[var(--color-muted)]">{r.strength}</span>} {r.below && <Pill tone="danger">low</Pill>} {r.expiring && <Pill tone="warn">exp</Pill>}</span>
                  ) },
                  { key: 'stock', header: 'Stock', align: 'right', render: (r) => num(r.stock) },
                  { key: 'reorder', header: 'Reorder', align: 'right', render: (r) => num(r.reorder) },
                ]}
                rows={pharmacy.drugs}
              />
            </>
          )}
        </Section>

        {/* diseases */}
        <Section title="Diagnoses" count={diseases.total}>
          {diseases.total === 0 ? (
            <EmptyState title="No diagnoses recorded" message="No conditions logged for this facility yet." />
          ) : (
            <Table
              columns={[
                { key: 'name', header: 'Condition' },
                { key: 'count', header: 'Cases', align: 'right', render: (r) => num(r.count) },
              ]}
              rows={diseases.top}
            />
          )}
        </Section>

        {/* activity */}
        <Section title="Recent activity" count={activity.total}>
          {!activity.recent?.length ? (
            <EmptyState title="No activity yet" message="This facility has not reported any activity." />
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {activity.recent.map((a, i) => (
                <li key={i} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <div className="font-medium text-[var(--color-heading)]">{a.action || 'activity'}</div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {a.entity}{a.userRole ? ` · ${a.userRole}` : ''}{a.userName ? ` · ${a.userName}` : ''}
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-xs text-[var(--color-muted)]">{fmtDateTime(a.ts)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}

function BackLink({ nav }) {
  return (
    <button onClick={() => nav('/')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)] hover:underline">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      All facilities
    </button>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--color-heading)]">{value || '—'}</dd>
    </div>
  )
}

function Section({ title, count, children }) {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {count != null && <span className="text-xs text-[var(--color-muted)]">{num(count)}</span>}
      </div>
      <div className="py-1">{children}</div>
    </Card>
  )
}
