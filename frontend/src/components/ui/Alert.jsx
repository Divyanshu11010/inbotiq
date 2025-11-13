import * as React from 'react'
import { cn } from '../../lib/utils/cn'

const Alert = React.forwardRef(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-background text-foreground',
      destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      success: 'border-green-500/50 text-green-600 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn('relative w-full rounded-lg border p-4', variants[variant], className)}
        {...props}
      />
    )
  },
)

Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('mb-1 font-medium leading-tight tracking-tight', className)} {...props} />
))

AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
))

AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
