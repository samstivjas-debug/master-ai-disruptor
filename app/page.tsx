'use client'

import { useState } from 'react'
import { DocumentUpload, type UploadedDocument } from '@/components/document-upload'
import { ProcessingStatus } from '@/components/processing-status'
import { ResultsViewer } from '@/components/results-viewer'
import { DocumentInfo } from '@/components/document-info'
import { ExtractionAnalytics } from '@/components/extraction-analytics'
import { HelpSection } from '@/components/help-section'
import { GettingStarted } from '@/components/getting-started'
import { Button } from '@/components/ui/button'
import type { ExtractionResult } from '@/lib/schemas'

type ProcessingState = 'idle' | 'processing' | 'success' | 'error'

export default function Page() {
  const [document, setDocument] = useState<UploadedDocument | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDocumentSelected = async (doc: UploadedDocument) => {
    setDocument(doc)
    setProcessingState('processing')
    setResult(null)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: doc.file.name,
          fileSize: doc.file.size,
          mimeType: doc.file.type,
          content: doc.content,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.error || `Processing failed: ${response.statusText}`
        throw new Error(errorMessage)
      }

      setResult(responseData)
      setProcessingState('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setErrorMessage(message)
      setProcessingState('error')
      console.error('Processing error:', err)
    }
  }

  const handleReset = () => {
    setDocument(null)
    setProcessingState('idle')
    setResult(null)
    setErrorMessage(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      {/* Animated vibrant gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/3 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-2/5 h-2/5 bg-gradient-to-tl from-secondary/40 via-secondary/20 to-transparent rounded-full blur-3xl" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 bg-gradient-to-r from-accent/30 via-transparent to-accent/30 rounded-full blur-3xl" style={{ animation: 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s' }}></div>
      </div>

      {/* Premium Header with Gradient Border */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-card/40 border-b border-transparent bg-gradient-to-r from-card/60 via-primary/20 to-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
                <span className="text-lg font-bold text-primary-foreground">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">AnyForm</h1>
                <p className="text-xs text-muted-foreground">AI Document Processing</p>
              </div>
            </div>
            {(document || result) && (
              <Button
                onClick={handleReset}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              >
                New Document
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        {/* Upload State */}
        {!result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 text-balance">
                  Transform Documents into Data
                </h2>
                <p className="text-lg text-muted-foreground">
                  Upload any document and let AI extract structured information instantly
                </p>
              </div>

              {/* Upload Card */}
              <div className="rounded-2xl border-2 border-transparent bg-gradient-to-br from-card to-card/80 p-8 shadow-lg hover:shadow-2xl transition-all hover:border-primary/50 relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="relative">
                  <DocumentUpload
                    onDocumentSelected={handleDocumentSelected}
                    disabled={processingState === 'processing'}
                  />
                </div>
              </div>

              {/* Document Info */}
              {document && (
                <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Document Details</h3>
                  <DocumentInfo
                    fileName={document.file.name}
                    fileSize={document.file.size}
                    mimeType={document.file.type}
                    uploadedAt={new Date()}
                  />
                </div>
              )}

              {/* Processing Status */}
              {document && (
                <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-lg">
                  <ProcessingStatus
                    status={processingState}
                    fileName={document.file.name}
                    message={
                      processingState === 'error'
                        ? errorMessage || 'An error occurred during processing'
                        : processingState === 'processing'
                          ? 'Analyzing your document with advanced AI...'
                          : undefined
                    }
                  />
                </div>
              )}
            </div>

            {/* Right Column - Features */}
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 shadow-md hover:shadow-xl hover:border-primary/60 hover:shadow-primary/20 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Multi-format Support</h3>
                <p className="text-sm text-muted-foreground">PDFs, images, Word docs & more</p>
              </div>

              <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6 shadow-md hover:shadow-xl hover:border-accent/60 hover:shadow-accent/20 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-3 shadow-lg shadow-accent/30 group-hover:shadow-accent/50 transition-all">
                  <svg className="w-5 h-5 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Powered by Claude 3.5 Sonnet</p>
              </div>

              <div className="rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent p-6 shadow-md hover:shadow-xl hover:border-secondary/60 hover:shadow-secondary/20 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-3 shadow-lg shadow-secondary/30 group-hover:shadow-secondary/50 transition-all">
                  <svg className="w-5 h-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Easy Export</h3>
                <p className="text-sm text-muted-foreground">Download as JSON or CSV</p>
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {result && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Extraction Results</h2>
              <p className="text-muted-foreground">Your document has been successfully processed</p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-lg">
              <ResultsViewer result={result} />
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6">Quality Metrics</h3>
              <ExtractionAnalytics result={result} />
            </div>
          </div>
        )}

        {/* Getting Started - only show on initial state */}
        {!document && !result && (
          <div className="mt-16 pt-12 border-t border-border/30">
            <GettingStarted />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/30 backdrop-blur-sm mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-2">About</h3>
              <p className="text-sm text-muted-foreground">Intelligent document processing powered by AI</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Multi-format support</li>
                <li>High accuracy extraction</li>
                <li>Instant processing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Technology</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Claude 3.5 Sonnet</li>
                <li>Next.js 16</li>
                <li>Vercel AI SDK</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© 2025 AnyForm. All rights reserved.</p>
            <p>Built with AI</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
