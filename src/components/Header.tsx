import { useState, useEffect, useRef } from 'react'
import { Search, ShoppingCart, User, Bell, Moon, Sun, ChevronRight, Loader2, X } from 'lucide-react'
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
  const headerRef = useRef<HTMLElement | null>(null)
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login')
  const searchWrapRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchRef = useRef<HTMLDivElement | null>(null)
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

  useEffect(() => {
    document.body.style.overflow = isMobileSearchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileSearchOpen])

  useEffect(() => {
    const syncHeaderHeight = () => {
      const height = headerRef.current?.offsetHeight ?? 0
      document.documentElement.style.setProperty('--header-height', `${height}px`)
    }

    syncHeaderHeight()
    window.addEventListener('resize', syncHeaderHeight)
    return () => {
      window.removeEventListener('resize', syncHeaderHeight)
    }
  }, [userInfo, keyword, suggestions.length, isMobileSearchOpen])

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
      const productId = (product?._id as string) || (product?.id as string) || ''

      return {
        _id: variant?._id || item._id || item.id || `${index}`,
        productId: productId || undefined,
        name: item.name || (product?.name as string) || 'Sản phẩm từ Server',
        variantId: variant?._id || item.variant_id?._id || item.variant_id || undefined,
        price: Number(variant?.price || product?.price || 0),
        quantity: Number(item.quantity || 1),
        image: item.image || (product?.thumbnail as string) || (product?.image as string) || undefined,
        variant: item.variant || (variant?.sku as string) || 'Tiêu chuẩn'
      }
    })
  }

  const fetchProductImage = async (productId: string) => {
    if (!productId) return undefined

    try {
      const res = await fetchClient<Record<string, unknown>>(`/product-images/product/${productId}`).catch(() => null)
      const data = (res as any)?.data || res
      const images = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
      const primaryImage = images.find((img: Record<string, unknown>) => img?.is_primary) || images[0]
      return resolveImageUrl((primaryImage?.url as string | undefined) || undefined)
    } catch {
      return undefined
    }
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
      const baseItems = normalizeCartItems(res)

      const items = await Promise.all(
        baseItems.map(async (item) => {
          if (!item.variantId) return item

          try {
            const promoRes = await fetchClient<Record<string, unknown>>(`/promotions/best/${item.variantId}`)
            const promo = (promoRes as any)?.data || promoRes

            const promoFinalPrice = Number(promo?.final_price)
            const promoOriginalPrice = Number(promo?.original_price)

            if (Number.isFinite(promoFinalPrice) && promoFinalPrice > 0) {
              return {
                ...item,
                price: promoFinalPrice,
                oldPrice:
                  Number.isFinite(promoOriginalPrice) && promoOriginalPrice > promoFinalPrice
                    ? promoOriginalPrice
                    : item.price
              }
            }
          } catch {
            // giữ giá gốc nếu promo lỗi
          }

          return item
        })
      )

      const productIds = Array.from(
        new Set(
          items
            .map((item: any) => {
              return (item.productId as string) || ''
            })
            .filter(Boolean)
        )
      )

      const productImages = await Promise.all(
        productIds.map(async (productId) => [productId, await fetchProductImage(productId)] as const)
      )
      const productImageMap = new Map(productImages.filter(([, image]) => Boolean(image)))

      const itemsWithImages = items.map((item: any) => {
        const productId = (item.productId as string) || ''
        const imageFromApi = item.image

        return {
          ...item,
          productId: productId || item.productId,
          productImage: productImageMap.get(productId) || item.productImage,
          image: resolveImageUrl(imageFromApi as string | undefined) || productImageMap.get(productId) || item.image
        }
      })

      const total = itemsWithImages.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
      setCartCount(total)
      setCartItems(itemsWithImages)
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
        if (!mobileSearchRef.current || !mobileSearchRef.current.contains(target)) {
          setSuggestions([])
        }
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
        const topProducts = products.slice(0, 6)

        const productsWithImages = await Promise.all(
          topProducts.map(async (product: SearchSuggestion & { thumbnail?: string; image?: string }) => {
            const existingImage = resolveImageUrl(product.thumbnail || product.image)
            if (existingImage) {
              return { ...product, image: existingImage }
            }

            const productImage = await fetchProductImage(product._id)
            return { ...product, image: productImage }
          })
        )

        setSuggestions(productsWithImages) // Chỉ hiện tối đa 6 gợi ý
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }

  const isSearchPopoverOpen = Boolean(keyword.trim())

  const renderSearchSuggestions = (mode: 'desktop' | 'mobile') => {
    if (!isSearchPopoverOpen) return null

    return (
      <div
        className={
          mode === 'desktop'
            ? 'absolute top-full left-0 w-full bg-white text-black rounded-3xl shadow-2xl mt-3 z-50 overflow-hidden border border-gray-100'
            : 'mt-3 overflow-hidden rounded-3xl border border-gray-100 bg-white text-black shadow-2xl'
        }
      >
        <div className='flex items-center justify-between border-b border-gray-100 px-4 py-3'>
          <div>
            <p className='text-[11px] font-black uppercase tracking-[0.22em] text-red-500'>Tìm kiếm sản phẩm</p>
            <p className='text-xs text-gray-500'>Kết quả phù hợp với từ khóa hiện tại</p>
          </div>
          {isSearching && <Loader2 className='animate-spin text-red-500' size={18} />}
        </div>

        <div className='max-h-85 overflow-auto p-2'>
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
                  setIsMobileSearchOpen(false)
                  navigate(`/product/${item._id}`)
                }}
                className='flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-red-50'
              >
                <div className='h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-gray-100'>
                  <img
                    src={
                      resolveImageUrl(item.thumbnail || item.image) || 'https://via.placeholder.com/80x80?text=7Store'
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
    )
  }

  return (
    <header ref={headerRef} className='theme-header sticky top-0 z-50 shadow-md'>
      <div className='mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <img
            src='/logo.svg'
            alt='7Store Logo'
            onClick={() => navigate('/')}
            className='h-8 w-auto shrink-0 cursor-pointer object-contain transition-opacity hover:opacity-80 sm:h-10'
          />

          <div ref={searchWrapRef} className='relative hidden flex-1 md:block'>
            <div className='relative w-full max-w-130 lg:max-w-155'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                value={keyword}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder='Tìm kiếm điện thoại, laptop...'
                className='w-full rounded-full py-2 pl-10 pr-4 text-black outline-none focus:ring-2 focus:ring-yellow-400 theme-search'
                onFocus={() => {
                  if (keyword.trim()) setSuggestions((prev) => prev)
                }}
              />
              {renderSearchSuggestions('desktop')}
            </div>
          </div>

          <div className='ml-auto flex items-center gap-2 font-medium sm:gap-3 lg:gap-5'>
            <button
              onClick={() => {
                setIsMobileSearchOpen(true)
                setIsCartPopoverOpen(false)
                setIsUserPopoverOpen(false)
                setIsNotiPopoverOpen(false)
              }}
              className='rounded-full p-2 transition hover:bg-white/10 hover:text-yellow-300 md:hidden'
              title='Tìm kiếm'
            >
              <Search size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className='flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-2 text-white shadow-sm transition hover:bg-white/20 sm:px-3'
              title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
              <span className='hidden lg:inline text-sm'>{isDark ? 'Sáng' : 'Tối'}</span>
            </button>

            {!userInfo ? (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className='flex items-center gap-2 rounded-full px-2 py-2 transition hover:bg-white/10 hover:text-yellow-300 sm:px-3'
                >
                  <User size={18} />
                  <span className='hidden md:inline'>Đăng nhập</span>
                </button>

                <button
                  onClick={() => openAuthModal('register')}
                  className='hidden items-center gap-2 rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-yellow-300 md:flex'
                >
                  <User size={18} />
                  <span>Đăng ký</span>
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
                  className='group flex items-center gap-2 rounded-full px-1 py-1 transition hover:bg-white/10 hover:text-yellow-300 sm:px-2'
                >
                  <div className='flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/20 transition group-hover:border-yellow-300'>
                    {userInfo.avatar ? (
                      <img src={userInfo.avatar} alt='Avatar' className='h-full w-full object-cover' />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className='hidden max-w-30 truncate font-bold sm:inline'>
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
                <button
                  onClick={handleOpenNotifications}
                  className='relative rounded-full p-2 transition hover:bg-white/10 hover:text-yellow-300'
                >
                  <Bell size={20} />
                  {notiCount > 0 && (
                    <span className='absolute -right-2.5 -top-1.5 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black'>
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
                className='relative flex items-center gap-2 rounded-full p-2 transition hover:bg-white/10 hover:text-yellow-300'
              >
                <ShoppingCart size={26} className='sm:size-7' />
                {cartCount > 0 && (
                  <span className='absolute -right-2 -top-1.5 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black'>
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
      </div>

      {isMobileSearchOpen && (
        <div
          className='fixed inset-0 z-70 bg-black/55 p-3 md:hidden'
          onClick={() => {
            setIsMobileSearchOpen(false)
            setSuggestions([])
          }}
        >
          <div
            ref={mobileSearchRef}
            className='mx-auto mt-14 w-full max-w-xl rounded-3xl bg-white p-3 shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center gap-2'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
                <input
                  autoFocus
                  value={keyword}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder='Tìm kiếm điện thoại, laptop...'
                  className='w-full rounded-full border border-gray-200 py-2 pl-10 pr-4 text-black outline-none focus:ring-2 focus:ring-yellow-400'
                />
              </div>
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false)
                  setSuggestions([])
                }}
                className='rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black'
                title='Đóng tìm kiếm'
              >
                <X size={20} />
              </button>
            </div>

            {renderSearchSuggestions('mobile')}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialView={authInitialView} />
    </header>
  )
}

export default Header
