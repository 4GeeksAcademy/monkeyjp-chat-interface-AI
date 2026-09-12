'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { SendHorizontal, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage, type Message } from '@/components/chat-message'
import { ThinkingIndicator } from '@/components/thinking-indicator'
import { MetricsSidebar } from '@/components/metrics-sidebar'

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hola, soy tu asistente de IA. ¿En qué puedo ayudarte hoy?',
  },
  {
    id: '2',
    role: 'user',
    content: '¿Puedes darme una idea para un proyecto?',
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'Claro. Podrías construir un panel de análisis en tiempo real que visualice datos de una API pública. Es un buen equilibrio entre frontend y manejo de datos.',
  },
]

const EMPTY_METRICS = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  model: 'gpt-4o-mini',
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isThinking])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isThinking) return

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text },
    ])
    setInput('')

    // Solo demostración visual del estado "Pensando..."
    setIsThinking(true)
    window.setTimeout(() => setIsThinking(false), 1600)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function handleClear() {
    setMessages([])
    setIsThinking(false)
  }

  return (
    <div className="flex h-dvh flex-col-reverse bg-background md:flex-row">
      <MetricsSidebar metrics={EMPTY_METRICS} onClear={handleClear} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquare className="size-4" aria-hidden="true" />
          </span>
          <h1 className="text-base font-semibold text-foreground">AI Chat</h1>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
            {messages.length === 0 && !isThinking ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <MessageSquare
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground text-balance">
                  No hay mensajes. Escribe algo para comenzar la conversación.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            {isThinking && <ThinkingIndicator />}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-border bg-background px-4 py-3"
        >
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Escribe un mensaje..."
              aria-label="Mensaje"
              className="max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none ring-ring placeholder:text-muted-foreground focus-visible:ring-2"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="h-11 shrink-0 gap-2 px-4"
            >
              <SendHorizontal className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
