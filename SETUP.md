# AnyForm Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
AnyForm uses the Vercel AI Gateway with Claude 3.5 Sonnet. Zero config needed for most users!

The following environment variables are automatically handled by Vercel:
- AI Gateway authentication is built-in
- Claude model access is included with Vercel

### 3. Run Locally
```bash
pnpm dev
```

Visit http://localhost:3000 in your browser.

### 4. Build for Production
```bash
pnpm build
pnpm start
```

## Deployment to Vercel

### Option 1: Vercel Dashboard
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Deploy (no env var configuration needed)

### Option 2: Vercel CLI
```bash
vercel
```

Follow the interactive prompts to deploy.

## Development

### Project Structure
- `/app` - Next.js pages and API routes
- `/components` - Reusable React components
- `/lib` - Utilities and schemas

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm type-check` - TypeScript type checking

## Customization

### Changing the AI Model
Edit `/app/api/extract/route.ts`:
```typescript
model: anthropic('claude-3-5-sonnet-20241022')
// Change to any available Claude model
```

### Adjusting Confidence Threshold
Modify the extraction logic in `/app/api/extract/route.ts` to filter results based on confidence.

### Styling Changes
Update color tokens in `/app/globals.css`:
```css
--primary: oklch(0.45 0.17 264.5);  /* Primary blue */
--accent: oklch(0.55 0.12 180);     /* Teal accent */
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Linux/Mac
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use a different port
pnpm dev -- -p 3001
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### TypeScript Errors
```bash
# Update types
pnpm type-check --fix
```

## Testing the AI Processing

### Using curl
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.txt",
    "fileSize": 100,
    "mimeType": "text/plain",
    "content": "Invoice #123\nDate: 2024-01-15\nTotal: $500"
  }'
```

### Using the UI
1. Upload a test document
2. Check the browser console for network requests
3. Review the extracted data

## Performance Tips

1. **For Large Batches**: Process documents sequentially to avoid rate limits
2. **Optimize Images**: Compress images before uploading for faster processing
3. **Cache Results**: The client stores results in memory during the session

## API Rate Limits

- Claude API follows Vercel's rate limiting
- Typical limits: ~500K tokens/min for free tier
- Upgrade plan for higher limits

## Security

- All files are processed server-side
- No data is logged or stored by default
- Use HTTPS in production
- Validate MIME types (already implemented)
- Monitor API usage in Vercel dashboard

## Next Steps

1. Customize the extraction schema in `/lib/schemas.ts`
2. Add authentication if needed
3. Implement document history with a database
4. Add batch processing capability
5. Set up error monitoring with Sentry

## Getting Help

- Check README.md for detailed documentation
- Review component code comments
- Check Vercel docs: https://vercel.com/docs
- Check AI SDK docs: https://sdk.vercel.ai
- Claude API docs: https://docs.anthropic.com
