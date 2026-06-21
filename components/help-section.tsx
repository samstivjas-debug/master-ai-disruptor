'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What file formats are supported?',
    answer:
      'AnyForm supports PDF, images (JPEG, PNG, WebP), text files (.txt), and Word documents (.docx). Maximum file size is 10MB.',
  },
  {
    question: 'How does the AI extraction work?',
    answer:
      'We use Claude 3.5 Sonnet, a state-of-the-art AI model, to analyze documents and extract structured data. The model identifies document type, extracts key information, and provides a confidence score.',
  },
  {
    question: 'What is the confidence score?',
    answer:
      'The confidence score (0-100%) indicates how accurate the extraction is. Higher scores mean more reliable results. Scores above 90% are considered excellent.',
  },
  {
    question: 'Can I export the results?',
    answer:
      'Yes! You can download extraction results as JSON or CSV files for integration with other tools or further processing.',
  },
  {
    question: 'Is my document data stored?',
    answer:
      'For this MVP version, documents are processed in real-time and not stored. Future versions may include optional storage for processing history.',
  },
  {
    question: 'What types of documents can be processed?',
    answer:
      'AnyForm can process invoices, receipts, contracts, forms, reports, resumes, ID cards, and many other document types. The AI adapts to various document structures.',
  },
]

export function HelpSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Frequently Asked Questions</h3>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
            >
              <p className="font-medium text-foreground text-sm">
                {faq.question}
              </p>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-4 py-3 bg-muted/30 border-t border-border">
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
