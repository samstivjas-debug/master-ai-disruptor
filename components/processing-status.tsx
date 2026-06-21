'use client'

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface ProcessingStatusProps {
  status: 'idle' | 'processing' | 'success' | 'error'
  message?: string
  fileName?: string
}

export function ProcessingStatus({
  status,
  message,
  fileName,
}: ProcessingStatusProps) {
  const statusStyles = {
    processing: {
      bg: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30',
      icon: 'text-primary',
      label: 'Processing your document',
    },
    success: {
      bg: 'bg-gradient-to-r from-accent/10 to-accent/5 border-accent/30',
      icon: 'text-accent',
      label: 'Successfully processed',
    },
    error: {
      bg: 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30',
      icon: 'text-destructive',
      label: 'Processing failed',
    },
    idle: {
      bg: 'bg-gradient-to-r from-muted/20 to-muted/5 border-border/30',
      icon: 'text-muted-foreground',
      label: 'Ready to process',
    },
  }

  const currentStyle = statusStyles[status]

  return (
    <div className={`rounded-xl border ${currentStyle.bg} p-6 backdrop-blur-sm transition-all`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {status === 'processing' && (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className={`h-6 w-6 ${currentStyle.icon} animate-spin`} />
            </div>
          )}
          {status === 'success' && (
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className={`h-6 w-6 ${currentStyle.icon}`} />
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className={`h-6 w-6 ${currentStyle.icon}`} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-foreground text-lg">{currentStyle.label}</p>
            {fileName && (
              <p className="text-sm text-muted-foreground truncate font-medium bg-background/50 px-2 py-1 rounded">
                {fileName}
              </p>
            )}
          </div>

          {message && (
            <p
              className={`text-sm mt-3 ${
                status === 'error'
                  ? 'text-destructive font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {message}
            </p>
          )}

          {status === 'processing' && (
            <div className="mt-4 space-y-2">
              <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/50 h-full w-1/3 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
              </div>
              <p className="text-xs text-muted-foreground">This typically takes 5-15 seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
