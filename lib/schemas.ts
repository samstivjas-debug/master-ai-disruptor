import { z } from 'zod'

export const ExtractionResultSchema = z.object({
  documentType: z.string().describe('Type of document (invoice, receipt, contract, form, report, etc.)'),
  summary: z.string().describe('Professional summary of the document in 2-3 sentences'),
  keyInformation: z.record(z.string()).describe('Key information fields with professional labels and values'),
  sections: z.record(z.record(z.string())).optional().describe('Organized sections with subsections'),
  financialData: z.object({
    hasFinancialData: z.boolean(),
    items: z.array(z.object({
      description: z.string(),
      quantity: z.string().optional(),
      unitPrice: z.string().optional(),
      amount: z.string(),
    })).optional(),
    subtotal: z.string().optional(),
    tax: z.string().optional(),
    total: z.string().optional(),
    analysis: z.string().optional(),
  }).optional().describe('Financial information with calculations and analysis'),
  extractedText: z.string().optional().describe('Extracted text content from image or document'),
  metadata: z.object({
    dateExtracted: z.string(),
    pages: z.string().optional(),
    language: z.string().optional(),
  }).describe('Document metadata'),
  confidence: z.number().min(0).max(1).describe('Confidence score of extraction'),
  processingTime: z.number().describe('Processing time in milliseconds'),
})

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>

export const ProcessingRequestSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  content: z.string(),
})

export type ProcessingRequest = z.infer<typeof ProcessingRequestSchema>
