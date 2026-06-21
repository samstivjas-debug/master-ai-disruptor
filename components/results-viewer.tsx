'use client'

import { useState } from 'react'
import { Copy, Download, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExtractionResult } from '@/lib/schemas'

interface ResultsViewerProps {
  result: ExtractionResult
}

type ViewMode = 'tree' | 'json' | 'table'

export function ResultsViewer({ result }: ResultsViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['root']))

  const toggleKey = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
  }

  const downloadAsJSON = () => {
    const element = document.createElement('a')
    const file = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    })
    element.href = URL.createObjectURL(file)
    element.download = `extraction-result-${Date.now()}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadAsCSV = () => {
    const rows: string[] = []

    // Header
    rows.push('Field,Value')

    // Add metadata
    rows.push(`Document Type,"${result.documentType}"`)
    rows.push(`Confidence,${(result.confidence * 100).toFixed(1)}%`)
    rows.push(`Processing Time,"${result.processingTime}ms"`)
    rows.push('')

    // Add extracted data
    const flattenObject = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null) {
          flattenObject(value, fullKey)
        } else {
          const escapedValue = String(value).replace(/"/g, '""')
          rows.push(`"${fullKey}","${escapedValue}"`)
        }
      }
    }

    flattenObject(result.extractedData, 'data')

    const element = document.createElement('a')
    const file = new Blob([rows.join('\n')], { type: 'text/csv' })
    element.href = URL.createObjectURL(file)
    element.download = `extraction-result-${Date.now()}.csv`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const renderTreeNode = (data: any, path: string = 'root'): JSX.Element => {
    const isExpanded = expandedKeys.has(path)
    const isObject = data !== null && typeof data === 'object' && !Array.isArray(data)
    const isArray = Array.isArray(data)
    const hasChildren = (isObject || isArray) && Object.keys(data).length > 0

    return (
      <div key={path} className="ml-4">
        {hasChildren && (
          <button
            onClick={() => toggleKey(path)}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 py-1 pl-2 pr-4 rounded hover:bg-primary/10 mb-1"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
            />
            <span className="text-muted-foreground">
              {isArray ? `Array[${(data as any[]).length}]` : 'Object'}
            </span>
          </button>
        )}

        {isExpanded && hasChildren && (
          <div className="border-l border-border pl-2 py-1">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="py-1">
                <span className="text-foreground font-semibold">{key}:</span>{' '}
                {typeof value === 'object' && value !== null ? (
                  renderTreeNode(value, `${path}.${key}`)
                ) : (
                  <span className="text-accent">
                    {typeof value === 'string'
                      ? `"${value}"`
                      : String(value)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {!hasChildren && (
          <span className="text-accent">
            {typeof data === 'string' ? `"${data}"` : String(data)}
          </span>
        )}
      </div>
    )
  }

  const renderTableView = () => {
    const rows: Array<[string, string]> = []

    const flatten = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null) {
          flatten(value, fullKey)
        } else {
          rows.push([fullKey, String(value)])
        }
      }
    }

    flatten(result.extractedData)

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-semibold">Field</th>
              <th className="text-left py-3 px-4 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-muted/30">
              <td className="py-2 px-4 font-semibold">Document Type</td>
              <td className="py-2 px-4">{result.documentType}</td>
            </tr>
            <tr className="border-b border-border hover:bg-muted/30">
              <td className="py-2 px-4 font-semibold">Confidence</td>
              <td className="py-2 px-4">{(result.confidence * 100).toFixed(1)}%</td>
            </tr>
            {rows.map(([key, value]) => (
              <tr key={key} className="border-b border-border hover:bg-muted/30">
                <td className="py-2 px-4 font-semibold text-primary">{key}</td>
                <td className="py-2 px-4">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Extraction Results</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Document Type: <span className="font-semibold text-primary">{result.documentType}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy JSON</span>
            <span className="sm:hidden">Copy</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadAsJSON}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">JSON</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadAsCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['tree', 'json', 'table'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              viewMode === mode
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-4 overflow-auto max-h-96 font-mono text-sm">
        {viewMode === 'tree' && renderTreeNode(result.extractedData)}
        {viewMode === 'json' && (
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
        {viewMode === 'table' && renderTableView()}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 border-4 border-primary">
              <p className="text-xl font-bold text-primary">
                {(result.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Confidence Score</p>
          <p className="text-xs font-medium text-accent mt-1">
            {result.confidence >= 0.9 && 'Excellent'}
            {result.confidence >= 0.7 && result.confidence < 0.9 && 'Good'}
            {result.confidence >= 0.5 && result.confidence < 0.7 && 'Fair'}
            {result.confidence < 0.5 && 'Low'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">
            {Object.keys(result.extractedData).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Fields Extracted</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">
            {result.processingTime < 1000
              ? `${result.processingTime}ms`
              : `${(result.processingTime / 1000).toFixed(1)}s`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Processing Time</p>
        </div>
      </div>
    </div>
  )
}
