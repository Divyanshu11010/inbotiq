import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../context/AuthContext'
import { handleApiError } from '../utils/api'
import { signupSchema } from '../utils/validation'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Alert, AlertDescription } from '../components/ui/Alert'
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({ resolver: zodResolver(signupSchema) })

  const password = watch('password')

  const passwordStrength = () => {
    if (!password) return null
    if (password.length < 8) return 'weak'
    if (password.length < 12) return 'medium'
    return 'strong'
  }

  const strengthColor = {
    weak: 'bg-destructive',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  }

  const onSubmit = async (data) => {
    try {
      setApiError(null)
      await signup(data)
      navigate('/dashboard')
    } catch (err) {
      const error = handleApiError(err)
      setApiError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="animate-slide-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Sign up to join our platform</CardDescription>
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
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" {...register('firstName')} disabled={isSubmitting} className={errors.firstName ? 'border-destructive' : ''} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" {...register('lastName')} disabled={isSubmitting} className={errors.lastName ? 'border-destructive' : ''} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>

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

                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1 h-1">
                      <div className={`flex-1 rounded-full ${strengthColor[passwordStrength()]}`}></div>
                      {passwordStrength() === 'strong' && (
                        <>
                          <div className={`flex-1 rounded-full ${strengthColor[passwordStrength()]}`}></div>
                          <div className={`flex-1 rounded-full ${strengthColor[passwordStrength()]}`}></div>
                        </>
                      )}
                      {passwordStrength() === 'medium' && (
                        <div className={`flex-1 rounded-full ${strengthColor[passwordStrength()]}`}></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Password strength: <span className="capitalize">{passwordStrength()}</span></p>
                  </div>
                )}

                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} disabled={isSubmitting} className={errors.confirmPassword ? 'border-destructive' : ''} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <select id="role" {...register('role')} disabled={isSubmitting} className="w-full rounded-md border px-3 py-2">
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
              </div>

              <div className="bg-muted p-3 rounded-md space-y-1 text-xs">
                <p className="font-medium">Password Requirements:</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check size={14} className={password && password.length >= 8 ? 'text-green-500' : ''} />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check size={14} className={password && password !== password.toLowerCase() ? 'text-green-500' : ''} />
                  <span>Mix of uppercase and lowercase</span>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>{isSubmitting ? 'Creating Account...' : 'Create Account'}</Button>
            </form>

            <div className="my-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <Link to="/login" className="block w-full">
              <Button type="button" variant="outline" className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

