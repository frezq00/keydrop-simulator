import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import CaseOpen from './pages/CaseOpen'
import Upgrader from './pages/Upgrader'
import Inventory from './pages/Inventory'

function App() {
  const { user, loading, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-primary">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/case/:caseName" element={user ? <CaseOpen /> : <Navigate to="/login" />} />
          <Route path="/upgrader" element={user ? <Upgrader /> : <Navigate to="/login" />} />
          <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
