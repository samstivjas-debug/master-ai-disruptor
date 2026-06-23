'use client'

import { useState, useRef } from 'react'
import { FileUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface UploadedDocument {
  file: File
  content: string
  isProcessing: boolean
}

interface DocumentUploadProps {
  onDocumentSelected: (doc: UploadedDocument) => void
  disabled?: boolean
}

export function DocumentUpload({ onDocumentSelected, disabled }: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedFormats = ['.pdf', '.txt', '.docx', '.jpg', '.jpeg', '.png', '.webp']
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const handleFileRead = async (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File size exceeds 10MB limit`)
      return
    }

    try {
      let content = ''

      if (
        file.type === 'application/pdf' ||
        file.name.endsWith('.pdf')
      ) {
        // For PDFs, convert to base64 for Claude's vision capability
        const buffer = await file.arrayBuffer()
        content = arrayBufferToBase64(buffer)
      } else if (file.type.startsWith('image/')) {
        // For images, convert to base64
        const buffer = await file.arrayBuffer()
        content = arrayBufferToBase64(buffer)
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // For text files, read as text
        content = await file.text()
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        // For DOCX, read as binary and encode
        const buffer = await file.arrayBuffer()
        content = arrayBufferToBase64(buffer)
      } else {
        setError('Unsupported file format')
        return
      }

      onDocumentSelected({
        file,
        content,
        isProcessing: false,
      })
    } catch (err) {
      setError(
        `Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    handleFileRead(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFileRead(file)
        }}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer overflow-hidden ${
          isDragOver
            ? 'border-primary bg-gradient-to-br from-primary/15 to-primary/5'
            : 'border-border/60 hover:border-primary/40 bg-gradient-to-br from-muted/30 to-transparent'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileRead(file)
          }}
          accept={supportedFormats.join(',')}
          className="hidden"
          disabled={disabled}
        />

        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <FileUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Drop your document here</h3>
          <p className="text-muted-foreground mb-6">or click below to browse</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          >
            {disabled ? 'Processing...' : 'Select Document'}
          </Button>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            {supportedFormats.map(f => f.toUpperCase()).join('  •  ')} — Max 10MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
