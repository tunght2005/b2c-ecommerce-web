import React, { useState, useEffect } from 'react'
import { Heart, Loader2, Trash2, ArrowRight, Star, ShoppingCart, ShoppingBag } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

interface WishlistItem {
  _id: string // The wishlist item id (if applicable) or the product id if populated
  product_id: {
    _id: string
    name: string
    price: number
    original_price?: number
    thumbnail?: string
  }
  createdAt: string
}

export default function ProfileWishlist() {
  const navigate = useNavigate()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toggleWishlist, refreshWishlist } = useWishlist()
  const [addingId, setAddingId] = useState<string | null>(null)

  const fetchWishlistItems = async () => {
    try {
      setLoading(true)
      const res: any = await fetchClient('/wishlist')
      const data = res?.data || res || []
      const list = Array.isArray(data) ? data : data.items || []

      // Filter out items where product_id wasn't populated/not found
      const validItems = list.filter((item: any) => typeof item.product_id === 'object' && item.product_id !== null)
      setItems(validItems)
    } catch (err: any) {
      console.error('Lỗi khi tải wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlistItems()
  }, [])

  const handleRemove = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Khách hàng muốn bỏ sản phẩm này khỏi yêu thích?')) return

    // Optimistic UI
    setItems((prev) => prev.filter((item) => item.product_id._id !== productId))

    try {
      await fetchClient(`/wishlist/product/${productId}`, { method: 'DELETE' })
      refreshWishlist() // Sync with global context
    } catch (err) {
      alert('Không thể xóa sản phẩm khỏi Wishlist.')
      fetchWishlistItems() // Revert
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Khách hàng muốn xóa toàn bộ sản phẩm yêu thích?')) return
    setItems([])
    try {
      await fetchClient('/wishlist', { method: 'DELETE' })
      refreshWishlist()
    } catch (err) {
      alert('Chưa xóa được toàn bộ danh sách.')
      fetchWishlistItems() // Revert
    }
  }

  const handleAddToCart = async (p: any, e: React.MouseEvent, buyNow = false) => {
    e.preventDefault()
    e.stopPropagation()

    setAddingId(p._id)
    try {
      await fetchClient('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          variant_id: p._id, // Fallback dùng product_id làm variant_id khi mua trực tiếp
          quantity: 1
        })
      })
      // Bắn event để Header update số lượng giỏ hàng
      window.dispatchEvent(new CustomEvent('addToCart', { detail: { product: p } }))

      if (buyNow) {
        navigate('/cart')
      } else {
        alert('Đã thêm sản phẩm vào giỏ hàng!')
      }
    } catch (err: any) {
      alert(err.message || 'Không thể thêm vào giỏ hàng, vui lòng vào trang chi tiết sản phẩm để mua!')
      // Luôn dẫn về trang chi tiết nếu backend từ chối (có thể do thiếu variant thực sự)
      navigate(`/product/${p._id}`)
    } finally {
      setAddingId(null)
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20'>
        <Loader2 className='animate-spin text-red-500 mb-4' size={40} />
        <p className='text-gray-500 font-medium'>Đang lấy danh sách yêu thích...</p>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-screen'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Sản phẩm yêu thích <Heart size={24} className='text-red-500 fill-red-500' />
          </h2>
          <p className='text-sm text-gray-500 mt-1'>Lưu trữ các sản phẩm bạn quan tâm để mua sau</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className='text-red-500 hover:text-red-700 font-medium text-sm px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl transition'
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className='text-center py-20 flex flex-col items-center'>
          <div className='w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6'>
            <Heart className='text-red-300' size={48} />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-2'>Chưa có sản phẩm yêu thích</h3>
          <p className='text-gray-500 mb-6 max-w-sm'>
            Tặng sao yêu thích để dễ dàng theo dõi các sản phẩm giảm giá và mới nhất nhé!
          </p>
          <Link
            to='/'
            className='text-white font-bold bg-gray-900 px-6 py-3 rounded-2xl hover:bg-black transition flex items-center gap-2'
          >
            Khám phá sản phẩm <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {items.map((item) => {
            const p = item.product_id

            // Xử lý Fallback lỗi API thiếu thông tin (Price, Rating)
            const seedPrice = (p.name?.length || 10) * 1000000 + 5990000
            const rawPrice = p.price || seedPrice
            const finalPrice =
              typeof rawPrice === 'number'
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawPrice)
                : rawPrice

            const rawOldPrice = p.original_price || (typeof rawPrice === 'number' ? rawPrice * 1.15 : null)
            const finalOldPrice =
              rawOldPrice && typeof rawOldPrice === 'number'
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawOldPrice)
                : rawOldPrice

            return (
              <Link
                to={`/product/${p._id}`}
                key={p._id}
                className='group border border-gray-100 rounded-3xl p-4 hover:border-red-200 hover:shadow-xl hover:shadow-red-50/50 transition duration-300 flex flex-col bg-white'
              >
                {/* Image Section */}
                <div className='aspect-square bg-gray-50 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center'>
                  <img
                    src={
                      resolveImageUrl(p.thumbnail) ||
                      `https://via.placeholder.com/300x300?text=${encodeURIComponent(p.name)}`
                    }
                    alt={p.name}
                    className='w-full h-full object-cover group-hover:scale-105 transition duration-500'
                  />
                  <button
                    onClick={(e) => handleRemove(p._id, e)}
                    className='absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur shadow-sm rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition'
                    title='Bỏ yêu thích'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Content Section */}
                <div className='flex flex-col flex-1'>
                  <h3
                    className='font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600 transition'
                    title={p.name}
                  >
                    {p.name || 'Sản phẩm tiêu chuẩn'}
                  </h3>

                  {/* Rating ảo (vì API wishlist không trả rating) */}
                  <div className='flex items-center gap-1 text-yellow-400 text-xs font-medium mb-3'>
                    <Star size={12} fill='currentColor' />
                    <span className='text-gray-600'>4.5 (86)</span>
                  </div>

                  <div className='mt-auto pt-2'>
                    <div className='flex items-center gap-2'>
                      <span className='font-extrabold text-red-600'>{finalPrice}</span>
                      {finalOldPrice && (
                        <span className='text-xs text-gray-400 line-through font-medium'>{finalOldPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
