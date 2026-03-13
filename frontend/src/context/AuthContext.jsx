import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eventora_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('eventora_token'))
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (emailOrUsername, password) => {
    setLoading(true)
    try {
      const data = await authAPI.login({ emailOrUsername, password })
      localStorage.setItem('eventora_token', data.token)
      localStorage.setItem('eventora_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      toast.success(`Welcome back, ${data.user.firstName || data.user.username}! 🎉`)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (formData) => {
    setLoading(true)
    try {
      const data = await authAPI.register(formData)
      toast.success('Registration successful! Check your email for OTP. 📧')
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('eventora_token')
    localStorage.removeItem('eventora_user')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout,
      isAuthenticated: !!token && !!user,
      isVendor: user?.role === 'VENDOR',
      isAdmin: user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
