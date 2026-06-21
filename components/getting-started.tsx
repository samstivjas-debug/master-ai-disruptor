'use client'

import { FileText, Zap, BarChart3 } from 'lucide-react'

export function GettingStarted() {
  return (
    <div className="mt-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          How AnyForm Works
        </h2>
        <p className="text-muted-foreground">
          Transform any document into structured data in three simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <span className="text-lg font-bold text-primary">1</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Upload Document</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Drag and drop any document: PDFs, images, text files, or Word documents. Maximum 10MB.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
            <span className="text-lg font-bold text-accent">2</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-foreground">AI Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Claude 3.5 Sonnet analyzes your document and intelligently extracts structured data.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10">
            <span className="text-lg font-bold text-secondary">3</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Export Results</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Download results as JSON or CSV. View in tree, table, or JSON formats.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-accent/5 border border-accent/20 p-6 space-y-3">
        <p className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          Pro Tips
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>High-quality scans and clear images produce better results</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>Confidence scores above 90% indicate excellent extraction quality</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>Use JSON export for easy integration with other tools and systems</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>Batch upload multiple similar documents for faster processing</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
