import { ShoppingBag, ChevronRight } from 'lucide-react'
import { resolveImageUrl } from '../../api/config'

export interface CartPopoverItem {
  _id?: string
  id?: string | number
  variantId?: string
  name: string
  price: number
  oldPrice?: number
  quantity: number
  image?: string
  variant?: string
}

interface CartPopoverProps {
  open: boolean
  loading?: boolean
  items: CartPopoverItem[]
  totalItems: number
  onViewCart: () => void
}

export default function CartPopover({ open, loading = false, items, totalItems, onViewCart }: CartPopoverProps) {
  if (!open) return null

  const visibleItems = items.slice(0, 4)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className='absolute right-0 top-full z-50 mt-3 w-90 overflow-hidden rounded-3xl border border-white/20 bg-white text-gray-900 shadow-2xl shadow-black/20'>
      <div className='flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-red-50 to-white px-4 py-4'>
        <div>
          <p className='text-sm font-black uppercase tracking-[0.22em] text-red-500'>Giỏ hàng</p>
          <p className='text-xs text-gray-500'>{totalItems} sản phẩm đang chờ thanh toán</p>
        </div>
        <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600'>
          <ShoppingBag size={20} />
        </div>
      </div>

      <div className='max-h-90 overflow-auto px-3 py-3'>
        {loading ? (
          <div className='flex flex-col items-center justify-center gap-3 py-10 text-center text-gray-500'>
            <ShoppingBag size={26} className='animate-pulse text-red-500' />
            <p className='text-sm font-medium'>Đang tải giỏ hàng...</p>
          </div>
        ) : visibleItems.length > 0 ? (
          <div className='space-y-3'>
            {visibleItems.map((item) => (
              <div
                key={item._id || item.id}
                className='flex items-center gap-3 rounded-2xl border border-gray-100 px-3 py-3 transition hover:border-red-100 hover:bg-red-50/40'
              >
                <div className='h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100'>
                  <img
                    src={resolveImageUrl(item.image) || 'https://via.placeholder.com/80x80?text=Cart'}
                    alt={item.name}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-gray-900'>{item.name}</p>
                  <p className='mt-0.5 text-xs text-gray-500'>Số lượng: x{item.quantity}</p>
                  <div className='mt-1 flex items-baseline gap-2 flex-wrap'>
                    <p className='text-sm font-bold text-red-600'>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                    {item.oldPrice && item.oldPrice > item.price ? (
                      <p className='text-xs text-gray-400 line-through'>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.oldPrice)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {items.length > visibleItems.length && (
              <p className='px-2 pt-1 text-center text-xs font-medium text-gray-500'>
                Còn {items.length - visibleItems.length} sản phẩm khác trong giỏ.
              </p>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center gap-3 py-10 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400'>
              <ShoppingBag size={28} />
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-900'>Giỏ hàng đang trống</p>
              <p className='mt-1 text-xs text-gray-500'>Thêm sản phẩm để xem nhanh tại đây.</p>
            </div>
          </div>
        )}
      </div>

      <div className='border-t border-gray-100 bg-gray-50 p-4'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-gray-500'>Tạm tính</span>
          <span className='font-bold text-gray-900'>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
          </span>
        </div>
        <button
          onClick={onViewCart}
          className='mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700'
        >
          Xem giỏ hàng <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
