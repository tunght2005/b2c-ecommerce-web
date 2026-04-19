import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  ChevronRight,
  BadgeCheck,
  Gift,
  CreditCard,
  Loader2,
  Tag,
  MessageSquare,
  ChevronDown,
  UserCircle2,
  ThumbsUp
} from 'lucide-react'

import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'
import WishlistButton from '../components/WishlistButton'
import { showToast } from '../components/Toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [bestPromo, setBestPromo] = useState<any>(null)

  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  // --- REVIEWS STATE ---
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsMeta, setReviewsMeta] = useState({ total: 0, totalPages: 1, avgRating: 0 })
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      try {
        setLoading(true)
        // Gọi song song 4 API
        const [prodRes, varRes, imgRes, promoRes] = await Promise.all([
          fetchClient(`/products/${id}`).catch(() => null),
          fetchClient(`/variants/product/${id}`).catch(() => []),
          fetchClient(`/product-images/product/${id}`).catch(() => []),
          fetchClient(`/promotions`).catch(() => null)
        ])

        const pData = (prodRes as any)?.data || prodRes // Tùy cấu trúc API
        setProduct(pData)

        const promoData = (promoRes as any)?.data || promoRes
        if (Array.isArray(promoData) && promoData.length > 0) {
          // Lấy mã Voucher hoặc FlashSale khả dụng nhất
          const activePromo = promoData.find((p: any) => p.status !== 'inactive' || p.active || p.is_active)
          if (activePromo) setBestPromo(activePromo)
        } else if (promoData && promoData._id && promoData.status !== 'inactive') {
          setBestPromo(promoData)
        }

        const vData = (varRes as any)?.data || varRes || []
        setVariants(vData)
        if (vData.length > 0) {
          setSelectedVariantId(vData[0]._id || vData[0].id)
        }

        const iData = (imgRes as any)?.data || imgRes || []
        setImages(iData)

        // Cài đặt ảnh mặc định
        if (iData.length > 0) {
          const mainImg = iData.find((img: any) => img.is_primary) || iData[0]
          setSelectedImage(resolveImageUrl(mainImg.url) || '')
        } else if (pData?.thumbnail || pData?.image) {
          setSelectedImage(resolveImageUrl(pData.thumbnail || pData.image) || '')
        } else {
          setSelectedImage('https://via.placeholder.com/600x600?text=No+Image')
        }
      } catch (error) {
        console.error('Failed to load product details', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  // --- FETCH REVIEWS ---
  const fetchReviews = async (page: number, append = false) => {
    if (!id) return
    try {
      if (append) {
        setReviewsLoadingMore(true)
      } else {
        setReviewsLoading(true)
      }
      const res: any = await fetchClient(`/reviews/product/${id}?page=${page}&limit=5`).catch(() => null)

      // Cấu trúc API: { success, data: { reviews[], pagination: {total, totalPages}, summary: {averageRating} } }
      const data = res?.data || res || {}
      const list = data.reviews || []
      const pagination = data.pagination || {}
      const summary = data.summary || {}

      const total = pagination.total ?? data.total ?? list.length ?? 0
      const totalPages = pagination.totalPages ?? data.totalPages ?? Math.ceil(total / 5) ?? 1
      const avg = summary.averageRating ?? data.averageRating ?? data.avgRating ?? 0

      console.log('[Reviews] API response:', res)
      console.log('[Reviews] Parsed:', { list, total, totalPages, avg })

      if (append) {
        setReviews((prev) => [...prev, ...list])
      } else {
        setReviews(Array.isArray(list) ? list : [])
        setReviewsMeta({ total, totalPages, avgRating: avg })
      }
    } finally {
      if (append) {
        setReviewsLoadingMore(false)
      } else {
        setReviewsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (id) fetchReviews(1)
  }, [id])

  const handleLoadMoreReviews = () => {
    const nextPage = reviewsPage + 1
    setReviewsPage(nextPage)
    fetchReviews(nextPage, true)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
        <Loader2 className='animate-spin text-red-500 mb-4' size={50} />
        <p className='text-gray-500 font-medium'>Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50'>
        <p className='text-red-500 font-medium'>Không tìm thấy sản phẩm!</p>
        <button onClick={() => navigate('/')} className='mt-4 px-4 py-2 bg-red-500 text-white rounded-xl'>
          Quay lại trang chủ
        </button>
      </div>
    )
  }

  // Thông số tính toán Giá Thực Hiện Tại từ Variant
  const selectedVariant = variants.find((v) => v._id === selectedVariantId || v.id === selectedVariantId)

  const seedPrice = (product.name?.length || 10) * 1000000 + 5990000
  const rawPrice = selectedVariant?.price || product.price || seedPrice
  const finalPrice =
    typeof rawPrice === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawPrice)
      : rawPrice

  const rawOldPrice =
    selectedVariant?.old_price ||
    selectedVariant?.oldPrice ||
    product.oldPrice ||
    (typeof rawPrice === 'number' ? rawPrice * 1.15 : null)
  const finalOldPrice =
    rawOldPrice && typeof rawOldPrice === 'number'
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawOldPrice)
      : rawOldPrice

  const finalDiscount =
    product.discount ||
    (typeof rawPrice === 'number' && typeof rawOldPrice === 'number' && rawOldPrice > 0
      ? Math.round(100 - (rawPrice / rawOldPrice) * 100)
      : 15)

  const finalImages =
    images.length > 0
      ? images.map((img) => resolveImageUrl(img.url))
      : [resolveImageUrl(product.thumbnail || product.image) || 'https://via.placeholder.com/600x600?text=No+Image']

  // --- HÀM THÊM VÀO GIỎ HÀNG THẬT ---
  const doAddToCart = async (): Promise<boolean> => {
    try {
      const variantTarget = selectedVariantId || product._id || product.id
      await fetchClient('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          variant_id: variantTarget,
          quantity: quantity
        })
      })
      // Bắn event báo cho Header để giật lùi chuông/chấm đỏ
      window.dispatchEvent(new CustomEvent('addToCart', { detail: { product } }))
      return true
    } catch (err: any) {
      // Bắt lỗi 401 từ status hoặc message
      if (
        err.status === 401 ||
        err.message?.toLowerCase().includes('token') ||
        err.message?.toLowerCase().includes('từ chối')
      ) {
        // Token missing -> gọi explicit fallback
        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { view: 'login' } }))
        return false
      }
      showToast('Không thể thêm vào giỏ: ' + (err.message || 'Lỗi server'), 'error')
      return false
    }
  }

  // Xử lý Click Nút "Thêm vào giỏ"
  const handleAddToCart = async () => {
    const success = await doAddToCart()
    if (success) {
      showToast(`✅ Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success')
      // Update cart popup context if necessary
      window.dispatchEvent(new Event('cartChange'))
    }
  }

  // Xử lý Click Nút "Mua ngay"
  const handleBuyNow = async () => {
    const success = await doAddToCart()
    if (success) {
      // Thành công => Nhảy thẳng sang trang Giỏ Hàng (thanh toán)
      navigate('/cart')
    }
  }

  const handleVoteHelpful = async (reviewId: string) => {
    if (!reviewId) return
    try {
      await fetchClient(`/feedback/${reviewId}/rate`, { method: 'POST' })
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1, has_voted: true } : r))
      )
    } catch (err: any) {
      if (err?.status === 401) {
        showToast('Vui lòng đăng nhập để đánh giá hữu ích!', 'info')
        window.dispatchEvent(new CustomEvent('openAuthModal'))
      } else {
        showToast('Lỗi: ' + (err.message || 'Hệ thống chặn tự đánh giá hoặc Backend báo lỗi!'), 'error')
      }
    }
  }

  return (
    <div className='bg-gray-50 min-h-screen pb-6 sm:pb-10'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6'>
        {/* Breadcrumb */}
        <div className='flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5'>
          <span className='cursor-pointer hover:text-red-500 whitespace-nowrap' onClick={() => navigate('/')}>
            Trang chủ
          </span>
          <ChevronRight size={14} className='sm:w-4 sm:h-4 flex-shrink-0' />
          <span className='whitespace-nowrap'>{product.category_id?.name || product.category || 'Điện thoại'}</span>
          <ChevronRight size={14} className='sm:w-4 sm:h-4 flex-shrink-0' />
          <span className='text-gray-800 font-medium line-clamp-1'>{product.name}</span>
        </div>

        {/* Top Info */}
        <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>{product.name}</h1>

              <div className='flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm'>
                <div className='flex items-center gap-1 text-yellow-500'>
                  <Star size={14} className='sm:w-4 sm:h-4' fill='currentColor' />
                  <span className='font-semibold'>{product.rating || 4.8}</span>
                  <span className='text-gray-500'>(đánh giá thực tế)</span>
                </div>
                <div className='hidden sm:block w-1 h-1 bg-gray-300 rounded-full'></div>
                <div className='text-gray-500'>Đã bán {product.sold || 120}+</div>
                <div className='hidden sm:block w-1 h-1 bg-gray-300 rounded-full'></div>
                <div className='flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md'>
                  <BadgeCheck size={14} className='sm:w-4 sm:h-4' />
                  Chính hãng VN/A
                </div>
              </div>
            </div>

            <div className='flex gap-2 sm:gap-3'>
              <WishlistButton
                productId={id as string}
                showText={true}
                className='flex-1 lg:flex-none border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl'
              />
              <button className='flex-1 lg:flex-none border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 hover:border-red-500 hover:text-red-500 transition text-sm sm:text-base'>
                <Share2 size={16} className='sm:w-[18px] sm:h-[18px]' />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>

        <div className='grid lg:grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 mt-4 sm:mt-6'>
          {/* CỘT TRÁI (Ảnh, Thông số, Mô tả) */}
          <div className='space-y-4 sm:space-y-6'>
            {/* Box Ảnh */}
            <div className='bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-gray-100 relative'>
              {/* Event Promo Badge Over Image */}
              {bestPromo && (
                <div className='absolute top-3 left-3 sm:top-5 sm:left-5 z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce'>
                  <Tag size={16} className='sm:w-5 sm:h-5' />
                  <span className='text-xs sm:text-sm font-bold tracking-wider uppercase'>
                    Mã hời: {bestPromo.name}
                  </span>
                </div>
              )}

              <img
                src={selectedImage}
                alt={product.name}
                className='w-full h-[250px] sm:h-[350px] lg:h-[420px] object-contain rounded-xl sm:rounded-2xl bg-gray-50 transition-all duration-300'
              />

              <div className='grid grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4'>
                {finalImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img as string)}
                    className={`border rounded-xl sm:rounded-2xl overflow-hidden p-1 sm:p-2 transition ${
                      selectedImage === img ? 'border-red-500 ring-1 sm:ring-2 ring-red-200' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img as string}
                      className='w-full h-12 sm:h-16 lg:h-20 object-cover rounded-lg sm:rounded-xl'
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Box Mô tả */}
            <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
              <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>Mô tả & Cấu hình</h3>
              <div
                className='text-sm sm:text-base text-gray-700 leading-relaxed sm:leading-8 html-content'
                dangerouslySetInnerHTML={{
                  __html: product.description || product.content || '<p>Sản phẩm cực chất lượng từ SevenStore.</p>'
                }}
              />
            </div>

            {/* ==== SECTION ĐÁNH GIÁ KHÁCH HÀNG ==== */}
            <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-5'>
                <div className='flex items-center gap-2'>
                  <MessageSquare className='text-red-500' size={20} />
                  <h3 className='text-lg sm:text-xl font-bold'>Đánh giá khách hàng</h3>
                </div>
                {reviewsMeta.total > 0 && <span className='text-sm text-gray-400'>{reviewsMeta.total} đánh giá</span>}
              </div>

              {/* Tổng quan sao */}
              {reviewsMeta.total > 0 && (
                <div className='flex items-center gap-5 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 mb-5'>
                  <div className='text-center flex-shrink-0'>
                    <div className='text-4xl font-black text-yellow-500'>
                      {reviewsMeta.avgRating > 0 ? reviewsMeta.avgRating.toFixed(1) : '—'}
                    </div>
                    <div className='flex gap-0.5 mt-1 justify-center'>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= Math.round(reviewsMeta.avgRating) ? 'text-yellow-400' : 'text-gray-200'}
                          fill={s <= Math.round(reviewsMeta.avgRating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>{reviewsMeta.total} đánh giá</div>
                  </div>
                  <div className='flex-1 space-y-1.5'>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length
                      const pct = reviewsMeta.total > 0 ? (count / reviewsMeta.total) * 100 : 0
                      return (
                        <div key={star} className='flex items-center gap-2 text-xs'>
                          <span className='w-3 text-gray-600 font-semibold'>{star}</span>
                          <Star size={11} className='text-yellow-400' fill='currentColor' />
                          <div className='flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-yellow-400 rounded-full transition-all'
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className='w-5 text-gray-400 text-right'>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Danh sách reviews */}
              {reviewsLoading ? (
                <div className='flex flex-col items-center py-10 gap-3'>
                  <Loader2 className='animate-spin text-red-400' size={32} />
                  <p className='text-sm text-gray-400'>Đang tải đánh giá...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className='text-center py-10'>
                  <Star className='mx-auto text-gray-200 mb-3' size={40} />
                  <p className='text-gray-400 text-sm'>Chưa có đánh giá nào cho sản phẩm này.</p>
                  <p className='text-gray-300 text-xs mt-1'>Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {reviews.map((review, idx) => {
                    let avatarUrl = review.user?.avatar || review.user_id?.avatar || review.avatar;
                    // Nếu là review của local user hiện tại nhưng backend chưa trả avatar mới nhất
                    try {
                      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
                      if (userInfo && userInfo.avatar) {
                        const reviewAuthorId = review.user?._id || review.user_id?._id || review.user_id || review.user;
                        if (reviewAuthorId === userInfo._id || reviewAuthorId === userInfo.id) {
                          avatarUrl = userInfo.avatar;
                        }
                      }
                    } catch (e) {
                      // skip
                    }

                    return (
                    <div
                      key={review._id || idx}
                      className='border border-gray-100 rounded-2xl p-4 hover:bg-gray-50/50 transition'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              className='w-9 h-9 rounded-full object-cover shadow-sm'
                              alt=''
                            />
                          ) : (
                            <div className='w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center'>
                              <UserCircle2 size={20} className='text-white' />
                            </div>
                          )}
                          <div>
                            <p className='text-sm font-bold text-gray-800'>
                              {review.user?.username ||
                                review.user?.name ||
                                review.user?.full_name ||
                                review.user_id?.username ||
                                review.user_id?.name ||
                                review.user_name ||
                                review.author ||
                                (typeof review.user === 'string' || typeof review.user_id === 'string'
                                  ? '(ID Khách hàng)'
                                  : 'Người dùng ẩn danh')}
                            </p>
                            <p className='text-xs text-gray-400'>
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className='flex gap-0.5 flex-shrink-0'>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}
                              fill={s <= review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className='text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap'>{review.content}</p>

                      {/* Ảnh đính kèm */}
                      {review.images && review.images.length > 0 && (
                        <div className='flex gap-2 mt-3 flex-wrap'>
                          {review.images.map((img: string, i: number) => (
                            <img
                              key={i}
                              src={img}
                              className='w-16 h-16 object-cover rounded-xl border border-gray-100'
                              alt=''
                            />
                          ))}
                        </div>
                      )}

                      {/* Vote Hữu ích */}
                      <div className='mt-4 flex items-center gap-4'>
                        <button
                          onClick={() => !review.has_voted && handleVoteHelpful(review._id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition ${review.has_voted ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                          <ThumbsUp size={14} className={review.has_voted ? 'fill-current' : ''} />
                          Hữu ích {review.helpful_count > 0 ? `(${review.helpful_count})` : ''}
                        </button>
                      </div>

                      {/* Admin Reply */}
                      {(review.reply || review.admin_reply) && (
                        <div className='mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 relative ml-4'>
                          <div className='absolute -top-2 left-6 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 rotate-45'></div>
                          <p className='text-xs font-bold text-gray-800 mb-1 flex items-center gap-2'>
                            <BadgeCheck size={14} className='text-blue-500' />
                            Phản hồi từ Admin Support
                          </p>
                          <p className='text-sm text-gray-600 leading-relaxed'>
                            {typeof (review.reply || review.admin_reply) === 'string'
                              ? review.reply || review.admin_reply
                              : review.reply?.content ||
                                review.admin_reply?.content ||
                                'Cảm ơn bạn đã đánh giá sản phẩm!'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                  
                  {/* Load thêm */}
                  {reviewsPage < reviewsMeta.totalPages && (
                    <button
                      onClick={handleLoadMoreReviews}
                      disabled={reviewsLoadingMore}
                      className='w-full py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2'
                    >
                      {reviewsLoadingMore ? (
                        <>
                          <Loader2 size={16} className='animate-spin' /> Đang tải...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} /> Xem thêm đánh giá
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* ==== END REVIEWS ==== */}
          </div>

          {/* CỘT PHẢI (Mua hàng, Chính sách) */}
          <div className='space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-[100px]'>
              {/* Box Giá tiền */}
              <div className='flex flex-wrap items-end gap-2 sm:gap-3'>
                <span className='text-2xl sm:text-4xl font-bold text-red-600'>{finalPrice}</span>
                {finalOldPrice && (
                  <span className='text-sm sm:text-lg text-gray-400 line-through pb-1'>{finalOldPrice}</span>
                )}
                <span className='bg-red-100 text-red-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-full text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5'>
                  -{finalDiscount}%
                </span>
              </div>

              {/* Best Promo Gợi ý */}
              {bestPromo && (
                <div className='mt-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm'>
                  <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600'>
                    <Tag size={18} className='fill-current opacity-20' />
                    <Tag size={18} className='absolute' />
                  </div>
                  <div>
                    <p className='text-sm font-bold text-red-700 line-clamp-1'>Mã hời: {bestPromo.name}</p>
                    <p className='text-xs text-red-600/80 mt-0.5'>
                      Code: <strong className='bg-red-100 px-1.5 py-0.5 rounded'>{bestPromo.code || 'Auto'}</strong>{' '}
                      <span>(Thu thập trong Giỏ hàng)</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Box Chọn Phiên Bản (Nếu có variants) */}
              {variants.length > 0 && (
                <div className='mt-5 sm:mt-6'>
                  <h4 className='font-semibold mb-2 sm:mb-3 text-sm sm:text-base'>Chọn phiên bản</h4>
                  <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                    {variants.map((v) => {
                      const vId = v._id || v.id
                      // Display text from attributes or sku
                      const displayAttr =
                        v.attributes && v.attributes.length > 0
                          ? v.attributes.map((a: any) => a.name).join(' - ')
                          : v.sku
                      return (
                        <button
                          key={vId}
                          onClick={() => setSelectedVariantId(vId)}
                          className={`border rounded-xl sm:rounded-2xl p-2 sm:p-3 text-xs sm:text-sm font-medium transition flex flex-col items-center justify-center ${
                            selectedVariantId === vId
                              ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className='font-bold'>{displayAttr}</span>
                          <span className={`${selectedVariantId === vId ? 'text-red-500' : 'text-gray-500'}`}>
                            {typeof v.price === 'number'
                              ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)
                              : v.price}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Box Số lượng */}
              <div className='mt-5 sm:mt-6 flex flex-col'>
                <h4 className='font-semibold mb-2 sm:mb-3 text-sm sm:text-base'>Số lượng</h4>
                <div className='flex items-center border border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden self-start'>
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className='w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 transition'
                  >
                    <Minus size={16} className='sm:w-[18px] sm:h-[18px]' />
                  </button>
                  <span className='w-10 sm:w-12 text-center font-semibold text-sm sm:text-base'>{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className='w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 transition'
                  >
                    <Plus size={16} className='sm:w-[18px] sm:h-[18px]' />
                  </button>
                </div>
              </div>

              {/* Nút bấm mua hàng */}
              <div className='space-y-2 sm:space-y-3 mt-6 sm:mt-8'>
                <button
                  onClick={handleBuyNow}
                  className='w-full border-2 border-red-500 bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition shadow-lg shadow-red-200'
                >
                  MUA NGAY
                  <span className='block text-[10px] sm:text-xs font-normal mt-0.5'>
                    Giao hàng tận nơi (hoặc kèm Voucher)
                  </span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className='w-full bg-white hover:bg-red-50 text-red-600 border-2 border-red-500 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition'
                >
                  <ShoppingCart size={20} className='sm:w-[22px] sm:h-[22px]' />
                  Thêm vào giỏ hàng
                </button>
              </div>

              {/* Box Chính sách */}
              <div className='mt-6 sm:mt-8 space-y-3 sm:space-y-4 border-t pt-5 sm:pt-6'>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <Truck className='text-red-500 flex-shrink-0' size={18} />
                  Giao hàng nhanh toàn quốc
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <ShieldCheck className='text-green-500 flex-shrink-0' size={18} />
                  Bảo hành chính hãng 12 tháng
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <RotateCcw className='text-blue-500 flex-shrink-0' size={18} />
                  Đổi trả miễn phí trong 30 ngày
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <Gift className='text-pink-500 flex-shrink-0' size={18} />
                  Tặng kèm ưu đãi hấp dẫn
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <CreditCard className='text-purple-500 flex-shrink-0' size={18} />
                  Hỗ trợ trả góp 0%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
