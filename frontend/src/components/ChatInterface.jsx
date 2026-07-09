import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setFormData, setSuggestions, setLoading } from '../store/interactionSlice'
import { sendChatMessage } from '../api/chatApi'

export default function ChatInterface() {
  const dispatch = useDispatch()
  const messages = useSelector((s) => s.interaction.messages)
  const loading = useSelector((s) => s.interaction.loading)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    dispatch(addMessage({ role: 'user', content: text }))
    setInput('')
    dispatch(setLoading(true))

    try {
      const { reply, form_data, suggestions } = await sendChatMessage(text)
      if (form_data) dispatch(setFormData(form_data))
      if (suggestions) dispatch(setSuggestions(suggestions))
      dispatch(addMessage({ role: 'assistant', content: reply }))
    } catch (err) {
      dispatch(
        addMessage({
          role: 'assistant',
          content: `Sorry, something went wrong reaching the backend (${err.message}). Is it running on :8000?`,
        })
      )
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5">🤖 AI Assistant</p>
        <p className="text-xs text-slate-400">Log interaction details here via chat</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-blue-50 text-slate-700'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400">
              thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Describe Interaction..."
          className="flex-1 text-sm rounded-md border border-slate-300 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 disabled:opacity-50"
        >
          🤖 Log
        </button>
      </div>
    </div>
  )
}
