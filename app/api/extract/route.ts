import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { ExtractionResultSchema, ProcessingRequestSchema } from '@/lib/schemas'

// Provider configuration
function selectProvider() {
  // Try Anthropic first
  let apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    for (let i = 1; i <= 10; i++) {
      const key = (process.env as Record<string, string | undefined>)[`ANTHROPIC_API_KEY_${i}`]
      if (key && key.length > 0) {
        apiKey = key
        break
      }
    }
  }
  
  if (apiKey) {
    apiKey = cleanApiKey(apiKey)
    if (apiKey.length > 0) {
      console.log('[v0] Using Anthropic Claude 3.5 Sonnet')
      return {
        provider: 'anthropic',
        model: anthropic('claude-3-5-sonnet-20241022', { apiKey }),
      }
    }
  }

  // Try OpenRouter
  let openRouterKey = process.env.OPENROUTER_API_KEY
  if (!openRouterKey) {
    for (let i = 1; i <= 10; i++) {
      const key = (process.env as Record<string, string | undefined>)[`OPENROUTER_API_KEY_${i}`]
      if (key && key.length > 0) {
        openRouterKey = key
        break
      }
    }
  }

  if (openRouterKey) {
    openRouterKey = cleanApiKey(openRouterKey)
    if (openRouterKey.length > 0) {
      console.log('[v0] Using OpenRouter')
      return {
        provider: 'openrouter',
        model: openai('openrouter/anthropic/claude-3.5-sonnet', {
          apiKey: openRouterKey,
          baseURL: 'https://openrouter.ai/api/v1',
        }),
      }
    }
  }

  // Try OpenAI
  let openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    for (let i = 1; i <= 10; i++) {
      const key = (process.env as Record<string, string | undefined>)[`OPENAI_API_KEY_${i}`]
      if (key && key.length > 0) {
        openaiKey = key
        break
      }
    }
  }

  if (openaiKey) {
    openaiKey = cleanApiKey(openaiKey)
    if (openaiKey.length > 0) {
      console.log('[v0] Using OpenAI GPT-4')
      return {
        provider: 'openai',
        model: openai('gpt-4-turbo', { apiKey: openaiKey }),
      }
    }
  }

  // Try Google AI Studio
  let googleKey = process.env.GOOGLE_API_KEY
  if (!googleKey) {
    for (let i = 1; i <= 10; i++) {
      const key = (process.env as Record<string, string | undefined>)[`GOOGLE_API_KEY_${i}`]
      if (key && key.length > 0) {
        googleKey = key
        break
      }
    }
  }

  if (googleKey) {
    googleKey = cleanApiKey(googleKey)
    if (googleKey.length > 0) {
      console.log('[v0] Using Google Gemini Pro')
      return {
        provider: 'google',
        model: google('gemini-pro', { apiKey: googleKey }),
      }
    }
  }

  throw new Error(
    'No API key configured. Please add one of: ANTHROPIC_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY to your environment variables.'
  )
}

function cleanApiKey(key: string): string {
  let cleaned = key.trim()
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1)
  }
  return cleaned
}

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

    // Use multi-provider AI system
    const { model } = selectProvider()

    const result = await generateObject({
      model,
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
