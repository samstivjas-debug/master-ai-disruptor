/**
 * Utility functions for document processing
 */

export function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

export function detectLanguage(text: string): string {
  // Simple language detection - can be enhanced
  if (/[\u4e00-\u9fa5]/.test(text)) return 'Chinese'
  if (/[\u0600-\u06ff]/.test(text)) return 'Arabic'
  if (/[\u0370-\u03ff]/.test(text)) return 'Greek'
  if (/[\u0400-\u04ff]/.test(text)) return 'Russian'
  return 'English'
}

export function extractTextFromBase64(
  base64String: string,
  mimeType: string
): string {
  // This is a placeholder - in production, you'd use libraries like pdf-parse, pdfjs-dist, etc.
  // For base64 images/PDFs, Claude will handle the decoding
  try {
    const binary = atob(base64String)
    // Try to extract readable text
    const text = binary
      .split('')
      .map((c) => {
        const code = c.charCodeAt(0)
        return code >= 32 && code <= 126 ? c : ''
      })
      .join('')
    return text || '(Binary content - Claude will analyze visually)'
  } catch {
    return '(Unable to extract text - Claude will analyze)'
  }
}

export function calculateFileHash(fileName: string, fileSize: number): string {
  // Simple hash for caching purposes
  const str = `${fileName}-${fileSize}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-600'
  if (confidence >= 0.7) return 'text-blue-600'
  if (confidence >= 0.5) return 'text-yellow-600'
  return 'text-red-600'
}

export function formatConfidenceScore(confidence: number): string {
  const percentage = Math.round(confidence * 100)
  if (percentage >= 90) return 'Very High'
  if (percentage >= 70) return 'High'
  if (percentage >= 50) return 'Medium'
  return 'Low'
}
