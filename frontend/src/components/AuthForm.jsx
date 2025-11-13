import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { handleApiError } from '../utils/api'
import { loginSchema } from '../utils/validation'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Alert, AlertDescription } from './ui/Alert'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AuthForm({ isSignup = false }) {
  const navigate = useNavigate()
  const { login, signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schema = isSignup ? null : loginSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
  })

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      setApiError(null)
      if (isSignup) {
        await signup(data)
        navigate('/dashboard')
      } else {
        await login(data)
        navigate('/dashboard')
      }
    } catch (err) {
      const error = handleApiError(err)
      setApiError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignup ? 'Create Account' : 'Welcome Back'}</CardTitle>
        <CardDescription>
          {isSignup ? 'Sign up to get started' : 'Sign in to your account'}
        </CardDescription>
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              error={!!errors.email}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                error={!!errors.password}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSignup ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
