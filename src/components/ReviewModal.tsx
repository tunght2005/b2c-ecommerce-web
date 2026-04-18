import { useState, useRef } from 'react'
import { X, Star, Upload, ImageIcon, Video, CheckCircle2, Loader2, Trash2, ChevronDown } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'

interface OrderItem {
  variant_id: string | {
    _id: string
    name?: string
    sku?: string
    product_id?: string | { _id: string; name?: string }
  }
  name?: string
  image?: string
  price?: number
  quantity: number
  product_id?: string | { _id: string; name?: string }
}

interface Order {
  _id: string
  status: string
  createdAt: string
  final_price: number
  items: OrderItem[]
}

interface ReviewModalProps {
  order: Order
  onClose: () => void
}

const RATING_LABELS = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc']
const RATING_COLORS = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500']
const TAG_SUGGESTIONS = [
  'Giao hàng nhanh', 'Đóng gói cẩn thận', 'Sản phẩm chính hãng',
  'Giống mô tả', 'Chất lượng tốt', 'Giá hợp lý', 'Sẽ mua lại',
]

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

export default function ReviewModal({ order, onClose }: ReviewModalProps) {
  // Chọn sản phẩm để đánh giá (với đơn nhiều sản phẩm)
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false)

  // Review fields
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentItem = order.items[selectedItemIndex]
  const activeRating = hoverRating || rating

  // --- HELPERS ---

  // Tạo tên hiển thị từ SKU: "SAMSUNG-GALAXY-S24-ULTRA-128G-FXT4" → "Samsung Galaxy S24 Ultra"
  const skuToDisplayName = (sku: string): string => {
    // Bỏ 2 segment cuối cùng (thường là mã ngẫu nhiên và mã màu/dung lượng)
    const parts = sku.split('-')
    // Giữ những phần không phải mã thuần (không phải ALL_CAPS ngắn)
    const meaningful = parts.filter((p, i) => i < parts.length - 1 && !/^[A-Z]{3,5}\d*$/.test(p) || parts.length <= 3)
    const keyword = (meaningful.length > 2 ? meaningful : parts.slice(0, 4)).join(' ')
    // Capitalize each word
    return keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  }

  const getItemName = (item: OrderItem) => {
    if (item.name) return item.name
    if (typeof item.variant_id === 'object') {
      if (item.variant_id?.name) return item.variant_id.name
      if (item.variant_id?.sku) return skuToDisplayName(item.variant_id.sku)
    }
    return 'Sản phẩm tiêu chuẩn'
  }

  // Tích xuất từ khóa search từ SKU (simple, reliable)
  // "SAMSUNG-GALAXY-S24-ULTRA-128G-FXT4" → "SAMSUNG GALAXY S24 ULTRA"
  const skuToSearchKeyword = (sku: string): string => {
    // Chỉ lấy 4 segment đầu, bỏ phần sau
    return sku.split('-').slice(0, 4).join(' ')
  }

  // Lấy product_id thực sự từ item (sync - chỉ dùng để hiển thị debug)
  const getProductId = (item: OrderItem): string => {
    if (typeof item.product_id === 'string') return item.product_id
    if (typeof item.product_id === 'object' && item.product_id?._id) return item.product_id._id
    if (typeof item.variant_id === 'object') {
      const vProductId = item.variant_id?.product_id
      if (typeof vProductId === 'string') return vProductId
      if (typeof vProductId === 'object' && vProductId?._id) return vProductId._id
      return item.variant_id?._id || ''
    }
    if (typeof item.variant_id === 'string') return item.variant_id
    return ''
  }

  // DEBUG: log order items khi modal mở
  console.log('[ReviewModal] Order items:', JSON.stringify(order.items, null, 2))
  console.log('[ReviewModal] Current productId (sync):', getProductId(currentItem))

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // --- UPLOAD MEDIA ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - mediaFiles.length
    const toAdd = files.slice(0, remaining)

    toAdd.forEach(file => {
      const isVideo = file.type.startsWith('video/')
      const reader = new FileReader()
      reader.onload = (ev) => {
        setMediaFiles(prev => [...prev, {
          file,
          preview: ev.target?.result as string,
          type: isVideo ? 'video' : 'image'
        }])
      }
      reader.readAsDataURL(file)
    })

    // Reset input để có thể chọn lại file cũ
    e.target.value = ''
  }

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  // --- SUBMIT ---
  const handleSubmit = async () => {
    console.log('[ReviewModal] handleSubmit called | rating:', rating, '| content.length:', content.trim().length)

    if (rating === 0) {
      setErrorMsg('★ Vui lòng chọn ít nhất 1 sao đánh giá!')
      // Scroll lên phần chọn sao
      document.getElementById('review-rating-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (content.trim().length < 10) {
      setErrorMsg('Nội dung đánh giá cần ít nhất 10 ký tự!')
      return
    }
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      let productId = ''

      // 1. Ưu tiên: product_id trực tiếp trên item
      if (typeof currentItem.product_id === 'string' && currentItem.product_id) {
        productId = currentItem.product_id
      } else if (typeof currentItem.product_id === 'object' && currentItem.product_id?._id) {
        productId = currentItem.product_id._id
      }

      // 2. Thử lấy từ variant.product_id (nếu BE populate)
      if (!productId && typeof currentItem.variant_id === 'object') {
        const vPid = currentItem.variant_id?.product_id
        if (typeof vPid === 'string') productId = vPid
        else if (typeof vPid === 'object' && vPid?._id) productId = vPid._id
      }

      // 3. Fallback: tìm product_id bằng cách search từ khóa rút gọn từ SKU
      if (!productId) {
        // Lấy SKU từ variant_id
        const sku = typeof currentItem.variant_id === 'object'
          ? currentItem.variant_id?.sku || ''
          : ''

        // Đổi SKU sang từ khóa search
        // VD: "SAMSUNG-GALAXY-S24-ULTRA-128G-FXT4" → "SAMSUNG GALAXY S24 ULTRA"
        const searchKeyword = sku
          ? skuToSearchKeyword(sku)
          : getItemName(currentItem).split(' ').slice(0, 3).join(' ')

        if (searchKeyword && searchKeyword !== 'Sản phẩm tiêu chuẩn') {
          console.log('[ReviewModal] Search product bằng keyword:', searchKeyword, '(từ SKU:', sku, ')')
          try {
            const searchRes: any = await fetchClient(`/products/search?q=${encodeURIComponent(searchKeyword)}`)
            // API search trả về raw array
            const products = Array.isArray(searchRes) ? searchRes : (searchRes?.data || [])
            if (products.length > 0) {
              // Tìm product có tên gần đúng nhất (so khớp theo SKU)
              const skuLower = sku.toLowerCase().replace(/-/g, ' ')
              const bestMatch = products.find((p: any) =>
                p.name?.toLowerCase().split(' ').some((word: string) => skuLower.includes(word))
              ) || products[0]

              productId = bestMatch?._id || bestMatch?.id || ''
              console.log('[ReviewModal] ✓ Tìm được product_id:', productId, '| Tên:', bestMatch?.name)
            } else {
              console.warn('[ReviewModal] Search không ra kết quả với keyword:', searchKeyword)
            }
          } catch (e) {
            console.warn('[ReviewModal] Search thất bại:', e)
          }
        }
      }

      // 4. Cuối cùng fallback: dùng variant._id (có thể BE chấp nhận)
      if (!productId) {
        const variantId = typeof currentItem.variant_id === 'object'
          ? currentItem.variant_id?._id
          : typeof currentItem.variant_id === 'string' ? currentItem.variant_id : ''
        productId = variantId
        console.warn('[ReviewModal] Dùng variant_id làm product_id (fallback cuối):', productId)
      }

      if (!productId) {
        setErrorMsg('Không xác định được sản phẩm cần đánh giá. Vui lòng thử lại!')
        setIsSubmitting(false)
        return
      }

      const reviewContent = selectedTags.length > 0
        ? `${content}\n\n✓ ${selectedTags.join(' · ')}`
        : content

      console.log('[ReviewModal] POST /reviews với product_id:', productId)
      await fetchClient('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          rating,
          content: reviewContent,
        })
      })
      setIsSuccess(true)
    } catch (err: unknown) {
      const e = err as Error
      setErrorMsg(e.message || 'Gửi đánh giá thất bại. Vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- SUCCESS SCREEN ---
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="text-green-500" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cảm ơn bạn đã đánh giá!</h3>
          <p className="text-gray-500 text-sm mb-6">Đánh giá của bạn giúp những người mua khác có thêm thông tin hữu ích.</p>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Viết đánh giá</h3>
            <p className="text-xs text-gray-500 mt-0.5">Đơn hàng #{order._id.slice(-6).toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">

          {/* Chọn sản phẩm (nếu đơn có nhiều item) */}
          {order.items.length > 1 && (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sản phẩm cần đánh giá</label>
              <button
                onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-2xl hover:border-red-300 transition text-left"
              >
                {currentItem.image && (
                  <img src={currentItem.image} className="w-10 h-10 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                )}
                <span className="flex-1 text-sm font-medium text-gray-800 line-clamp-1">{getItemName(currentItem)}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isItemDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isItemDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  {order.items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedItemIndex(idx); setIsItemDropdownOpen(false) }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-red-50 transition text-left ${idx === selectedItemIndex ? 'bg-red-50' : ''}`}
                    >
                      {item.image && <img src={item.image} className="w-10 h-10 object-cover rounded-xl bg-gray-100 flex-shrink-0" />}
                      <span className="text-sm font-medium text-gray-800 line-clamp-1">{getItemName(item)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sản phẩm hiện tại (1 item) */}
          {order.items.length === 1 && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              {currentItem.image && (
                <img src={currentItem.image} className="w-14 h-14 object-cover rounded-xl bg-white flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm line-clamp-2">{getItemName(currentItem)}</p>
                <p className="text-xs text-gray-500 mt-0.5">x{currentItem.quantity}</p>
              </div>
            </div>
          )}

          {/* Rating sao */}
          <div id="review-rating-section" className={`${rating === 0 && errorMsg.includes('sao') ? 'ring-2 ring-red-300 bg-red-50/30' : ''} rounded-2xl p-3 -mx-3 transition-all`}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Chất lượng sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${star <= activeRating ? 'text-yellow-400' : 'text-gray-200'}`}
                    fill={star <= activeRating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              {activeRating > 0 && (
                <span className={`ml-2 text-sm font-bold ${RATING_COLORS[activeRating - 1]}`}>
                  {RATING_LABELS[activeRating - 1]}
                </span>
              )}
            </div>
          </div>

          {/* Tags gợi ý */}
          {rating >= 4 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm nổi bật (tuỳ chọn)</label>
              <div className="flex flex-wrap gap-2">
                {TAG_SUGGESTIONS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      selectedTags.includes(tag)
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 10 ký tự)"
              rows={4}
              className="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition placeholder:text-gray-300"
            />
            <p className={`text-xs mt-1 text-right ${content.length < 10 ? 'text-gray-400' : 'text-green-500'}`}>
              {content.length} / 500 ký tự
            </p>
          </div>

          {/* Upload ảnh / video */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thêm ảnh / video <span className="text-gray-400 font-normal">(tối đa 5 file)</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {/* Preview items */}
              {mediaFiles.map((media, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 group">
                  {media.type === 'video' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                      <Video size={24} className="text-white" />
                      <span className="text-[10px] text-gray-300 mt-1">Video</span>
                    </div>
                  ) : (
                    <img src={media.preview} className="w-full h-full object-cover" alt="" />
                  )}
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    <Trash2 size={18} className="text-white" />
                  </button>
                </div>
              ))}

              {/* Add button */}
              {mediaFiles.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 hover:border-red-400 transition flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-red-400"
                >
                  <Upload size={20} />
                  <span className="text-[10px] font-medium">Thêm</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><ImageIcon size={12} /> Ảnh JPG, PNG, WEBP</span>
              <span className="flex items-center gap-1"><Video size={12} /> Video MP4, MOV</span>
            </div>
          </div>

          {/* Thông báo lỗi */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-medium">
              ⚠ {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition flex items-center justify-center gap-2 ${
              !isSubmitting
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
