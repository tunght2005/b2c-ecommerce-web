import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Camera,
  AlertCircle,
  ChevronLeft,
  Send,
  Loader2,
  PackageX,
  CheckCircle2,
  ShieldAlert,
  Info,
  X
} from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'
import Seo from '../components/Seo'

interface Policy {
  _id: string
  name: string
  days_allowed: number
  is_active: boolean
}

interface EligibleItem {
  order_item_id: string // format: "orderId:index"
  product_id: string
  product_name: string
  product_image: string
  variant_name: string
  quantity: number
  price: number
  order_created_at: string
  days_remaining: number
  policies: Policy[]
}

const RETURN_REASONS = [
  'Sản phẩm bị lỗi kỹ thuật',
  'Giao sai sản phẩm / màu sắc',
  'Sản phẩm bị hư hỏng do vận chuyển',
  'Sản phẩm không giống mô tả',
  'Sản phẩm thiếu phụ kiện',
  'Lý do khác'
]

export default function ReturnRequest() {
  const { id } = useParams() // order id
  const navigate = useNavigate()

  const [items, setItems] = useState<EligibleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [selectedItem, setSelectedItem] = useState<EligibleItem | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [alreadyReturned, setAlreadyReturned] = useState(false)

  const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

  // Load eligible items của đơn hàng này
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        // Kiểm tra nếu đơn hàng này đã có return request rồi (tránh tạo trùng)
        try {
          const existingRes = await fetchClient<any>('/after-sales/returns')
          let existingList: any[] = []
          if (Array.isArray(existingRes)) existingList = existingRes
          else if (Array.isArray(existingRes?.data?.returns)) existingList = existingRes.data.returns
          else if (Array.isArray(existingRes?.data?.items)) existingList = existingRes.data.items
          else if (Array.isArray(existingRes?.data)) existingList = existingRes.data

          const hasReturn = existingList.some((r: any) => {
            const oid = r.order_item_id || ''
            return oid.startsWith(id || '') || r.order_id === id
          })
          if (hasReturn) {
            setAlreadyReturned(true)
            setLoading(false)
            return
          }
        } catch {
          /* bỏ qua, vẫn cho phép tiếp tục */
        }
        // Gọi không có search filter — lấy TẤT CẢ eligible items của user
        // sau đó lọc client-side theo order id
        const res = await fetchClient<any>(`/after-sales/returns/eligible-items`)
        console.log('[ReturnRequest] eligible-items response:', res)

        // Handle mọi dạng response từ BE
        let allItems: any[] = []
        if (Array.isArray(res)) allItems = res
        else if (Array.isArray(res?.data?.items))
          allItems = res.data.items // { data: { items: [] } }
        else if (Array.isArray(res?.data)) allItems = res.data
        else if (Array.isArray(res?.items)) allItems = res.items
        else if (Array.isArray(res?.eligible_items)) allItems = res.eligible_items
        else if (res && typeof res === 'object' && res._id) allItems = [res]

        console.log('[ReturnRequest] allItems:', allItems)
        if (allItems.length > 0) {
          console.log('[ReturnRequest] Item[0] full structure:', JSON.stringify(allItems[0], null, 2))
        }

        // Lọc item theo order hiện tại
        const list = id
          ? allItems.filter((item: any) => {
              const oid = item.order_item_id || item.order_id || ''
              return oid.startsWith(id) || item.order_id === id
            })
          : allItems
        const finalList = list.length > 0 ? list : allItems

        // Load tất cả active policies làm fallback (vì variant.product_id thường = null)
        let allActivePolicies: Policy[] = []
        try {
          const polAllRes = await fetchClient<any>('/after-sales/return-policies')
          const polAll = Array.isArray(polAllRes)
            ? polAllRes
            : Array.isArray(polAllRes?.data)
              ? polAllRes.data
              : Array.isArray(polAllRes?.data?.items)
                ? polAllRes.data.items
                : []
          allActivePolicies = polAll.filter((p: any) => p.is_active)
        } catch {
          /* bỏ qua */
        }

        // Với mỗi item, build EligibleItem
        const enriched: EligibleItem[] = await Promise.all(
          finalList.map(async (item: any) => {
            // Tên và ảnh từ product (nếu có) hoặc variant SKU
            const productObj = item.product
            const variantObj = item.variant
            const productId: string = productObj?._id || variantObj?.product_id || ''
            const productName: string = productObj?.name || variantObj?.sku || item.name || 'Sản phẩm'
            const productImage: string =
              resolveImageUrl(productObj?.thumbnail || productObj?.image || item.image) ||
              'https://via.placeholder.com/80'

            // Load policy theo product nếu có, ngược lại dùng allActivePolicies
            let policies: Policy[] = allActivePolicies
            if (productId) {
              try {
                const polRes = await fetchClient<any>(`/after-sales/return-policies/product/${productId}`)
                const polList = Array.isArray(polRes) ? polRes : (polRes?.data ?? [])
                const filtered = polList.filter((p: any) => p.is_active)
                if (filtered.length > 0) policies = filtered
              } catch {
                /* dùng allActivePolicies */
              }
            }

            return {
              order_item_id: item.order_item_id || `${item.order_id}:0`,
              product_id: productId,
              product_name: productName,
              product_image: productImage,
              variant_name: variantObj?.sku || variantObj?.name || '',
              quantity: item.quantity || 1,
              price: item.price || 0,
              order_created_at: item.order_created_at || item.created_at || '',
              days_remaining: item.days_remaining ?? 0,
              policies
            }
          })
        )

        setItems(enriched)
        if (enriched.length === 1) {
          setSelectedItem(enriched[0])
          setRefundAmount(enriched[0].price)
          if (enriched[0].policies.length === 1) setSelectedPolicy(enriched[0].policies[0])
        }
      } catch (e: any) {
        console.error('[ReturnRequest] load error:', e)
        setError(e.message || 'Không thể tải danh sách sản phẩm hoàn trả.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSelectItem = (item: EligibleItem) => {
    setSelectedItem(item)
    setRefundAmount(item.price)
    setSelectedPolicy(item.policies.length === 1 ? item.policies[0] : null)
    setReason('')
    setCustomReason('')
    setSubmitError('')
  }

  const finalReason = reason === 'Lý do khác' ? customReason : reason

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) {
      setSubmitError('Vui lòng chọn sản phẩm cần hoàn trả.')
      return
    }
    if (!selectedPolicy) {
      setSubmitError('Vui lòng chọn chính sách hoàn trả.')
      return
    }
    if (!finalReason.trim()) {
      setSubmitError('Vui lòng chọn hoặc nhập lý do hoàn trả.')
      return
    }

    try {
      setSubmitting(true)
      setSubmitError('')
      await fetchClient('/after-sales/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_item_id: selectedItem.order_item_id,
          policy_id: selectedPolicy._id,
          reason: finalReason,
          refund_amount: refundAmount,
          ...(evidenceUrl.trim() ? { evidence_image: evidenceUrl.trim() } : {})
        })
      })
      setSuccess(true)
    } catch (e: any) {
      setSubmitError(e.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- ALREADY RETURNED SCREEN ----------
  if (alreadyReturned) {
    return (
      <div className='bg-gray-50 min-h-screen flex items-center justify-center py-10 px-4'>
        <div className='bg-white rounded-3xl p-8 max-w-md w-full shadow-sm border border-gray-100 text-center'>
          <div className='w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-5'>
            <AlertCircle size={44} className='text-orange-400' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Đã gửi yêu cầu trước đó</h2>
          <p className='text-gray-500 mb-6'>
            Bạn đã gửi yêu cầu hoàn trả cho đơn hàng này rồi. Vui lòng kiểm tra trạng thái tại trang{' '}
            <strong>Lịch sử hoàn trả</strong>.
          </p>
          <div className='flex flex-col gap-3'>
            <button
              onClick={() => navigate('/profile/returns')}
              className='w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold transition'
            >
              Xem lịch sử hoàn trả
            </button>
            <button
              onClick={() => navigate('/profile/orders')}
              className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold transition'
            >
              Về trang đơn hàng
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- SUCCESS SCREEN ----------
  if (success) {
    return (
      <div className='bg-gray-50 min-h-screen flex items-center justify-center py-10 px-4'>
        <div className='bg-white rounded-3xl p-8 max-w-md w-full shadow-sm border border-gray-100 text-center'>
          <div className='w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5'>
            <CheckCircle2 size={44} className='text-green-500' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Yêu cầu đã được gửi!</h2>
          <p className='text-gray-500 mb-6'>
            Chúng tôi đã nhận được yêu cầu hoàn trả của bạn và sẽ xử lý trong vòng <strong>1–3 ngày làm việc</strong>.
          </p>
          <div className='bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Sản phẩm</span>
              <span className='font-medium text-gray-800'>{selectedItem?.product_name}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Chính sách</span>
              <span className='font-medium'>{selectedPolicy?.name}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Lý do</span>
              <span className='font-medium'>{finalReason}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Số tiền hoàn</span>
              <span className='font-semibold text-red-600'>{formatCurrency(refundAmount)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile/orders')}
            className='w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold transition'
          >
            Về trang đơn hàng
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-50 min-h-screen py-6 sm:py-10'>
      <Seo
        title='Yêu cầu trả hàng'
        description='Gửi yêu cầu trả hàng, hoàn tiền và theo dõi xử lý đơn hàng tại 7Store.'
        keywords='trả hàng, hoàn tiền, 7Store'
        canonicalPath={`/orders/${id || ''}/return`}
      />
      <div className='max-w-2xl mx-auto px-4'>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-gray-500 hover:text-red-600 mb-6 transition font-medium'
        >
          <ChevronLeft size={20} /> Quay lại đơn hàng
        </button>

        <div className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Header */}
          <div className='bg-linear-to-r from-red-500 to-red-600 px-6 py-5 text-white'>
            <div className='flex items-center gap-3'>
              <PackageX size={28} />
              <div>
                <h1 className='text-xl font-bold'>Yêu cầu hoàn trả</h1>
                <p className='text-red-100 text-sm'>Mã đơn: #{id?.slice(-6).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className='p-6 sm:p-8'>
            {/* Loading */}
            {loading && (
              <div className='flex items-center justify-center py-16'>
                <Loader2 className='animate-spin text-red-500 mr-3' size={28} />
                <span className='text-gray-500'>Đang kiểm tra điều kiện hoàn trả...</span>
              </div>
            )}

            {/* Error loading */}
            {!loading && error && (
              <div className='text-center py-12'>
                <ShieldAlert size={48} className='mx-auto text-gray-300 mb-4' />
                <p className='text-gray-600 font-medium mb-1'>{error}</p>
                <p className='text-gray-400 text-sm'>
                  Đơn hàng này có thể không đủ điều kiện hoàn trả hoặc đã hết thời hạn.
                </p>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className='text-center py-12'>
                <ShieldAlert size={48} className='mx-auto text-gray-300 mb-4' />
                <p className='text-gray-600 font-medium mb-1'>Không tìm thấy sản phẩm đủ điều kiện</p>
                <p className='text-gray-400 text-sm'>
                  Đơn hàng này chưa đủ điều kiện hoàn trả hoặc đã hết thời hạn chính sách.
                </p>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <form onSubmit={handleSubmit} className='space-y-7'>
                {/* STEP 1: Chọn sản phẩm */}
                <section>
                  <h2 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>
                    <span className='w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold'>
                      1
                    </span>
                    Sản phẩm hoàn trả
                  </h2>
                  <div className='space-y-3'>
                    {items.map((item) => (
                      <button
                        key={item.order_item_id}
                        type='button'
                        onClick={() => handleSelectItem(item)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                          selectedItem?.order_item_id === item.order_item_id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={item.product_image}
                          alt=''
                          className='w-16 h-16 object-cover rounded-xl shrink-0 bg-gray-100'
                        />
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-gray-900 line-clamp-1'>{item.product_name}</p>
                          {item.variant_name && <p className='text-sm text-gray-500'>{item.variant_name}</p>}
                          <div className='flex items-center gap-3 mt-1'>
                            <span className='text-red-600 font-bold text-sm'>{formatCurrency(item.price)}</span>
                            {item.days_remaining > 0 && (
                              <span className='text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium'>
                                Còn {item.days_remaining} ngày HT
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                            selectedItem?.order_item_id === item.order_item_id
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedItem?.order_item_id === item.order_item_id && (
                            <div className='w-full h-full flex items-center justify-center'>
                              <div className='w-2 h-2 bg-white rounded-full' />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* STEP 2: Chọn chính sách */}
                {selectedItem && (
                  <section>
                    <h2 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>
                      <span className='w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold'>
                        2
                      </span>
                      Chính sách hoàn trả
                    </h2>
                    {selectedItem.policies.length === 0 ? (
                      <div className='bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3'>
                        <Info size={18} className='text-orange-500 shrink-0 mt-0.5' />
                        <p className='text-orange-700 text-sm'>
                          Sản phẩm này chưa có chính sách hoàn trả. Vui lòng liên hệ CSKH để được hỗ trợ.
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        {selectedItem.policies.map((pol) => (
                          <button
                            type='button'
                            key={pol._id}
                            onClick={() => setSelectedPolicy(pol)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl border text-left transition-all ${
                              selectedPolicy?._id === pol._id
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className='flex-1'>
                              <p className='font-semibold text-gray-800'>{pol.name}</p>
                              <p className='text-sm text-gray-500'>
                                Trong vòng {pol.days_allowed} ngày kể từ ngày đặt hàng
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 shrink-0 rounded-full border-2 ${selectedPolicy?._id === pol._id ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}
                            >
                              {selectedPolicy?._id === pol._id && (
                                <div className='w-full h-full flex items-center justify-center'>
                                  <div className='w-2 h-2 bg-white rounded-full' />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* STEP 3: Lý do */}
                {selectedItem && selectedPolicy && (
                  <section>
                    <h2 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>
                      <span className='w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold'>
                        3
                      </span>
                      Lý do hoàn trả
                    </h2>
                    <div className='grid gap-2'>
                      {RETURN_REASONS.map((r) => (
                        <button
                          key={r}
                          type='button'
                          onClick={() => setReason(r)}
                          className={`text-left px-4 py-3 rounded-2xl border text-sm transition-all ${
                            reason === r
                              ? 'border-red-500 bg-red-50 text-red-600 font-semibold'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    {reason === 'Lý do khác' && (
                      <textarea
                        required
                        rows={3}
                        placeholder='Mô tả lý do của bạn...'
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className='mt-3 w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none resize-none'
                      />
                    )}
                  </section>
                )}

                {/* STEP 4: Thông tin thêm */}
                {selectedItem && selectedPolicy && reason && (
                  <section>
                    <h2 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>
                      <span className='w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold'>
                        4
                      </span>
                      Thông tin bổ sung
                    </h2>

                    <div className='space-y-4'>
                      {/* Số tiền hoàn */}
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
                          Số tiền yêu cầu hoàn (VNĐ)
                        </label>
                        <input
                          type='number'
                          min={0}
                          max={selectedItem.price}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(Number(e.target.value))}
                          className='w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none'
                        />
                        <p className='text-xs text-gray-400 mt-1 flex items-center gap-1'>
                          <Info size={11} /> Tối đa: {formatCurrency(selectedItem.price)}
                        </p>
                      </div>

                      {/* Link ảnh minh chứng */}
                      <div>
                        <label className='text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2'>
                          <Camera size={14} /> Link ảnh minh chứng (không bắt buộc)
                        </label>
                        <input
                          type='url'
                          placeholder='https://...'
                          value={evidenceUrl}
                          onChange={(e) => setEvidenceUrl(e.target.value)}
                          className='w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none'
                        />
                        <p className='text-xs text-gray-400 mt-1 flex items-center gap-1'>
                          <AlertCircle size={11} /> Dán link ảnh từ Google Drive, Imgur... để minh chứng lỗi sản phẩm
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Submit error */}
                {submitError && (
                  <div className='bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3'>
                    <X size={16} className='shrink-0 mt-0.5' />
                    <p className='text-sm font-medium'>{submitError}</p>
                  </div>
                )}

                {/* Submit button */}
                {selectedItem && selectedPolicy && reason && (
                  <button
                    type='submit'
                    disabled={submitting}
                    className='w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {submitting ? <Loader2 size={20} className='animate-spin' /> : <Send size={20} />}
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu hoàn trả'}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
