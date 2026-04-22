import { useState, useEffect, useRef } from 'react'
import { Search, ShoppingCart, User, Bell, Moon, Sun, ChevronRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'
import { API_BASE_URL, USER_INFO_KEY, REFRESH_TOKEN_KEY, TOKEN_KEY, resolveImageUrl } from '../api/config'
import { fetchClient } from '../api/fetchClient'
import CartPopover, { type CartPopoverItem } from './popovers/CartPopover'
import UserPopover from './popovers/UserPopover'
import NotificationPopover from './popovers/NotificationPopover'

interface UserInfo {
  username?: string
  email?: string
  avatar?: string
}

interface SearchSuggestion {
  _id: string
  name: string
  thumbnail?: string
  image?: string
  price?: number
}

interface NotificationItem {
  _id: string
  title?: string
  content?: string
  is_read?: boolean
  createdAt?: string
}

function Header() {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login')
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const cartWrapRef = useRef<HTMLDivElement | null>(null)
  const userWrapRef = useRef<HTMLDivElement | null>(null)
  const notiWrapRef = useRef<HTMLDivElement | null>(null)

  // --- STATE MỚI: Quản lý số lượng giỏ hàng ---
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState<CartPopoverItem[]>([])
  const [isCartPopoverOpen, setIsCartPopoverOpen] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(false)

  // --- STATE MỚI: Quản lý user popover ---
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false)

  // --- STATE MỚI: Quản lý notification popover ---
  const [isNotiPopoverOpen, setIsNotiPopoverOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isNotiLoading, setIsNotiLoading] = useState(false)

  // --- STATE MỚI: Quản lý đăng nhập Profile ---
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [notiCount, setNotiCount] = useState(0)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialMode = storedTheme ? storedTheme === 'dark' : isSystemDark
    setIsDark(initialMode)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    const themeColor = isDark ? '#020617' : '#f3f4f6'
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) metaTheme.setAttribute('content', themeColor)
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

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
      window.removeEventListener('openAuthModal', handleOpenModalFromOutside as EventListener)
    }
  }, [])

  // Lắng nghe sự kiện đăng nhập thành công
  useEffect(() => {
    const loadUserInfo = () => {
      const raw = localStorage.getItem(USER_INFO_KEY)
      if (raw) {
        try {
          setUserInfo(JSON.parse(raw))
        } catch {
          setUserInfo(null)
        }
      } else {
        setUserInfo(null)
      }
    }

    loadUserInfo() // Load lúc mới vào trang
    window.addEventListener('authChange', loadUserInfo)
    return () => window.removeEventListener('authChange', loadUserInfo)
  }, [])

  const normalizeCartItems = (payload: unknown): CartPopoverItem[] => {
    const raw = payload as any
    const loadedItems = raw?.data?.items || raw?.data || raw?.items || raw

    if (!Array.isArray(loadedItems)) return []

    return loadedItems.map((item: any, index: number) => {
      const variant = item.variant_id as Record<string, unknown> | undefined
      const product = variant?.product_id as Record<string, unknown> | undefined

      return {
        _id: variant?._id || item._id || item.id || `${index}`,
        name: item.name || (product?.name as string) || 'Sản phẩm từ Server',
        price: Number(variant?.price || product?.price || 0),
        quantity: Number(item.quantity || 1),
        image: item.image || (product?.image as string) || undefined,
        variant: item.variant || (variant?.sku as string) || 'Tiêu chuẩn'
      }
    })
  }

  // --- LẮNG NGHE SỰ KIỆN: Đồng bộ số lượng giỏ hàng thực tế ---
  const refreshCartData = async () => {
    const rawToken = localStorage.getItem('accessToken')
    if (!rawToken) {
      setCartCount(0)
      setCartItems([])
      return
    }

    try {
      setIsCartLoading(true)
      const res = await fetchClient<unknown>('/cart')
      const items = normalizeCartItems(res)

      const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
      setCartCount(total)
      setCartItems(items)
    } catch (error) {
      console.error('Không thể lấy số lượng giỏ hàng:', error)
      setCartCount(0)
      setCartItems([])
    } finally {
      setIsCartLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetchClient('/auth/logout', { method: 'POST' }).catch(() => {})
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_INFO_KEY)
      window.dispatchEvent(new Event('authChange'))
      setIsUserPopoverOpen(false)
      navigate('/')
    }
  }

  // --- LẮNG NGHE SỰ KIỆN: Thông báo ---
  const refreshNotiData = async () => {
    const rawToken = localStorage.getItem('accessToken')
    if (!rawToken) {
      setNotiCount(0)
      setNotifications([])
      return
    }

    try {
      setIsNotiLoading(true)
      const data = await fetchClient<Record<string, unknown>>('/notification')
      const rawData = data as any
      let notifications: any[] = []
      const nestedNotifications = rawData?.data?.notifications

      if (Array.isArray(rawData)) notifications = rawData
      else if (Array.isArray(rawData?.data)) notifications = rawData.data
      else if (Array.isArray(rawData?.notifications)) notifications = rawData.notifications
      else if (Array.isArray(nestedNotifications)) notifications = nestedNotifications

      const unreadNotifications = notifications
        .filter((n: any) => !n.is_read)
        .sort(
          (a: any, b: any) =>
            new Date(b?.createdAt || b?.created_at || 0).getTime() -
            new Date(a?.createdAt || a?.created_at || 0).getTime()
        )

      const unreadCount = unreadNotifications.length
      setNotiCount(unreadCount)
      setNotifications(unreadNotifications)
    } catch (error) {
      console.error('Không thể lấy số lượng thông báo:', error)
      setNotiCount(0)
      setNotifications([])
    } finally {
      setIsNotiLoading(false)
    }
  }

  const handleOpenNotifications = async () => {
    setIsNotiPopoverOpen((prev) => !prev)
    setIsCartPopoverOpen(false)
    setIsUserPopoverOpen(false)
    setSuggestions([])
  }

  const handleNotificationClick = async (id: string) => {
    try {
      await fetchClient(`/notification/${id}/read`, { method: 'PATCH' })
    } catch {
      // Không chặn UX nếu mark as read bị lỗi
    } finally {
      refreshNotiData()
    }
  }

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await fetchClient('/notification/read-all', { method: 'PATCH' })
    } catch {
      // Không chặn UX nếu mark all bị lỗi
    } finally {
      refreshNotiData()
    }
  }

  useEffect(() => {
    refreshNotiData()
    const handleUpdate = () => refreshNotiData()
    window.addEventListener('notificationChanged', handleUpdate)
    window.addEventListener('authChange', handleUpdate)
    return () => {
      window.removeEventListener('notificationChanged', handleUpdate)
      window.removeEventListener('authChange', handleUpdate)
    }
  }, [])

  useEffect(() => {
    refreshCartData() // Load lần đầu khi mở web

    const handleUpdate = () => refreshCartData()

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

  useEffect(() => {
    if (isCartPopoverOpen) {
      refreshCartData()
    }
  }, [isCartPopoverOpen])

  useEffect(() => {
    if (isNotiPopoverOpen) {
      refreshNotiData()
    }
  }, [isNotiPopoverOpen])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node

      if (isCartPopoverOpen && cartWrapRef.current && !cartWrapRef.current.contains(target)) {
        setIsCartPopoverOpen(false)
      }

      if (isUserPopoverOpen && userWrapRef.current && !userWrapRef.current.contains(target)) {
        setIsUserPopoverOpen(false)
      }

      if (isNotiPopoverOpen && notiWrapRef.current && !notiWrapRef.current.contains(target)) {
        setIsNotiPopoverOpen(false)
      }

      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) {
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isCartPopoverOpen, isUserPopoverOpen, isNotiPopoverOpen])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
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
        const products = Array.isArray(data) ? data : data?.data || data?.products || data?.results || []
        setSuggestions(products.slice(0, 6)) // Chỉ hiện tối đa 6 gợi ý
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }

  const isSearchPopoverOpen = Boolean(keyword.trim())

  return (
    <header className='theme-header shadow-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4'>
        {/* LOGO MỚI ĐƯỢC THÊM VÀO ĐÂY */}
        <img
          src='/logo.svg'
          alt='7Store Logo'
          onClick={() => navigate('/')}
          className='h-8 sm:h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity shrink-0'
        />

        <div ref={searchWrapRef} className='flex-1 flex justify-center relative'>
          <div className='relative w-full max-w-[500px]'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
            <input
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Tìm kiếm điện thoại, laptop...'
              className='w-full pl-10 pr-4 py-2 rounded-xl text-black outline-none focus:ring-2 focus:ring-yellow-400 theme-search'
              onFocus={() => {
                if (keyword.trim()) setSuggestions((prev) => prev)
              }}
            />
            {isSearchPopoverOpen && (
              <div className='absolute top-full left-0 w-full bg-white text-black rounded-3xl shadow-2xl mt-3 z-50 overflow-hidden border border-gray-100'>
                <div className='flex items-center justify-between border-b border-gray-100 px-4 py-3'>
                  <div>
                    <p className='text-[11px] font-black uppercase tracking-[0.22em] text-red-500'>Tìm kiếm sản phẩm</p>
                    <p className='text-xs text-gray-500'>Kết quả phù hợp với từ khóa hiện tại</p>
                  </div>
                  {isSearching && <Loader2 className='animate-spin text-red-500' size={18} />}
                </div>

                <div className='max-h-[340px] overflow-auto p-2'>
                  {isSearching ? (
                    <div className='px-4 py-8 text-center text-sm text-gray-500'>Đang tìm kiếm...</div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={item._id}
                        type='button'
                        onClick={() => {
                          setKeyword('')
                          setSuggestions([])
                          navigate(`/product/${item._id}`)
                        }}
                        className='flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-red-50'
                      >
                        <div className='h-11 w-11 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100'>
                          <img
                            src={
                              resolveImageUrl(item.thumbnail || item.image) ||
                              'https://via.placeholder.com/80x80?text=7Store'
                            }
                            alt={item.name}
                            className='h-full w-full object-cover'
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-semibold text-gray-900'>{item.name}</p>
                          <p className='mt-0.5 text-xs text-gray-500'>Bấm để xem chi tiết sản phẩm</p>
                        </div>
                        <ChevronRight size={16} className='text-gray-300' />
                      </button>
                    ))
                  ) : (
                    <div className='px-4 py-8 text-center text-sm text-gray-500'>
                      Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa khác.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-6 font-medium'>
          <button
            onClick={toggleTheme}
            className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-full px-3 py-2 transition shadow-sm border border-white/20'
            title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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
            <div ref={userWrapRef} className='relative'>
              <button
                onClick={() => {
                  setIsUserPopoverOpen((prev) => !prev)
                  setIsCartPopoverOpen(false)
                  setSuggestions([])
                }}
                className='flex items-center gap-2 hover:text-yellow-300 transition group'
              >
                <div className='w-8 h-8 flex items-center justify-center rounded-full overflow-hidden border-2 border-white/30 group-hover:border-yellow-300 bg-white/20 transition'>
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt='Avatar' className='w-full h-full object-cover' />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <span className='hidden sm:inline font-bold truncate max-w-[120px]'>
                  {userInfo.username || 'Người dùng'}
                </span>
              </button>

              <UserPopover
                open={isUserPopoverOpen}
                user={userInfo}
                onProfile={() => {
                  setIsUserPopoverOpen(false)
                  navigate('/profile')
                }}
                onOrders={() => {
                  setIsUserPopoverOpen(false)
                  navigate('/profile/orders')
                }}
                onLogout={handleLogout}
              />
            </div>
          )}

          {userInfo && (
            <div ref={notiWrapRef} className='relative'>
              <button onClick={handleOpenNotifications} className='relative hover:text-yellow-300 transition'>
                <Bell size={20} />
                {notiCount > 0 && (
                  <span className='absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold'>
                    {notiCount > 99 ? '99+' : notiCount}
                  </span>
                )}
              </button>

              <NotificationPopover
                open={isNotiPopoverOpen}
                loading={isNotiLoading}
                items={notifications}
                unreadCount={notiCount}
                onMarkAsRead={handleNotificationClick}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onOpenAll={() => {
                  setIsNotiPopoverOpen(false)
                  navigate('/profile/notifications')
                }}
              />
            </div>
          )}

          <div ref={cartWrapRef} className='relative'>
            <button
              onClick={() => {
                setIsCartPopoverOpen((prev) => !prev)
                setIsUserPopoverOpen(false)
                setSuggestions([])
              }}
              className='relative flex items-center gap-2 hover:text-yellow-300 transition'
            >
              <ShoppingCart size={30} />

              {/* Nếu có sản phẩm thì mới hiện cục màu vàng, số lượng lấy từ state cartCount */}
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-3 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold'>
                  {cartCount}
                </span>
              )}
            </button>

            <CartPopover
              open={isCartPopoverOpen}
              loading={isCartLoading}
              items={cartItems}
              totalItems={cartCount}
              onViewCart={() => {
                setIsCartPopoverOpen(false)
                navigate('/cart')
              }}
            />
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authInitialView} />
    </header>
  )
}

export default Header
