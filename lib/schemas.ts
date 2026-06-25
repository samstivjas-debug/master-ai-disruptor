import { z } from 'zod'

export const ExtractionResultSchema = z.object({
  documentType: z.string(),
  summary: z.string(),
  keyInformation: z.string(),
  sections: z.string().optional(),
  financialData: z.string().optional(),
  extractedText: z.string().optional(),
  confidence: z.number().min(0).max(1),
  processingTime: z.number(),
})

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>

export const ProcessingRequestSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  content: z.string(),
})

export type ProcessingRequest = z.infer<typeof ProcessingRequestSchema>
