'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { SupportChatMessage } from '@/components/support-ai/support-chat-message'
import { WHATSAPP_SUPPORT_LINK } from '@/lib/support-ai/knowledge-base'
import type { SupportChatMessage as SupportChatMessageType } from '@/lib/support-ai/types'

const GREETING: SupportChatMessageType = {
  id: 'greeting',
  role: 'bot',
  content: `Hi there! I'm the Dhream Market Support AI. I can help with:\n\n• Payment methods and policies\n• Refund and return information\n• Delivery expectations\n• How to register as a vendor\n• How to list products\n• Vendor payout timing\n• Order status lookups (log in required)\n• Payout/onboarding status (log in required)\n• Password reset help\n\nWhat can I help you with today?`,
  timestamp: new Date(),
}

export function SupportChatWidget({ userRole }: { userRole?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<SupportChatMessageType[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const isVendor = userRole === 'VENDOR'

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || loading) return

      setError('')

      const userMessage: SupportChatMessageType = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setLoading(true)

      try {
        const res = await fetch('/api/support-ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
          credentials: 'include',
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong. Please try again.')
        }

        const botMessage: SupportChatMessageType = {
          id: `bot_${Date.now()}`,
          role: 'bot',
          content: data.response,
          timestamp: new Date(),
          confidence: data.confidence,
          suggestedEscalation: data.suggestedEscalation,
        }

        setMessages((prev) => [...prev, botMessage])
      } catch {
        const fallback: SupportChatMessageType = {
          id: `bot_${Date.now()}`,
          role: 'bot',
          content: `Something went wrong. Please try again or contact our support team:\n\nWhatsApp: ${WHATSAPP_SUPPORT_LINK}`,
          timestamp: new Date(),
          suggestedEscalation: true,
        }
        setMessages((prev) => [...prev, fallback])
      } finally {
        setLoading(false)
      }
    },
    [input, loading]
  )

  return (
    <div className="fixed bottom-20 right-5 z-[60]">
      {isOpen && (
        <div className="mb-4 w-[380px] max-w-[calc(100vw-40px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[520px]">
          <div className="bg-gradient-to-r from-deep-navy to-royal-blue text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support AI</h3>
                <p className="text-[11px] text-white/70">
                  {isVendor ? 'Vendor Help' : 'Buyer Help'} — Always here for you
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close Support AI"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-[280px] max-h-[340px]">
            {messages.map((msg) => (
              <SupportChatMessage key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-4 py-2 text-red-600 text-xs bg-red-50 border-t border-gray-100">
              {error}
            </div>
          )}

          <div className="p-3 border-t border-gray-100 flex-shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder={isVendor ? 'Ask about payouts, listings...' : 'Ask about orders, payments...'}
                value={input}
                onChange={(e) => { setInput(e.target.value); setError('') }}
                disabled={loading}
                className="flex-1 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || loading}
                className="px-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-royal-blue to-deep-navy hover:shadow-xl"
        aria-label={isOpen ? 'Close Support AI' : 'Open Support AI'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </Button>
    </div>
  )
}
