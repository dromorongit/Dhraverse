'use client'

interface SupportChatMessageProps {
  message: {
    id: string
    role: 'user' | 'bot'
    content: string
    timestamp: Date
    confidence?: number
    suggestedEscalation?: boolean
  }
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function SupportChatMessage({ message }: SupportChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-royal-blue text-white rounded-br-sm'
            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-deep-navy to-royal-blue flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-royal-blue">Support AI</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-slate-400'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
