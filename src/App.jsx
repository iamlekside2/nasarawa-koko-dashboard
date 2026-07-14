import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { auth } from './lib/api'
import Layout from './components/Layout'
import Login from './pages/Login'
import Facilities from './pages/Facilities'
import Staff from './pages/Staff'
import Pharmacy from './pages/Pharmacy'
import Diseases from './pages/Diseases'
import DiseaseMap from './pages/DiseaseMap'

function RequireAuth({ children }) {
  const loc = useLocation()
  if (!auth.isAuthed()) return <Navigate to="/login" replace state={{ from: loc }} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Facilities />} />
        <Route path="staff" element={<Staff />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="diseases" element={<Diseases />} />
        <Route path="disease-map" element={<DiseaseMap />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
