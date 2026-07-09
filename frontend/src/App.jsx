import LogInteractionForm from './components/LogInteractionForm'
import ChatInterface from './components/ChatInterface'

export default function App() {
  return (
    <div className="h-screen w-screen flex">
      <div className="w-3/5 h-full border-r border-slate-200">
        <LogInteractionForm />
      </div>
      <div className="w-2/5 h-full">
        <ChatInterface />
      </div>
    </div>
  )
}
