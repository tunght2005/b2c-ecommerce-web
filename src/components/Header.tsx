import { useState, useEffect, useRef } from 'react'
import { Search, ShoppingCart, User, Bell, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'
import { USER_INFO_KEY } from '../api/config'
import { API_BASE_URL } from '../api/config'
import { useWishlist } from '../context/WishlistContext'

function Header() {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ _id: string; name: string; thumbnail?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login')
  const { wishlistCount } = useWishlist()

  // --- STATE MỚI: Quản lý số lượng giỏ hàng ---
  const [cartCount, setCartCount] = useState(0)

  // --- STATE MỚI: Quản lý đăng nhập Profile ---
  const [userInfo, setUserInfo] = useState<Record<string, unknown> | null>(null)
  const [notiCount, setNotiCount] = useState(0)

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

  // Lắng nghe sự kiện đăng nhập thành công
  useEffect(() => {
    const loadUserInfo = () => {
      const raw = localStorage.getItem(USER_INFO_KEY)
      if (raw) {
        try { setUserInfo(JSON.parse(raw)) } catch { setUserInfo(null) }
      } else {
        setUserInfo(null)
      }
    }

    loadUserInfo() // Load lúc mới vào trang
    window.addEventListener('authChange', loadUserInfo)
    return () => window.removeEventListener('authChange', loadUserInfo)
  }, [])

  // --- LẮNG NGHE SỰ KIỆN: Đồng bộ số lượng giỏ hàng thực tế ---
  const refreshCartCount = async () => {
    const rawToken = localStorage.getItem('accessToken')
    if (!rawToken) {
      setCartCount(0)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${rawToken}` }
      })
      const data = await res.json()

      // Vét cạn cấu trúc để tìm mảng items
      let items: Record<string, unknown>[] = []
      if (Array.isArray(data)) items = data as Record<string, unknown>[]
      else if (data?.data?.items) items = data.data.items as Record<string, unknown>[]
      else if (data?.items) items = data.items as Record<string, unknown>[]
      else if (data?.data && Array.isArray(data.data)) items = data.data as Record<string, unknown>[]

      // Tính tổng số lượng (quantity) của tất cả item
      const total = items.reduce((sum: number, item: Record<string, unknown>) => sum + ((item.quantity as number) || 1), 0)
      setCartCount(total)
    } catch (error) {
      console.error('Không thể lấy số lượng giỏ hàng:', error)
    }
  }

  // --- LẮNG NGHE SỰ KIỆN: Thông báo ---
  const refreshNotiCount = async () => {
    const rawToken = localStorage.getItem('accessToken')
    if (!rawToken) {
      setNotiCount(0)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/notification`, {
        headers: { 'Authorization': `Bearer ${rawToken}` }
      })
      const data = await res.json()
      const notifications = data?.data || (Array.isArray(data) ? data : [])
      const unreadCount = notifications.filter((n: any) => !n.is_read).length
      setNotiCount(unreadCount)
    } catch (error) {
      console.error('Không thể lấy số lượng thông báo:', error)
    }
  }

  useEffect(() => {
    refreshNotiCount()
    const handleUpdate = () => refreshNotiCount()
    window.addEventListener('notificationChanged', handleUpdate)
    window.addEventListener('authChange', handleUpdate)
    return () => {
      window.removeEventListener('notificationChanged', handleUpdate)
      window.removeEventListener('authChange', handleUpdate)
    }
  }, [])

  useEffect(() => {
    refreshCartCount() // Load lần đầu khi mở web

    const handleUpdate = () => refreshCartCount()

    // Lắng nghe cả sự kiện cũ (addToCart) và sự kiện mới (cartChanged) cho chắc chắn
    window.addEventListener('addToCart', handleUpdate)
    window.addEventListener('cartChanged', handleUpdate)
    window.addEventListener('authChange', handleUpdate) // Khi login/logout cũng phải reset số

    return () => {
      window.removeEventListener('addToCart', handleUpdate)
      window.removeEventListener('cartChanged', handleUpdate)
      window.removeEventListener('authChange', handleUpdate)
    }
  }, [])

  const handleSearch = (value: string) => {
    setKeyword(value)
    if (!value.trim()) {
      setSuggestions([])
      return
    }

    // Debounce: Chờ 500ms sau khi ngừng gõ mới gọi API
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(value)}`)
        const data = await res.json()
        // Vét cạn cấu trúc JSON trả về
        const products = Array.isArray(data) ? data : (data?.data || data?.products || data?.results || [])
        setSuggestions(products.slice(0, 6)) // Chỉ hiện tối đa 6 gợi ý
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
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
                {isSearching && <p className='px-4 py-2 text-sm text-gray-400 animate-pulse'>Đang tìm kiếm...</p>}
                {suggestions.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setKeyword(item.name)
                      setSuggestions([])
                      navigate(`/products?q=${encodeURIComponent(item.name)}`)
                    }}
                    className='px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-none flex items-center gap-3'
                  >
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.name} className='w-8 h-8 object-cover rounded-lg flex-shrink-0 bg-gray-100' />
                    )}
                    <span className='text-sm text-gray-800 font-medium line-clamp-1'>{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-6 font-medium'>
          {!userInfo ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              className='flex items-center gap-2 hover:text-yellow-300 transition group'
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden border-2 border-white/30 group-hover:border-yellow-300 bg-white/20 transition">
                <User size={18} />
              </div>
              <span className='hidden sm:inline font-bold truncate max-w-[120px]'>{userInfo.username || 'Người dùng'}</span>
            </button>
          )}

          {userInfo && (
            <button
              onClick={() => navigate('/profile/notifications')}
              className='relative hover:text-yellow-300 transition'
            >
              <Bell size={20} />
              {notiCount > 0 && (
                <span className='absolute -top-1.5 -right-2 bg-yellow-400 text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-red-600'>
                  {notiCount > 9 ? '9+' : notiCount}
                </span>
              )}
            </button>
          )}

          {userInfo && (
            <button
              onClick={() => navigate('/profile/wishlist')}
              className='relative flex items-center gap-2 hover:text-yellow-300 transition'
              title='Sản phẩm yêu thích'
            >
              <Heart size={20} />
              <span className='hidden sm:inline'>Yêu thích</span>
              {(wishlistCount > 0) && (
                <span className='absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold'>
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>
          )}

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
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authInitialView} />
    </header>
  )
}

export default Header