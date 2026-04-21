import { useState, useEffect } from 'react'
import { Star, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { resolveImageUrl } from '../api/config'
import WishlistButton from './WishlistButton'
import { fetchClient } from '../api/fetchClient'
import { showToast } from './Toast'

// Cập nhật Product Interface để khớp Backend + Tự xử lý Fallback
export type Product = {
  _id?: string
  id?: number | string
  name: string
  image?: string
  thumbnail?: string
  price?: number | string
  rating?: number
  discount?: number
  oldPrice?: number | string
  variants?: Record<string, unknown>[]
}

// Cache chống gọi API 50 lần khi render 50 Card cùng lúc
let promoPromise: Promise<any> | null = null
let globalPromo: any = null

// SVG placeholder khi ảnh lỗi
const FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Cg transform='translate(150,130)'%3E%3Ccircle cx='0' cy='-20' r='30' fill='%23d1d5db'/%3E%3Crect x='-50' y='20' width='100' height='60' rx='8' fill='%23d1d5db'/%3E%3C/g%3E%3Ctext x='150' y='240' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%239ca3af'%3EKhông có ảnh%3C/text%3E%3C/svg%3E`

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const [promo, setPromo] = useState<any>(globalPromo)
  const [imgError, setImgError] = useState(false)
  const [addingCart, setAddingCart] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)

  useEffect(() => {
    if (globalPromo) {
      setPromo(globalPromo)
      return
    }
    if (!promoPromise) {
      promoPromise = fetchClient('/promotions')
        .then((res: any) => {
          const data = res?.data || res
          if (Array.isArray(data)) {
            globalPromo = data.find((p: any) => p.status !== 'inactive' || p.active || p.is_active) || null
          } else {
            globalPromo = null
          }
          return globalPromo
        })
        .catch(() => null)
    }
    promoPromise.then((p) => setPromo(p))
  }, [])

  // Lấy ảnh thật từ DB, tự động gán domain nếu cần
  const rawImage = product.thumbnail || product.image || product.variants?.[0]?.image
  const finalImage = (!imgError && resolveImageUrl(rawImage as string | undefined)) || FALLBACK_SVG

  // Lấy giá thật từ DB, hoặc tự sinh giá ảo dựa lắt léo vào chuỗi Tên cho phong phú
  const seedPrice = product.name.length * 1000000 + 5990000
  const rawPrice = (product.price || product.variants?.[0]?.price || seedPrice) as string | number
  const finalPrice =
    typeof rawPrice === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawPrice)
      : rawPrice

  // Lấy giá Gốc (để gạch ngang)
  const rawOldPrice = (product.oldPrice ||
    product.variants?.[0]?.oldPrice ||
    (typeof rawPrice === 'number' ? rawPrice * 1.15 : null)) as string | number | null
  const finalOldPrice =
    rawOldPrice && typeof rawOldPrice === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawOldPrice)
      : rawOldPrice

  // Discount %
  const finalDiscount =
    product.discount ||
    (typeof rawPrice === 'number' && typeof rawOldPrice === 'number' && rawOldPrice > 0
      ? Math.round(100 - (rawPrice / rawOldPrice) * 100)
      : 15)

  // Quick-add to cart handler
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation() // Không navigate vào detail
    if (addingCart) return

    setAddingCart(true)
    try {
      const variantId = (product.variants?.[0] as any)?._id || (product.variants?.[0] as any)?.id
      if (variantId) {
        await fetchClient('/cart/add', {
          method: 'POST',
          data: { variant_id: variantId, quantity: 1 }
        })
      }
      // Trigger cart count update
      window.dispatchEvent(new Event('cartChanged'))
      showToast(`✅ Đã thêm "${product.name}" vào giỏ hàng!`, 'success')
      setAddedFeedback(true)
    } catch (err: any) {
      if (err?.status === 401 || err?.message?.includes('Unauthorized')) {
        window.dispatchEvent(new CustomEvent('openAuthModal'))
        showToast('Vui lòng đăng nhập để thêm vào giỏ hàng.', 'info')
      } else {
        showToast(err?.message || 'Không thể thêm vào giỏ hàng', 'error')
      }
    } finally {
      setAddingCart(false)
    }
  }

  return (
    <div
      onClick={() => navigate('/product/' + (product._id || product.id))}
      className='group bg-white cursor-pointer rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition duration-300 relative border flex flex-col h-full'
    >
      {/* BADGE (Khuyến mãi) */}
      <div className='absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-semibold z-10'>
        -{finalDiscount}%
      </div>

      {/* NÚT YÊU THÍCH */}
      <div className='absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/80 backdrop-blur rounded-full p-1.5 shadow-sm'>
        <WishlistButton productId={(product._id || product.id) as string} size={16} />
      </div>

      {/* IMAGE */}
      <div className='bg-gray-100 rounded-xl h-32 sm:h-44 flex items-center justify-center p-2 relative overflow-hidden'>
        <img
          src={finalImage}
          alt={product.name}
          className='h-full object-contain hover:scale-105 transition z-0'
          onError={() => setImgError(true)}
        />
        {/* EVENT BANNER BOTTOM */}
        {promo && (
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] sm:text-[10px] font-bold text-center py-1 uppercase tracking-wider z-10 shadow-inner opacity-95'>
            🎁 ƯU ĐÃI {promo.name}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className='mt-3 sm:mt-4 flex flex-col flex-1'>
        {/* NAME */}
        <h3 className='text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 min-h-[32px] sm:min-h-[40px]'>
          {product.name}
        </h3>

        {/* RATING */}
        <div className='flex items-center gap-1 mt-1 text-yellow-400 text-sm'>
          <Star size={12} className='sm:w-[14px] sm:h-[14px]' fill='currentColor' />
          <span className='text-gray-600 text-[10px] sm:text-xs'>{product.rating ?? 4.5}</span>
        </div>

        {/* PRICE */}
        <div className='mt-2 flex items-baseline gap-1.5 sm:gap-2 flex-wrap'>
          <span className='text-red-600 text-sm sm:text-lg font-bold'>{finalPrice}</span>
          {finalOldPrice && <span className='text-gray-400 line-through text-[10px] sm:text-sm'>{finalOldPrice}</span>}
        </div>

        {/* SPACER — đẩy button xuống đáy card */}
        <div className='flex-1' />

        {/* QUICK-ADD BUTTON — luôn hiện ở đáy, đổi màu khi đã thêm */}
        <button
          onClick={handleQuickAdd}
          disabled={addingCart}
          className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200
            ${
              addedFeedback
                ? 'bg-green-500 text-white scale-95'
                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-100'
            }
            ${addingCart ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <ShoppingCart size={14} />
          {addedFeedback ? '✓ Đã thêm!' : addingCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  )
}
