"use client"

interface CodeBlockProps {
  code: string
  language: string
  reveal?: boolean // when true, apply show/hide mechanic; when false, show full
}

export function CodeBlock({ code, language, reveal = false }: CodeBlockProps) {
  return (
    <pre className="size-full bg-muted p-4 rounded-lg overflow-x-auto text-sm">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  )
}
