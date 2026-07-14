const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'nas_token'

export const auth = {
  token: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  isAuthed: () => !!localStorage.getItem(TOKEN_KEY),
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.message || 'Sign-in failed')
  }
  const data = await res.json()
  auth.set(data.accessToken)
  return data.user
}

/** GET a /state endpoint; throws { status } on failure, redirects to /login on 401. */
export async function api(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${auth.token()}` },
  })
  if (res.status === 401) {
    auth.clear()
    if (location.pathname !== '/login') location.assign('/login')
    throw new Error('Session expired')
  }
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    const err = new Error(d.message || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return res.json()
}
