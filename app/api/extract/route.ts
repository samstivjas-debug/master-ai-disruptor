import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { ExtractionResultSchema, ProcessingRequestSchema } from '@/lib/schemas'

function getDocumentTypeFromMimeType(mimeType: string, fileName: string): string {
  if (mimeType === 'application/pdf') return 'PDF Document'
  if (mimeType.startsWith('image/')) return 'Image Document'
  if (mimeType === 'text/plain') return 'Text Document'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return 'Word Document'

  if (fileName.endsWith('.pdf')) return 'PDF Document'
  if (fileName.endsWith('.txt')) return 'Text Document'
  if (fileName.endsWith('.docx')) return 'Word Document'
  if (/\.(jpg|jpeg|png|webp)$/i.test(fileName)) return 'Image Document'

  return 'Unknown Document'
}

function buildExtractionPrompt(
  mimeType: string,
  fileName: string,
  content: string
): string {
  const docType = getDocumentTypeFromMimeType(mimeType, fileName)

  const basePrompt = `You are an intelligent document processing system. Your task is to analyze the provided document content and extract structured data from it.

Document Information:
- Type: ${docType}
- File Name: ${fileName}
- MIME Type: ${mimeType}

Your task:
1. Identify what type of document this is (invoice, receipt, contract, form, report, etc.)
2. Extract all relevant information into a structured format
3. Provide a confidence score (0.0-1.0) indicating how confident you are in the extraction accuracy
4. Return the extracted data as a JSON object

Guidelines:
- Be thorough in extracting all visible information
- For numeric values, preserve the original format
- For dates, standardize to YYYY-MM-DD format
- For amounts/prices, include both numeric and text representations if available
- Identify and extract tables, lists, and hierarchical information
- If information is unclear or missing, set confidence lower
- Include metadata like page numbers or document dates if present

`

  if (
    mimeType.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp)$/i.test(fileName)
  ) {
    return (
      basePrompt +
      `The document is provided as a base64-encoded image. Decode and analyze it to extract information.

Image Content (base64):
${content}`
    )
  }

  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return (
      basePrompt +
      `The document is provided as base64-encoded PDF content. Analyze it to extract information.

PDF Content (base64):
${content}`
    )
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return (
      basePrompt +
      `The document is provided as base64-encoded DOCX content. Analyze it to extract information.

DOCX Content (base64):
${content}`
    )
  }

  return (
    basePrompt +
    `The document content:

${content}`
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request
    const validatedRequest = ProcessingRequestSchema.parse(body)

    const startTime = Date.now()

    // Build extraction prompt based on document type
    const prompt = buildExtractionPrompt(
      validatedRequest.mimeType,
      validatedRequest.fileName,
      validatedRequest.content
    )

    // Use AI to extract structured data from the document content
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    // Demo mode if API key is missing - returns mock data so the UI works
    if (!apiKey) {
      console.warn('[DEMO MODE] ANTHROPIC_API_KEY not configured. Returning demo response.')
      
      const processingTime = Date.now() - startTime + 1500 // Simulate processing time
      
      return Response.json({
        documentType: 'Invoice',
        extractedData: {
          invoiceNumber: 'INV-2025-001',
          date: '2025-06-23',
          company: {
            from: 'ABC Company',
            to: 'XYZ Corporation',
          },
          items: [
            { description: 'Consulting Services', amount: '$1,500.00' },
            { description: 'Software License', amount: '$500.00' },
          ],
          totals: {
            subtotal: '$2,000.00',
            tax: '$200.00',
            total: '$2,200.00',
          },
          paymentTerms: 'Net 30',
        },
        confidence: 0.72,
        processingTime,
        rawText: '[DEMO MODE] Upload a real file with ANTHROPIC_API_KEY configured for actual AI processing.',
      })
    }

    const result = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022', { apiKey }),
      schema: ExtractionResultSchema,
      prompt,
    })

    const processingTime = Date.now() - startTime

    return Response.json({
      ...result.object,
      processingTime,
    })
  } catch (error) {
    console.error('Extraction error:', error)
    
    let errorMessage = 'Failed to process document'
    let status = 500

    if (error instanceof Error) {
      // Check for Zod validation errors
      if (error instanceof z.ZodError || (error.constructor && error.constructor.name === 'ZodError')) {
        const validationErrors = error as any
        errorMessage = `Invalid request format: ${validationErrors.errors?.[0]?.message || 'Validation failed'}`
        status = 400
      }
      // Check for specific error messages
      else if (error.message.includes('API key')) {
        errorMessage = 'API configuration error: Missing or invalid API key. Please check your environment setup.'
        status = 500
      } else if (error.message.includes('credit card')) {
        errorMessage = 'Billing error: Please add a valid payment method to your Vercel account to use AI features.'
        status = 402
      } else {
        errorMessage = error.message || 'Failed to process document'
      }
    }

    return Response.json(
      { error: errorMessage },
      { status }
    )
  }
}
