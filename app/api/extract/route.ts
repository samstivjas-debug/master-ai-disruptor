import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
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

    // Check if demo mode is enabled (for testing without API credits)
    const isDemoMode = process.env.DEMO_MODE === 'true'

    let result
    if (isDemoMode) {
      // Demo mode: return mock extraction results
      const mockData = {
        object: {
          documentType: getDocumentTypeFromMimeType(validatedRequest.mimeType, validatedRequest.fileName),
          extractedData: {
            fileName: validatedRequest.fileName,
            content_preview: validatedRequest.content.substring(0, 200),
            processing_mode: 'DEMO',
            note: 'This is demo data. Connect a valid Anthropic API key to enable real document processing.',
          },
          confidence: 0.75,
          rawText: validatedRequest.content,
        },
      }
      result = mockData
    } else {
      // Use AI to extract structured data from the document content
      result = await generateObject({
        model: anthropic('claude-3-5-sonnet-20241022'),
        schema: ExtractionResultSchema,
        prompt,
      })
    }

    const processingTime = Date.now() - startTime

    return Response.json({
      documentType: result.object.documentType,
      extractedData: result.object.extractedData,
      confidence: result.object.confidence,
      rawText: result.object.rawText,
      processingTime,
    })
  } catch (error) {
    console.error('[v0] Extraction error:', error)
    let errorMessage = 'Failed to process document'
    
    if (error instanceof Error) {
      errorMessage = error.message
      // Handle specific API errors
      if (error.message.includes('credit balance') || error.message.includes('Insufficient')) {
        errorMessage = 'Insufficient API credits. Please check your Anthropic account has credits available.'
      } else if (error.message.includes('authentication') || error.message.includes('invalid')) {
        errorMessage = 'Authentication failed. Please verify your API key is correct.'
      } else if (error.message.includes('API')) {
        errorMessage = `API Error: ${error.message}`
      }
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
