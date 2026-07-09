const API_BASE = 'http://localhost:8000/api'

export async function sendChatMessage(message, sessionId = 'default') {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  })
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)
  return res.json() // { reply, form_data, suggestions }
}
