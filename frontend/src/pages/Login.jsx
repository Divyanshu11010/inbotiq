import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../context/AuthContext'
import { handleApiError } from '../utils/api'
import { loginSchema } from '../utils/validation'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Alert, AlertDescription } from '../components/ui/Alert'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    try {
      setApiError(null)
      await login(data)
      navigate('/dashboard')
    } catch (err) {
      const error = handleApiError(err)
      setApiError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="animate-slide-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} disabled={isSubmitting} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} disabled={isSubmitting} className={errors.password ? 'border-destructive' : ''} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? 'Signing In...' : 'Sign In'}</Button>
            </form>

            <div className="my-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Don't have an account?</span>
              </div>
            </div>

            <Link to="/signup" className="block w-full"><Button type="button" variant="outline" className="w-full">Create Account</Button></Link>

            <div className="mt-4 p-3 bg-muted rounded-md text-xs">
              <p className="font-medium text-muted-foreground mb-1">Demo Credentials:</p>
              <p className="text-muted-foreground">Email: user@example.com</p>
              <p className="text-muted-foreground">Password: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
