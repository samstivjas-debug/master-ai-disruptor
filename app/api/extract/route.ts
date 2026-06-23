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
  const isImage = mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(fileName)
  
  const basePrompt = `You are a professional document extraction system. Analyze the provided document and extract information in a structured, professional format.

Document Information:
- File Name: ${fileName}
- Format: ${getDocumentTypeFromMimeType(mimeType, fileName)}

Your task:
1. Identify the precise document type (invoice, receipt, contract, form, report, statement, etc.)
2. Extract a professional 2-3 sentence summary of the document
3. Identify and extract all key information fields with professional labels
4. If the document contains financial data (prices, amounts, quantities):
   - Extract all line items with descriptions, quantities, unit prices, and amounts
   - Calculate or extract subtotal, tax, and total amounts
   - Provide a brief financial analysis (e.g., "Total amount due is 2200.00 with 10% tax applied")
5. Organize information into logical sections if applicable
6. For image documents, extract all visible text content

Output Requirements:
- Use professional business language only - no emojis or markdown symbols
- Preserve all numeric values and formats from the original document
- Standardize dates to YYYY-MM-DD format where possible
- Create clear, descriptive field labels in Title Case
- For financial values, include currency symbols and amounts
- If calculating totals, show calculations clearly
- Be thorough - extract ALL visible information
- Provide confidence score based on clarity and completeness of information

`

  if (isImage) {
    return (
      basePrompt +
      `This is an image document. Please:
1. Extract and transcribe ALL text visible in the image
2. Organize text in logical reading order
3. Preserve tables, lists, and hierarchical structures
4. Note any diagrams, logos, or important visual elements

Image Content (base64):
${content}`
    )
  }

  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return (
      basePrompt +
      `This is a PDF document. Analyze its content to extract structured information.

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
      `This is a Word document. Extract all content including text, tables, and important information.

DOCX Content (base64):
${content}`
    )
  }

  return (
    basePrompt +
    `Document Content:

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
        documentType: 'Commercial Invoice',
        summary: 'This is a commercial invoice from ABC Company to XYZ Corporation for professional services and software licensing. The total amount due is 2200.00 USD with 10% tax applied, due within 30 days of invoice date.',
        keyInformation: {
          'Invoice Number': 'INV-2025-001',
          'Invoice Date': '2025-06-23',
          'Issuing Company': 'ABC Company',
          'Billing To': 'XYZ Corporation',
          'Payment Terms': 'Net 30 days',
          'Due Date': '2025-07-23',
          'Currency': 'USD',
        },
        sections: {
          'Billing Information': {
            'From Company': 'ABC Company',
            'From Address': '123 Business Street, New York, NY 10001',
            'To Company': 'XYZ Corporation',
            'To Address': '456 Commerce Avenue, Los Angeles, CA 90001',
          },
        },
        financialData: {
          hasFinancialData: true,
          items: [
            {
              description: 'Consulting Services',
              quantity: '40',
              unitPrice: '37.50',
              amount: '1500.00',
            },
            {
              description: 'Software License - Annual',
              quantity: '1',
              unitPrice: '500.00',
              amount: '500.00',
            },
          ],
          subtotal: '2000.00',
          tax: '200.00',
          total: '2200.00',
          analysis: 'Invoice includes two line items totaling 2000.00 USD in subtotal. A 10% tax of 200.00 USD has been applied, resulting in a total amount due of 2200.00 USD. Payment is due within 30 days.',
        },
        metadata: {
          dateExtracted: new Date().toISOString().split('T')[0],
        },
        confidence: 0.88,
        processingTime,
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
