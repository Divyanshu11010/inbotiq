import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { UserCircle, Mail, Shield, LogOut } from 'lucide-react'
import { logout as logoutApi } from '../utils/api'
import api from '../utils/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [meData, setMeData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get('/auth/me')
        const data = res?.data?.data || res?.data || null
        if (mounted) setMeData(data)
      } catch (e) {
        if (mounted) setMeData(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleLogout = async () => {
    try {
      await logoutApi()
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold mb-2">Welcome to Inbotiq</h1>
          <p className="text-muted-foreground text-lg">
            Role-based authentication system with secure JWT tokens
          </p>
        </div>

        {/* User Profile Card */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle size={24} />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-medium">{meData?.name || user?.name || 'N/A'}</p>
              </div>
              <div className="space-y-2 flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-medium break-all">{meData?.email || user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-medium">{meData?.role || user?.role || 'User'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={24} />
                Security Status
              </CardTitle>
              <CardDescription>Authentication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Authentication Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <p className="text-lg font-medium">Authenticated</p>
                </div>
              </div>
              { (meData?.role || user?.role) && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">User Role</p>
                  <p className="text-lg font-medium capitalize bg-primary/10 text-primary px-3 py-1 rounded inline-block">
                    {meData?.role || user?.role}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Token Storage</p>
                <p className="text-sm">✓ Access Token: Context API (Memory)</p>
                <p className="text-sm">✓ Refresh Token: HttpOnly Cookie (Secure)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Built with modern technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <div>
                  <p className="font-medium">React + Vite</p>
                  <p className="text-sm text-muted-foreground">Fast HMR and optimized builds</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <div>
                  <p className="font-medium">JWT Authentication</p>
                  <p className="text-sm text-muted-foreground">Secure token-based auth</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <div>
                  <p className="font-medium">TailwindCSS Styling</p>
                  <p className="text-sm text-muted-foreground">Utility-first CSS framework</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <div>
                  <p className="font-medium">Shadcn Components</p>
                  <p className="text-sm text-muted-foreground">Accessible UI components</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <div>
                  <p className="font-medium">Form Validation</p>
                  <p className="text-sm text-muted-foreground">Zod + React Hook Form</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">✓</span>
                <div>
                  <p className="font-medium">Dark Mode Support</p>
                  <p className="text-sm text-muted-foreground">Light and dark themes</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut size={16} />
            Logout from Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
