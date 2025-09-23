"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  code: string
  language: string
  reveal?: boolean // when true, apply show/hide mechanic; when false, show full
  className?: string
}

export function CodeBlock({ code, language, reveal = false, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onCopy}
        className="absolute right-2 top-2 z-10 h-8 px-2 text-xs bg-transparent text-muted-foreground hover:text-foreground"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className={`w-full max-w-full bg-muted p-4 rounded-lg overflow-x-auto text-sm ${className}`}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}