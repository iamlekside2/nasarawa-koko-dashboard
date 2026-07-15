import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { auth } from './lib/api'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Facilities from './pages/Facilities'
import FacilityDetail from './pages/FacilityDetail'
import Staff from './pages/Staff'
import Pharmacy from './pages/Pharmacy'
import Diseases from './pages/Diseases'
import DiseaseMap from './pages/DiseaseMap'
import Surveillance from './pages/Surveillance'
import Mnch from './pages/Mnch'
import Reporting from './pages/Reporting'

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
        <Route index element={<Overview />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="facility/:id" element={<FacilityDetail />} />
        <Route path="staff" element={<Staff />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="surveillance" element={<Surveillance />} />
        <Route path="mnch" element={<Mnch />} />
        <Route path="diseases" element={<Diseases />} />
        <Route path="disease-map" element={<DiseaseMap />} />
        <Route path="reporting" element={<Reporting />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
