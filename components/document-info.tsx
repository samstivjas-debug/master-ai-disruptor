'use client'

import { FileType, Clock, HardDrive } from 'lucide-react'

interface DocumentInfoProps {
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt?: Date
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function getFileTypeLabel(mimeType: string, fileName: string): string {
  if (
    mimeType === 'application/pdf' ||
    fileName.endsWith('.pdf')
  ) {
    return 'PDF Document'
  }
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType === 'text/plain') return 'Text File'
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'Word Document'
  }
  return 'Document'
}

export function DocumentInfo({
  fileName,
  fileSize,
  mimeType,
  uploadedAt,
}: DocumentInfoProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-6">
        <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-3 flex-shrink-0">
          <FileType className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg text-foreground truncate">
            {fileName}
          </h4>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {getFileTypeLabel(mimeType, fileName)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-transparent p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Size</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {formatFileSize(fileSize)}
          </p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-transparent p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <FileType className="h-4 w-4 text-secondary flex-shrink-0" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</p>
          </div>
          <p className="text-sm font-bold text-foreground truncate">
            {getFileTypeLabel(mimeType, fileName)}
          </p>
        </div>

        {uploadedAt && (
          <div className="rounded-lg bg-gradient-to-br from-accent/10 to-transparent p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-accent flex-shrink-0" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Uploaded</p>
            </div>
            <p className="text-sm font-bold text-foreground">
              {uploadedAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
