# AnyForm - Intelligent Document Processing Engine

AnyForm is a sophisticated AI-powered document processing system that transforms unstructured documents into structured JSON data. Built with Next.js 16, React 19, TypeScript, and Claude 3.5 Sonnet, it provides intelligent extraction, analysis, and export capabilities for multi-modal documents.

## Features

### Core Capabilities
- **Multi-modal Document Support**: Process PDFs, images (JPEG, PNG, WebP), text files, and Word documents
- **AI-Powered Extraction**: Uses Claude 3.5 Sonnet for accurate document analysis and data extraction
- **Structured Output**: Automatically converts unstructured documents into clean JSON format
- **Confidence Scoring**: Provides reliability metrics (0-100%) for extraction accuracy
- **Real-time Processing**: Stream-like processing with immediate results

### Advanced Features
- **Multiple View Modes**: Tree view, JSON view, and table view for extracted data
- **Analytics Dashboard**: Visual metrics showing field distribution and data types
- **Export Functionality**: Download results as JSON or CSV
- **Document Metadata**: Capture file information, size, type, and upload timestamps
- **Quality Assessment**: Intelligent confidence scoring and quality recommendations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4 with custom design tokens
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Type Safety**: TypeScript

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **AI Model**: Claude 3.5 Sonnet via Vercel AI SDK
- **Validation**: Zod schema validation
- **Storage**: Vercel Blob (optional future integration)

### Infrastructure
- **Deployment**: Vercel
- **Package Manager**: pnpm

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── api/
│   │   └── extract/
│   │       └── route.ts          # Document processing endpoint
│   ├── layout.tsx                # Root layout with theme setup
│   ├── page.tsx                  # Main application page
│   └── globals.css               # Design system tokens
├── components/
│   ├── document-upload.tsx       # File upload with drag-drop
│   ├── document-info.tsx         # File metadata display
│   ├── processing-status.tsx     # Processing state indicator
│   ├── results-viewer.tsx        # Multi-view results display
│   ├── extraction-analytics.tsx  # Analytics and metrics
│   ├── help-section.tsx          # FAQ component
│   └── ui/
│       └── button.tsx            # Base button component
├── lib/
│   ├── schemas.ts                # Zod validation schemas
│   └── processing-utils.ts       # Utility functions
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Vercel AI Gateway access (for Claude models)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create `.env.local` with:
```
# Vercel AI Gateway (zero-config with default providers)
# No additional setup needed for Claude access
```

3. Run development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
pnpm build
pnpm start
```

## Usage

### Basic Workflow

1. **Upload Document**: Drag and drop or click to upload your document
2. **Wait for Processing**: The AI analyzes the document (typically 2-10 seconds)
3. **Review Results**: Examine extracted data in tree, JSON, or table view
4. **Export Data**: Download as JSON or CSV for further use

### Supported Document Types

- **Business Documents**: Invoices, receipts, purchase orders
- **Forms**: Application forms, surveys, questionnaires
- **IDs & Cards**: Driver licenses, passports, business cards
- **Contracts**: Agreements, terms, legal documents
- **Reports**: Financial reports, research papers, summaries
- **Unstructured**: Any document with text or images

## API Reference

### POST /api/extract

Processes a document and extracts structured data.

**Request Body**:
```json
{
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "content": "base64-encoded-file-content"
}
```

**Response**:
```json
{
  "documentType": "Invoice",
  "extractedData": {
    "invoiceNumber": "INV-2024-001",
    "date": "2024-01-15",
    "total": 1500.00,
    "items": [...]
  },
  "confidence": 0.95,
  "processingTime": 3500
}
```

## Design System

### Color Palette
- **Primary**: Blue (#4C72F5)
- **Secondary**: Teal/Cyan (#0D9DA3)
- **Accent**: Light Cyan (#3DD6C4)
- **Neutrals**: Professional grays with blue tint
- **Background**: Light blue-gray (#FAF8F7 light / #1E1F22 dark)

### Typography
- **Headings**: Geist Sans
- **Body**: Geist Sans
- **Code**: Geist Mono

### Spacing
Uses Tailwind's standard spacing scale (0.25rem units) for consistency across the UI.

## Performance Optimizations

- Server-side processing for document analysis
- Streaming responses for real-time feedback
- Efficient file handling with Buffer operations
- Zod schema validation for safety
- Next.js static optimization for routes
- Client-side result caching and filtering

## Future Enhancements

- Document storage and processing history
- Batch document processing
- Custom extraction templates
- Advanced OCR for scanned documents
- Multi-language support
- Webhook integration for automated processing
- API key management for programmatic access
- Custom model fine-tuning options

## Security Considerations

- File size limits (10MB max)
- MIME type validation
- Input sanitization via Zod
- No sensitive data logging
- Optional future: encryption at rest
- CORS configuration for API access

## Troubleshooting

### Document Upload Issues
- Ensure file size is under 10MB
- Check that file format is supported
- Try with a different document type

### Processing Errors
- Check console for error details
- Verify document has readable content
- Try with a cleaner/smaller document
- Check API rate limits

### Export Problems
- Use supported formats (JSON, CSV)
- Check browser download settings
- Try with smaller result sets

## Configuration

### Adjusting Model Parameters
Edit `/app/api/extract/route.ts` to:
- Change Claude model version
- Adjust system prompt
- Modify extraction schema

### Customizing Design
Update `/app/globals.css` to:
- Change color tokens
- Adjust typography
- Modify spacing scale

## Contributing

To enhance AnyForm:

1. Create feature branches
2. Follow existing code patterns
3. Add TypeScript types for new functionality
4. Test changes thoroughly
5. Update documentation

## License

This project is part of the v0 ecosystem and follows Vercel's terms of service.

## Support

For issues or questions:
- Check the FAQ section in the app
- Review the documentation
- Contact Vercel support at vercel.com/help

## Changelog

### Version 1.0.0 (Initial Release)
- Multi-modal document upload
- AI-powered extraction with Claude 3.5 Sonnet
- Multiple result visualization modes
- Analytics and quality metrics
- JSON/CSV export functionality
- Responsive design for all devices
- Comprehensive help documentation
