import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

/* ---------- data hook ---------- */
export function useApi(path, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    let alive = true
    setLoading(true)
    setError(null)
    api(path)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => reload(), [reload])
  return { data, error, loading, reload }
}

/* ---------- layout primitives ---------- */
export function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl border border-[var(--color-line)] bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function PageHead({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, tone = 'default' }) {
  const tones = {
    default: 'text-[var(--color-heading)]',
    ok: 'text-[var(--color-ok)]',
    warn: 'text-[var(--color-warn)]',
    danger: 'text-[var(--color-danger)]',
    brand: 'text-[var(--color-brand)]',
  }
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${tones[tone] || tones.default}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--color-muted)]">{hint}</div>}
    </Card>
  )
}

/* ---------- states ---------- */
export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-16 text-sm text-[var(--color-muted)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-brand)]" />
      {label}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-medium text-[var(--color-danger)]">
        {error?.message || 'Something went wrong.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)]"
        >
          Try again
        </button>
      )}
    </Card>
  )
}

export function EmptyState({ title = 'No data yet', message }) {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 5h16v14H4z" /><path d="M4 9h16M9 5v14" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-medium text-[var(--color-heading)]">{title}</p>
      {message && <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-muted)]">{message}</p>}
    </Card>
  )
}

/* ---------- table ---------- */
export function Table({ columns, rows, empty = 'Nothing to show.', onRowClick }) {
  if (!rows?.length) {
    return <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">{empty}</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {columns.map((c) => (
              <th key={c.key} className={`px-5 py-3 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id ?? i}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={`border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface)] ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-5 py-3 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- pills ---------- */
export function Pill({ tone = 'default', children }) {
  const tones = {
    default: 'bg-[var(--color-surface)] text-[var(--color-body)]',
    ok: 'bg-[var(--color-brand-50)] text-[var(--color-brand-dark)]',
    warn: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-[var(--color-danger)]',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function num(n) {
  return typeof n === 'number' ? n.toLocaleString() : (n ?? '—')
}
