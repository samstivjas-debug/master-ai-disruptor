'use client'

import { BarChart3, TrendingUp } from 'lucide-react'
import type { ExtractionResult } from '@/lib/schemas'

interface ExtractionAnalyticsProps {
  result: ExtractionResult
}

export function ExtractionAnalytics({ result }: ExtractionAnalyticsProps) {
  const fieldCount = Object.keys(result.keyInformation).length
  const dataTypes = analyzeDataTypes(result.keyInformation)

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Extraction Analytics</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
          <p className="text-2xl font-bold text-primary">{fieldCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Fields</p>
        </div>

        <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
          <p className="text-2xl font-bold text-accent">
            {dataTypes.strings}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Text</p>
        </div>

        <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
          <p className="text-2xl font-bold text-secondary">
            {dataTypes.numbers}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Numeric</p>
        </div>

        <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
          <p className="text-2xl font-bold text-chart-1">
            {dataTypes.objects}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Nested</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground">
          Data Distribution
        </h4>
        <div className="space-y-2">
          {dataTypes.strings > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Text Fields</span>
                  <span className="text-xs font-semibold text-foreground">
                    {Math.round(
                      (dataTypes.strings / fieldCount) * 100
                    )}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{
                      width: `${(dataTypes.strings / fieldCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {dataTypes.numbers > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    Numeric Fields
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {Math.round(
                      (dataTypes.numbers / fieldCount) * 100
                    )}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{
                      width: `${(dataTypes.numbers / fieldCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {dataTypes.objects > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    Nested Objects
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {Math.round(
                      (dataTypes.objects / fieldCount) * 100
                    )}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-1"
                    style={{
                      width: `${(dataTypes.objects / fieldCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Extraction Quality Score
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {result.confidence >= 0.9 && 'Excellent extraction quality. All data appears to be accurately captured.'}
              {result.confidence >= 0.7 && result.confidence < 0.9 && 'Good extraction quality. Minor verification recommended.'}
              {result.confidence >= 0.5 && result.confidence < 0.7 && 'Fair extraction quality. Manual review recommended.'}
              {result.confidence < 0.5 && 'Low extraction quality. Please review results carefully.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function analyzeDataTypes(
  data: any,
  types = { strings: 0, numbers: 0, objects: 0, arrays: 0, booleans: 0 }
): typeof types {
  for (const [, value] of Object.entries(data)) {
    if (typeof value === 'string') types.strings++
    else if (typeof value === 'number') types.numbers++
    else if (typeof value === 'boolean') types.booleans++
    else if (Array.isArray(value)) {
      types.arrays++
      analyzeDataTypes(Object.fromEntries(value.map((v, i) => [i, v])), types)
    } else if (typeof value === 'object' && value !== null) {
      types.objects++
      analyzeDataTypes(value, types)
    }
  }
  return types
}
