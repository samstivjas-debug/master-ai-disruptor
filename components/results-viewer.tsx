'use client'

import { useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExtractionResult } from '@/lib/schemas'

interface ResultsViewerProps {
  result: ExtractionResult
}

type ViewMode = 'professional' | 'detailed' | 'json'

export function ResultsViewer({ result }: ResultsViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('professional')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
  }

  const downloadAsJSON = () => {
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    element.href = URL.createObjectURL(file)
    element.download = `document-extract-${Date.now()}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadAsTXT = () => {
    let content = `DOCUMENT EXTRACTION REPORT\n`
    content += `${'='.repeat(60)}\n\n`

    content += `Document Type: ${result.documentType}\n`
    content += `Extraction Date: ${result.metadata.dateExtracted}\n`
    content += `Confidence: ${(result.confidence * 100).toFixed(1)}%\n`
    content += `Processing Time: ${result.processingTime}ms\n\n`

    content += `SUMMARY\n${'-'.repeat(60)}\n`
    content += `${result.summary}\n\n`

    content += `KEY INFORMATION\n${'-'.repeat(60)}\n`
    for (const [key, value] of Object.entries(result.keyInformation)) {
      content += `${key}: ${value}\n`
    }

    if (result.sections) {
      content += `\nDOCUMENT SECTIONS\n${'-'.repeat(60)}\n`
      for (const [sectionName, sectionData] of Object.entries(result.sections)) {
        content += `\n${sectionName}:\n`
        for (const [key, value] of Object.entries(sectionData)) {
          content += `  ${key}: ${value}\n`
        }
      }
    }

    if (result.financialData?.hasFinancialData) {
      content += `\nFINANCIAL INFORMATION\n${'-'.repeat(60)}\n`
      if (result.financialData.items && result.financialData.items.length > 0) {
        content += `\nLine Items:\n`
        for (const item of result.financialData.items) {
          content += `  Description: ${item.description}\n`
          if (item.quantity) content += `  Quantity: ${item.quantity}\n`
          if (item.unitPrice) content += `  Unit Price: ${item.unitPrice}\n`
          content += `  Amount: ${item.amount}\n\n`
        }
      }
      if (result.financialData.subtotal)
        content += `Subtotal: ${result.financialData.subtotal}\n`
      if (result.financialData.tax) content += `Tax: ${result.financialData.tax}\n`
      if (result.financialData.total)
        content += `Total: ${result.financialData.total}\n`
      if (result.financialData.analysis)
        content += `\nAnalysis: ${result.financialData.analysis}\n`
    }

    if (result.extractedText) {
      content += `\nEXTRACTED TEXT\n${'-'.repeat(60)}\n`
      content += `${result.extractedText}\n`
    }

    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `document-extract-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const renderProfessionalView = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {result.documentType}
        </h3>
        <p className="text-base text-foreground leading-relaxed">
          {result.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(result.keyInformation).map(([key, value]) => (
          <div key={key} className="bg-muted/30 p-3 rounded">
            <p className="text-xs text-muted-foreground font-medium uppercase">
              {key}
            </p>
            <p className="text-sm font-semibold text-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>

      {result.sections &&
        Object.keys(result.sections).length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3">Document Details</h4>
            <div className="space-y-3">
              {Object.entries(result.sections).map(([sectionName, sectionData]) => (
                <div key={sectionName} className="bg-muted/20 p-4 rounded">
                  <h5 className="font-medium text-foreground mb-2">
                    {sectionName}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(sectionData).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <p className="text-muted-foreground">{key}</p>
                        <p className="font-medium text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {result.financialData?.hasFinancialData && (
        <div>
          <h4 className="font-semibold text-foreground mb-3">
            Financial Summary
          </h4>
          {result.financialData.items &&
            result.financialData.items.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-2 px-3 font-semibold">
                        Description
                      </th>
                      {result.financialData.items.some((i) => i.quantity) && (
                        <th className="text-right py-2 px-3 font-semibold">
                          Qty
                        </th>
                      )}
                      {result.financialData.items.some((i) => i.unitPrice) && (
                        <th className="text-right py-2 px-3 font-semibold">
                          Unit Price
                        </th>
                      )}
                      <th className="text-right py-2 px-3 font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.financialData.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="py-2 px-3 text-foreground">
                          {item.description}
                        </td>
                        {result.financialData.items.some((i) => i.quantity) && (
                          <td className="text-right py-2 px-3 text-foreground">
                            {item.quantity || ''}
                          </td>
                        )}
                        {result.financialData.items.some(
                          (i) => i.unitPrice
                        ) && (
                          <td className="text-right py-2 px-3 text-foreground">
                            {item.unitPrice || ''}
                          </td>
                        )}
                        <td className="text-right py-2 px-3 font-semibold text-foreground">
                          {item.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          <div className="bg-primary/5 border border-primary/20 rounded p-4 space-y-2">
            {result.financialData.subtotal && (
              <div className="flex justify-between">
                <span className="text-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">
                  {result.financialData.subtotal}
                </span>
              </div>
            )}
            {result.financialData.tax && (
              <div className="flex justify-between">
                <span className="text-foreground">Tax</span>
                <span className="font-semibold text-foreground">
                  {result.financialData.tax}
                </span>
              </div>
            )}
            {result.financialData.total && (
              <div className="flex justify-between border-t border-primary/20 pt-2 mt-2">
                <span className="text-lg font-semibold text-foreground">
                  Total Amount Due
                </span>
                <span className="text-lg font-bold text-primary">
                  {result.financialData.total}
                </span>
              </div>
            )}
          </div>

          {result.financialData.analysis && (
            <div className="mt-4 p-3 bg-muted/30 rounded text-sm text-foreground">
              <p className="font-medium mb-1">Financial Analysis</p>
              <p>{result.financialData.analysis}</p>
            </div>
          )}
        </div>
      )}

      {result.extractedText && (
        <div>
          <h4 className="font-semibold text-foreground mb-3">Extracted Text</h4>
          <div className="bg-muted/20 p-4 rounded text-sm text-foreground whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
            {result.extractedText}
          </div>
        </div>
      )}
    </div>
  )

  const renderDetailedView = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-foreground mb-2">Metadata</h4>
        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Date Extracted:</span>{' '}
            <span className="font-medium">{result.metadata.dateExtracted}</span>
          </p>
          {result.metadata.pages && (
            <p>
              <span className="text-muted-foreground">Pages:</span>{' '}
              <span className="font-medium">{result.metadata.pages}</span>
            </p>
          )}
          {result.metadata.language && (
            <p>
              <span className="text-muted-foreground">Language:</span>{' '}
              <span className="font-medium">{result.metadata.language}</span>
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-2">Complete Data</h4>
        <div className="bg-muted/30 p-4 rounded overflow-auto max-h-96">
          <pre className="text-xs whitespace-pre-wrap break-words font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Extraction Results</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="gap-2"
            title="Copy JSON to clipboard"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadAsJSON}
            className="gap-2"
            title="Download as JSON"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">JSON</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadAsTXT}
            className="gap-2"
            title="Download as formatted text"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">TXT</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['professional', 'detailed', 'json'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              viewMode === mode
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-4 overflow-auto max-h-[600px]">
        {viewMode === 'professional' && renderProfessionalView()}
        {viewMode === 'detailed' && renderDetailedView()}
        {viewMode === 'json' && (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-center">
        <div>
          <p className="text-2xl font-bold text-primary">
            {(result.confidence * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Confidence</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-accent">
            {Object.keys(result.keyInformation).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Fields</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-secondary">
            {result.processingTime < 1000
              ? `${result.processingTime}ms`
              : `${(result.processingTime / 1000).toFixed(1)}s`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Time</p>
        </div>
      </div>
    </div>
  )
}
