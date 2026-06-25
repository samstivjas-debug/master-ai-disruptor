import { z } from 'zod'

export const ExtractionResultSchema = z.object({
  documentType: z.string().describe('Type of document (invoice, receipt, form, etc.)'),
  extractedData: z.record(z.unknown()).describe('Key-value pairs of extracted information'),
  confidence: z.number().min(0).max(1).describe('Confidence score of extraction'),
  processingTime: z.number().describe('Processing time in milliseconds'),
  rawText: z.string().optional().describe('Raw text extracted from document'),
})

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>

export const ProcessingRequestSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  content: z.string(),
})

export type ProcessingRequest = z.infer<typeof ProcessingRequestSchema>
