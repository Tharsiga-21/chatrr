
import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import './App.css'
 
const ROOMS = ['General', 'College', 'Random', 'Study']
 
function App() {
  const [username, setUsername] = useState('')
  const [enteredName, setEnteredName] = useState(false)
  const [room, setRoom] = useState('General')
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef(null)
  const channelRef = useRef(null)
 
  useEffect(() => {
    if (!enteredName) return
 
    setMessages([])
 
    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, created_at, username, message, room')
        .eq('room', room)
        .order('created_at', { ascending: true })
      
      if (!error && data) {
        setMessages(data)
      }
    }
 
    fetchMessages()
 
    // Remove old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }
 
    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`room-${room}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room=eq.${room}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()
 
    channelRef.current = channel
 
    return () => {
      supabase.removeChannel(channel)
    }
  }, [room, enteredName])
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
 
  const sendMessage = async () => {
    if (!newMessage.trim()) return
    const { error } = await supabase.from('messages').insert({
      username,
      message: newMessage.trim(),
      room
    })
    if (!error) setNewMessage('')
  }
 
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
 
  // Username screen
  if (!enteredName) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <div className="login-icon">💬</div>
          <h1>Chatrr</h1>
          <p>Chat with your college friends in real-time</p>
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && username.trim() && setEnteredName(true)}
            maxLength={20}
          />
          <button
            onClick={() => username.trim() && setEnteredName(true)}
            disabled={!username.trim()}
          >
            Start Chatting →
          </button>
        </div>
      </div>
    )
  }
 
  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">💬 Chatrr</div>
          <div className="user-badge">{username[0].toUpperCase()}</div>
        </div>
        <div className="rooms-label">ROOMS</div>
        {ROOMS.map((r) => (
          <button
            key={r}
            className={`room-btn ${room === r ? 'active' : ''}`}
            onClick={() => setRoom(r)}
          >
            # {r}
          </button>
        ))}
        <div className="sidebar-footer">
          Logged in as <strong>{username}</strong>
        </div>
      </div>
 
      {/* Main chat area */}
      <div className="chat">
        <div className="chat-header">
          <span># {room}</span>
          <span className="online-dot">● Online</span>
        </div>
 
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              No messages yet. Say hello! 👋
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.username === username ? 'own' : ''}`}
            >
              {msg.username !== username && (
                <div className="msg-avatar">{msg.username[0].toUpperCase()}</div>
              )}
              <div className="msg-content">
                {msg.username !== username && (
                  <div className="msg-name">{msg.username}</div>
                )}
                <div className="msg-bubble">{msg.message}</div>
                <div className="msg-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
 
        <div className="input-area">
          <input
            type="text"
            placeholder={`Message #${room}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage} disabled={!newMessage.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
 
export default App
 