import React, { useState, useEffect } from 'react'
import { Star, Loader2, Trash2, AlertCircle, ChevronDown, ExternalLink } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'
import { Link } from 'react-router-dom'

interface Review {
  _id: string
  product_id: {
    _id: string
    name: string
    images?: string[]
  }
  rating: number
  content: string
  images?: string[]
  admin_reply?: {
    content?: string
    role?: 'admin' | 'support'
    createdAt?: string
    user_id?: {
      username?: string
      role?: string
    }
  }
  createdAt: string
}

export default function ProfileReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [error, setError] = useState('')

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchReviews = async (p: number, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)
      setError('')

      const res: any = await fetchClient(`/reviews/my?page=${p}&limit=5`)
      const data = res?.data || res || {}
      const list = data.reviews || data.data || []
      const pagination = data.pagination || {}

      const total = pagination.total ?? data.total ?? list.length ?? 0
      const totalPages = pagination.totalPages ?? data.totalPages ?? Math.ceil(total / 5) ?? 1

      if (append) {
        setReviews((prev) => [...prev, ...list])
      } else {
        setReviews(Array.isArray(list) ? list : [])
        setMeta({ total, totalPages })
      }
    } catch (err: any) {
      console.error('Lỗi khi tải lịch sử đánh giá:', err)
      setError('Không thể tải lịch sử đánh giá. Vui lòng thử lại sau.')
    } finally {
      if (!append) setLoading(false)
      else setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchReviews(1)
  }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage, true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return

    setDeletingId(id)
    try {
      await fetchClient(`/reviews/${id}`, { method: 'DELETE' })
      setReviews((prev) => prev.filter((r) => r._id !== id))
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }))
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa đánh giá. Vui lòng thử lại.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20'>
        <Loader2 className='animate-spin text-red-500 mb-4' size={40} />
        <p className='text-gray-500 font-medium'>Đang tải lịch sử đánh giá...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center text-center'>
        <AlertCircle size={40} className='mb-3' />
        <h3 className='text-lg font-bold'>Đã xảy ra sự cố</h3>
        <p className='text-sm mt-1'>{error}</p>
        <button
          onClick={() => fetchReviews(1)}
          className='mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition'
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-screen'>
      <div className='flex items-center justify-between mb-8 pb-6 border-b border-gray-100'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Đánh giá của tôi</h2>
          <p className='text-sm text-gray-500 mt-1'>Quản lý các đánh giá bạn đã viết cho sản phẩm</p>
        </div>
        <div className='bg-red-50 px-4 py-2 rounded-xl text-red-600 font-semibold flex items-center gap-2'>
          <Star size={18} fill='currentColor' />
          <span>{meta.total} đánh giá</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className='text-center py-20 flex flex-col items-center'>
          <div className='w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6'>
            <Star className='text-gray-300' size={48} />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-2'>Chưa có đánh giá nào</h3>
          <p className='text-gray-500 mb-6 max-w-sm'>
            Bạn chưa viết bất kỳ đánh giá nào. Cùng viết đánh giá để chia sẻ trải nghiệm với người khác nhé!
          </p>
          <Link
            to='/profile/orders'
            className='text-red-600 font-bold bg-red-50 px-6 py-3 rounded-2xl hover:bg-red-100 transition'
          >
            Đến đơn hàng của tôi
          </Link>
        </div>
      ) : (
        <div className='space-y-6'>
          {reviews.map((review) => {
            const product = review.product_id
            const productImg = product?.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'

            return (
              <div
                key={review._id}
                className='border border-gray-100 rounded-3xl p-5 hover:border-red-100 hover:shadow-lg hover:shadow-red-50/50 transition duration-300'
              >
                {/* Product Info Minimal */}
                <div className='flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl mb-4'>
                  <img src={resolveImageUrl(productImg)} alt='' className='w-12 h-12 rounded-xl object-cover' />
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold text-gray-900 line-clamp-1'>
                      {product?.name || 'Sản phẩm tiêu chuẩn'}
                    </h4>
                    <Link
                      to={`/products/${product?._id || ''}`}
                      className='text-xs text-red-500 hover:text-red-600 font-medium inline-flex items-center gap-1 mt-0.5'
                    >
                      Xem sản phẩm <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>

                {/* Review Content */}
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='flex gap-0.5'>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            className={s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}
                            fill={s <= review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className='text-xs text-gray-400 font-medium whitespace-nowrap'>
                        {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className='text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap'>
                      {review.content}
                    </p>

                    {review.admin_reply?.content ? (
                      <div className='mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4'>
                        <p className='text-xs font-bold uppercase tracking-wide text-blue-700'>
                          Phản hồi từ {review.admin_reply.role === 'support' ? 'Support' : 'Admin'}
                        </p>
                        <p className='mt-1 whitespace-pre-wrap text-sm text-blue-900'>{review.admin_reply.content}</p>
                        {review.admin_reply.createdAt ? (
                          <p className='mt-2 text-xs text-blue-700'>
                            {new Date(review.admin_reply.createdAt).toLocaleDateString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className='flex flex-wrap gap-2 mt-4'>
                        {review.images.map((img, i) => (
                          <div
                            key={i}
                            className='w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 hover:scale-105 transition cursor-pointer'
                          >
                            <img src={resolveImageUrl(img)} alt='' className='w-full h-full object-cover' />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className='pl-4 flex flex-col items-end gap-2 shrink-0'>
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deletingId === review._id}
                      className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition'
                      title='Xóa đánh giá'
                    >
                      {deletingId === review._id ? (
                        <Loader2 size={18} className='animate-spin' />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {page < meta.totalPages && (
            <div className='flex justify-center pt-4'>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className='flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition'
              >
                {loadingMore ? <Loader2 size={18} className='animate-spin' /> : <ChevronDown size={18} />}
                Xem thêm đánh giá
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
