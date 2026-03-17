import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AIChatbot from './components/ai/AIChatbot'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VendorListPage from './pages/VendorListPage'
import VendorDetailPage from './pages/VendorDetailPage'
import BookingPage from './pages/BookingPage'
import DashboardPage from './pages/DashboardPage'
import VendorDashboardPage from './pages/VendorDashboardPage'
import AdminPage from './pages/AdminPage'
import WishlistPage from './pages/WishlistPage'

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-navy">
        <Navbar />
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vendors" element={<VendorListPage />} />
          <Route path="/vendors/:id" element={<VendorDetailPage />} />
          <Route path="/book/:vendorId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/vendor/dashboard" element={<ProtectedRoute role="VENDOR"><VendorDashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        </Routes>
        <Footer />
        <AIChatbot />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1E2970', color: '#fff', border: '1px solid rgba(255,215,0,0.2)' },
            success: { iconTheme: { primary: '#FFD700', secondary: '#0A0F2E' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
