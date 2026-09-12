'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { SendHorizontal, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage, type Message } from '@/components/chat-message'
import { ThinkingIndicator } from '@/components/thinking-indicator'
import { MetricsSidebar } from '@/components/metrics-sidebar'



const EMPTY_METRICS = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  model: '',
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState(EMPTY_METRICS)
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isThinking])

  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages')
    const storedMetrics = localStorage.getItem('chatMetrics')

    try {
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
      }

      if (storedMetrics) {
        setMetrics(JSON.parse(storedMetrics))
      }
    } catch (error) {
      console.error('Error al recuperar la sesión:', error)

      localStorage.removeItem('chatMessages')
      localStorage.removeItem('chatMetrics')
    }

    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    localStorage.setItem('chatMessages', JSON.stringify(messages))
  }, [messages, hydrated])

  useEffect(() => {
    if (!hydrated) return

    localStorage.setItem('chatMetrics', JSON.stringify(metrics))
  }, [metrics, hydrated])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const text = input.trim()
    
    if (!text || isThinking) return
    
    setError('')
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }

    const conversation = [...messages, userMessage]

    setMessages(conversation)
    setInput('')
    setIsThinking(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversation.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al comunicarse con la IA')
      }

      const cleanContent = data.choices[0].message.content
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .replace(/<think>[\s\S]*$/g, '')
        .trim()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: cleanContent,
      }

      setMessages((prev) => [...prev, assistantMessage])

      setMetrics((prev) => ({
        promptTokens:
          prev.promptTokens + (data.usage?.prompt_tokens ?? 0),
        completionTokens:
          prev.completionTokens + (data.usage?.completion_tokens ?? 0),
        totalTokens:
          prev.totalTokens + (data.usage?.total_tokens ?? 0),
        model: data.model ?? prev.model,
      }))
    } catch (error) {
      console.error(error)
      setError(
        error instanceof Error
          ? error.message
          : 'Ha ocurrido un error inesperado'
      )
    } finally {
      setIsThinking(false)
    }
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
    setMetrics(EMPTY_METRICS)
    setError('')

    localStorage.removeItem('chatMessages')
    localStorage.removeItem('chatMetrics')
  }

  return (
    <div className="flex h-dvh flex-col-reverse bg-background md:flex-row">
      <MetricsSidebar metrics={metrics} onClear={handleClear} />

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

        {error && (
          <div className="mx-auto w-full max-w-2xl px-4 pb-3">
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          </div>
        )}

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
