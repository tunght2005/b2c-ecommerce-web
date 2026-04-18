import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, User, Loader2, RotateCcw } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import { TOKEN_KEY } from '../api/config'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  created_at: string
}

interface ChatHistoryItem {
  _id: string
  message: string
  reply: string
  createdAt?: string
  created_at?: string
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const welcomeMsg: Message = {
    id: 1,
    role: 'ai',
    content: 'Xin chào! Tôi là Trợ lý AI của SevenStore. Bạn cần tìm sản phẩm gì hay cần hỗ trợ gì không?',
    created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const [messages, setMessages] = useState<Message[]>([welcomeMsg])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Load lịch sử chat từ API khi mở chatbox (chỉ load 1 lần)
  useEffect(() => {
    if (!isOpen || historyLoaded) return
    const isLoggedIn = !!localStorage.getItem(TOKEN_KEY)
    if (!isLoggedIn) return // Chỉ load history khi đã đăng nhập

    const loadHistory = async () => {
      try {
        const res = await fetchClient<any>('/chatbot/history?limit=20')
        let history: ChatHistoryItem[] = []
        if (Array.isArray(res)) history = res
        else if (Array.isArray(res?.data)) history = res.data
        else if (Array.isArray(res?.data?.items)) history = res.data.items
        else if (Array.isArray(res?.history)) history = res.history

        if (history.length > 0) {
          // Chuyển history sang format Message (mỗi item có message + reply)
          const historyMsgs: Message[] = []
          history
            .slice()
            .reverse()
            .forEach((item, idx) => {
              const ts = new Date(item.createdAt || item.created_at || Date.now()).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })
              historyMsgs.push({ id: idx * 2 + 2, role: 'user', content: item.message, created_at: ts })
              historyMsgs.push({ id: idx * 2 + 3, role: 'ai', content: item.reply, created_at: ts })
            })
          setMessages([welcomeMsg, ...historyMsgs])
        }
      } catch {
        // Bỏ qua lỗi load history
      } finally {
        setHistoryLoaded(true)
      }
    }
    loadHistory()
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userContent = input.trim()
    const newUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: userContent,
      created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, newUserMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetchClient<any>('/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userContent })
      })

      // Parse response — có thể là { reply: "..." } hoặc { data: { reply: "..." } } hoặc { message: "..." }
      const replyText: string =
        res?.reply ||
        res?.data?.reply ||
        res?.message ||
        res?.data?.message ||
        res?.response ||
        res?.answer ||
        'Xin lỗi, tôi không thể xử lý yêu cầu này ngay bây giờ. Vui lòng thử lại!'

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: replyText,
        created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng và thử lại nhé!',
        created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickReply = (text: string) => {
    setInput(text)
  }

  const handleClearChat = () => {
    setMessages([welcomeMsg])
    setHistoryLoaded(false)
  }

  return (
    <>
      {/* NÚT BONG BÓNG CHAT NỔI Ở GÓC DƯỚI */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-red-500/50 transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <Sparkles className='absolute -top-1 -right-1 text-yellow-300 animate-pulse' size={16} />
        <Bot size={28} />
      </button>

      {/* CỬA SỔ CHAT AI */}
      <div
        className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl shadow-md'>
          <div className='flex items-center gap-3'>
            <div className='bg-white/20 p-2 rounded-xl backdrop-blur-sm relative'>
              <Bot size={20} />
              <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-red-500 rounded-full'></div>
            </div>
            <div>
              <h3 className='font-bold text-sm'>SevenStore AI</h3>
              <p className='text-[11px] text-red-100'>Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={handleClearChat}
              title='Xóa lịch sử chat'
              className='p-2 hover:bg-white/20 rounded-full transition'
            >
              <RotateCcw size={16} />
            </button>
            <button onClick={() => setIsOpen(false)} className='p-2 hover:bg-white/20 rounded-full transition'>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Khung chứa tin nhắn */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 no-scrollbar'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-600'}`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Nội dung */}
              <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 text-sm rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-tr-sm shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className='text-[10px] text-gray-400 font-medium px-1'>{msg.created_at}</span>
              </div>
            </div>
          ))}

          {/* Hiệu ứng AI đang gõ */}
          {isTyping && (
            <div className='flex gap-3 max-w-[85%] mr-auto'>
              <div className='w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center'>
                <Bot size={16} />
              </div>
              <div className='bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5'>
                <div className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'></div>
                <div
                  className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Gợi ý nhanh (Quick Replies) — chỉ hiện lúc mới mở */}
        {messages.length <= 1 && (
          <div className='px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100'>
            <button
              onClick={() => handleQuickReply('Tìm sản phẩm đang giảm giá')}
              className='whitespace-nowrap px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-full hover:bg-red-50 transition'
            >
              🔥 Sản phẩm HOT
            </button>
            <button
              onClick={() => handleQuickReply('Điện thoại nào tốt nhất dưới 10 triệu?')}
              className='whitespace-nowrap px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-full hover:bg-red-50 transition'
            >
              📱 Gợi ý điện thoại
            </button>
            <button
              onClick={() => handleQuickReply('Laptop gaming giá tốt')}
              className='whitespace-nowrap px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-full hover:bg-red-50 transition'
            >
              💻 Laptop gaming
            </button>
          </div>
        )}

        {/* Khung nhập tin nhắn */}
        <div className='p-3 bg-white border-t border-gray-100 rounded-b-3xl'>
          <div className='flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 transition-all'>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder='Hỏi AI bất kỳ điều gì...'
              className='flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400'
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-xl flex items-center justify-center transition ${
                input.trim() && !isTyping
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isTyping ? <Loader2 size={18} className='animate-spin' /> : <Send size={18} className='ml-0.5' />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}
