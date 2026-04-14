import { useState, useEffect } from 'react'
import { Search, ShoppingCart, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'

function Header() {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const navigate = useNavigate()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login')

  // --- STATE MỚI: Quản lý số lượng giỏ hàng ---
  const [cartCount, setCartCount] = useState(0)

  const fakeData = [
    'iPhone 15 Pro Max',
    'iPhone 14 Pro',
    'Samsung S25 Ultra',
    'MacBook Air M3',
    'Apple Watch Series 9',
    'Tai nghe AirPods Pro'
  ]

  const openAuthModal = (view: 'login' | 'register') => {
    setAuthInitialView(view)
    setIsAuthModalOpen(true)
  }

  // Lắng nghe sự kiện mở Modal Đăng nhập/Đăng ký
  useEffect(() => {
    const handleOpenModalFromOutside = (event: CustomEvent<{ view?: 'login' | 'register' }>) => {
      const view = event.detail?.view || 'login'
      openAuthModal(view)
    }

    window.addEventListener('openAuthModal', handleOpenModalFromOutside as EventListener)

    return () => {
      window.removeEventListener(
        'openAuthModal',
        handleOpenModalFromOutside as EventListener
      )
    }
  }, [])

  // --- LẮNG NGHE SỰ KIỆN: Tăng số lượng giỏ hàng ---
  useEffect(() => {
    const handleAddToCart = () => {
      setCartCount((prevCount) => prevCount + 1)
    }

    // Đăng ký sự kiện 'addToCart'
    window.addEventListener('addToCart', handleAddToCart)

    // Dọn dẹp sự kiện
    return () => window.removeEventListener('addToCart', handleAddToCart)
  }, [])

  const handleSearch = (value: string) => {
    setKeyword(value)
    if (!value.trim()) {
      setSuggestions([])
      return
    }
    const result = fakeData.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
    setSuggestions(result)
  }

  return (
    <header className='bg-red-600 text-white shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4'>
        
        {/* LOGO MỚI ĐƯỢC THÊM VÀO ĐÂY */}
        <img
          src="/logo.svg"
          alt="SevenStore Logo"
          onClick={() => navigate('/')}
          className="h-8 sm:h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity shrink-0"
        />

        <div className='flex-1 flex justify-center relative'>
          <div className='relative w-full max-w-[500px]'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
            <input
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Tìm kiếm điện thoại, laptop...'
              className='w-full pl-10 pr-4 py-2 rounded-xl text-black outline-none focus:ring-2 focus:ring-yellow-400'
            />
            {suggestions.length > 0 && (
              <div className='absolute top-full left-0 w-full bg-white text-black rounded-xl shadow-lg mt-2 z-50 overflow-hidden'>
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setKeyword(item)
                      setSuggestions([])
                    }}
                    className='px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-none'
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-6 font-medium'>
          <button
            onClick={() => openAuthModal('login')}
            className='flex items-center gap-2 hover:text-yellow-300 transition'
          >
            <User size={18} />
            <span className='hidden sm:inline'>Đăng nhập</span>
          </button>

          <button
            onClick={() => openAuthModal('register')}
            className='flex items-center gap-2 hover:text-yellow-300 transition'
          >
            <User size={18} />
            <span className='hidden sm:inline'>Đăng ký</span>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className='relative flex items-center gap-2 hover:text-yellow-300 transition'
          >
            <ShoppingCart size={20} />
            <span className='hidden sm:inline'>Giỏ hàng</span>

            {/* Nếu có sản phẩm thì mới hiện cục màu vàng, số lượng lấy từ state cartCount */}
            {cartCount > 0 && (
              <span className='absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold'>
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className='flex items-center gap-2 hover:text-yellow-300 transition group'
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-yellow-300 transition">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className='hidden sm:inline font-bold'>Huong Tran</span>
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authInitialView} />
    </header>
  )
}

export default Header