import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, User, Loader2 } from 'lucide-react'

// Cấu trúc tin nhắn dựa trên bảng ai_messages
interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  created_at: string
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Lời chào mặc định
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      content: 'Xin chào! Tôi là Trợ lý AI của SevenStore. Tôi có thể giúp gì cho bạn hôm nay?',
      created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const newUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, newUserMsg])
    setInput('')
    setIsTyping(true)

    // Giả lập thời gian AI phản hồi (Sau này bạn sẽ thay bằng API gọi Backend)
    setTimeout(() => {
      const newAiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Tôi đã nhận được yêu cầu của bạn. Tính năng kết nối Backend đang được phát triển, vui lòng quay lại sau nhé!',
        created_at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, newAiMsg])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickReply = (text: string) => {
    setInput(text)
    // Tự động focus và có thể gọi handleSend() luôn nếu muốn
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
        <Sparkles className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" size={16} />
        <Bot size={28} />
      </button>

      {/* CỬA SỔ CHAT AI */}
      <div
        className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-3xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm relative">
              <Bot size={20} />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-red-500 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-sm">SevenStore AI</h3>
              <p className="text-[11px] text-red-100">Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Khung chứa tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 no-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Nội dung */}
              <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 text-sm rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white rounded-tr-sm shadow-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 font-medium px-1">{msg.created_at}</span>
              </div>
            </div>
          ))}

          {/* Hiệu ứng AI đang gõ */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Gợi ý nhanh (Quick Replies) */}
        {messages.length === 1 && (
          <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100">
            <button onClick={() => handleQuickReply('Tìm sản phẩm đang giảm giá')} className="whitespace-nowrap px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-full hover:bg-red-50 transition">
              🔥 Sản phẩm HOT
            </button>
            <button onClick={() => handleQuickReply('Kiểm tra trạng thái đơn hàng')} className="whitespace-nowrap px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-full hover:bg-red-50 transition">
              📦 Kiểm tra đơn hàng
            </button>
          </div>
        )}

        {/* Khung nhập tin nhắn */}
        <div className="p-3 bg-white border-t border-gray-100 rounded-b-3xl">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi AI bất kỳ điều gì..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-xl flex items-center justify-center transition ${
                input.trim() && !isTyping ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
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