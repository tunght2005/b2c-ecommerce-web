import { useState, useEffect } from 'react'
import { fetchClient } from '../api/fetchClient'
import { Shield, AlertTriangle, Calendar, PenTool, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { showToast } from '../components/Toast'

interface Warranty {
  _id: string
  order_item_id:
    | {
        _id: string
        product_id: any
        variant_id: any
        quantity: number
        price: number
      }
    | string
  warranty_period: number
  status: string
  created_at: string
  start_date: string
  // Các field khác nếu API có trả về chi tiết hơn
}

export default function ProfileWarranty() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [loading, setLoading] = useState(true)

  // Dành cho modal khi click "Claim"
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null)
  const [issueDescription, setIssueDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [rawResponse, setRawResponse] = useState<any>(null)

  const fetchWarranties = async () => {
    try {
      setLoading(true)
      const res = await fetchClient('/after-sales/warranty')
      setRawResponse(res)
      // Vét cạn dữ liệu mảng như rule đã đề ra
      let dataItems: any[] = []
      if (Array.isArray(res)) dataItems = res
      else if (res?.data && Array.isArray(res.data)) dataItems = res.data
      else if (res?.data?.records && Array.isArray(res.data.records)) dataItems = res.data.records
      else if (res?.data?.items && Array.isArray(res.data.items)) dataItems = res.data.items
      else if (res?.data?.data && Array.isArray(res.data.data)) dataItems = res.data.data
      else if (res?.warranties && Array.isArray(res.warranties)) dataItems = res.warranties
      else if (res?.data?.warranties && Array.isArray(res.data.warranties)) dataItems = res.data.warranties

      setWarranties(dataItems)
    } catch (error) {
      console.error('Lỗi khi tải danh sách bảo hành:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarranties()
  }, [])

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWarranty || !issueDescription.trim()) return

    try {
      setSubmitting(true)
      await fetchClient(`/after-sales/warranty/${selectedWarranty._id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description_issue: issueDescription })
      })

      // Thành công, đóng modal và reset
      setSelectedWarranty(null)
      setIssueDescription('')

      // Reload danh sách ngầm như rule đã đề ra
      fetchWarranties()
      showToast('Yêu cầu bảo hành đã được gửi thành công. Chúng tôi sẽ sớm liên hệ lại với bạn.', 'success')
    } catch (error: any) {
      showToast(error?.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Hàm tính số ngày còn lại (Demo logic)
  const calculateDaysLeft = (startDate: string, periodMonths: number) => {
    if (!startDate || !periodMonths) return 0
    const end = new Date(startDate)
    end.setMonth(end.getMonth() + periodMonths)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const extractItemLabel = (item: any) => {
    if (typeof item === 'string') return item
    if (item?.product_id?.name) return item.product_id.name
    if (item?._id) return `Item: ${item._id.substring(0, 8)}...`
    return 'Thiết bị'
  }

  if (loading) {
    return (
      <div className='bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-gray-400'>
          <div className='w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin'></div>
          <p>Đang tải dữ liệu bảo hành...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-3xl p-6 shadow-sm border border-gray-100'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-3 bg-red-50 text-red-600 rounded-2xl'>
          <Shield size={24} />
        </div>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>Bảo Hành Thiết Bị</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Danh sách các thiết bị bạn đã mua và thông tin bảo hành tương ứng.
          </p>
        </div>
      </div>

      {warranties.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-gray-500 gap-4'>
          <Shield size={64} className='text-gray-200' />
          <p>Bạn chưa có thiết bị nào đang trong thời gian bảo hành.</p>
          {rawResponse && (
            <div className='mt-4 p-4 bg-gray-100 rounded-xl text-xs text-left w-full max-w-2xl overflow-auto'>
              <p className='font-bold mb-2'>Debug Data from API:</p>
              <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='hidden md:grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-gray-500 pb-3 border-b border-gray-100 px-4'>
            <div className='col-span-5'>Thiết bị / ID Giao Dịch</div>
            <div className='col-span-2 text-center'>Chu kỳ</div>
            <div className='col-span-2 text-center'>Thời gian còn</div>
            <div className='col-span-2 text-center'>Trạng thái</div>
            <div className='col-span-1 text-right'>Lệnh</div>
          </div>

          {warranties.map((w) => {
            const startDate = w.start_date || w.created_at || ''
            const daysLeft = calculateDaysLeft(startDate, w.warranty_period)
            const isExpired = daysLeft === 0 || w.status?.toLowerCase() === 'expired'
            const isActive = w.status?.toLowerCase() === 'active' && !isExpired

            return (
              <div
                key={w._id}
                className='border border-gray-100 rounded-2xl md:px-4 md:py-3 p-4 flex flex-col md:grid md:grid-cols-12 md:gap-4 items-center bg-gray-50/50 hover:bg-white hover:border-red-100 transition-colors'
              >
                {/* Mobile view top part */}
                <div className='w-full flex justify-between md:hidden mb-2'>
                  <span className='text-xs text-gray-400 font-medium'>
                    #{w._id.substring(w._id.length - 8).toUpperCase()}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isActive
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : isExpired
                          ? 'bg-gray-100 text-gray-500 border border-gray-200'
                          : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                    }`}
                  >
                    {isActive ? 'Đang hiệu lực' : w.status}
                  </span>
                </div>

                <div className='col-span-5 w-full'>
                  <p className='font-semibold text-gray-800 break-words line-clamp-1'>
                    {extractItemLabel(w.order_item_id)}
                  </p>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    Ngày kích hoạt: {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'Không rõ'}
                  </p>
                </div>

                <div className='col-span-2 w-full md:text-center mt-3 md:mt-0 flex items-center justify-between md:block'>
                  <span className='md:hidden text-xs text-gray-500'>Chu kỳ:</span>
                  <span className='text-sm font-medium text-gray-700 flex items-center md:justify-center gap-1.5'>
                    <Calendar size={14} className='text-gray-400' /> {w.warranty_period} tháng
                  </span>
                </div>

                <div className='col-span-2 w-full md:text-center mt-2 md:mt-0 flex items-center justify-between md:block'>
                  <span className='md:hidden text-xs text-gray-500'>Còn lại:</span>
                  <span className={`text-sm font-bold ${isExpired ? 'text-gray-400' : 'text-red-500'}`}>
                    {daysLeft} ngày
                  </span>
                </div>

                <div className='col-span-2 w-full md:flex justify-center mt-2 md:mt-0 hidden'>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                      isActive
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : isExpired
                          ? 'bg-gray-100 text-gray-500 border border-gray-200'
                          : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                    }`}
                  >
                    {isActive && <CheckCircle2 size={12} />}
                    {isActive ? 'Đang hiệu lực' : w.status}
                  </span>
                </div>

                <div className='col-span-1 w-full md:w-auto mt-4 md:mt-0 flex md:justify-end'>
                  <button
                    disabled={isExpired}
                    onClick={() => !isExpired && setSelectedWarranty(w)}
                    className='w-full md:w-auto px-4 py-2 md:py-1.5 md:p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Yêu cầu bảo hành'
                  >
                    <PenTool size={16} />
                    <span className='md:hidden text-sm font-medium'>Yêu cầu bảo hành</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CLAIM MODAL */}
      {selectedWarranty && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in'>
          <div className='bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative'>
            <div className='p-6'>
              <div className='w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4'>
                <AlertTriangle size={24} />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Yêu Cầu Bảo Hành</h3>
              <p className='text-sm text-gray-500 mb-6'>
                Mô tả chi tiết những vấn đề/lỗi kỹ thuật mà bạn đang gặp phải với thiết bị
                <strong className='text-gray-800 ml-1'>
                  #{selectedWarranty._id.substring(selectedWarranty._id.length - 8).toUpperCase()}
                </strong>
                .
              </p>

              <form onSubmit={handleClaimSubmit}>
                <div className='mb-5'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Mô tả sự cố <span className='text-red-500'>*</span>
                  </label>
                  <textarea
                    required
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={4}
                    className='w-full outline-none focus:ring-2 focus:ring-red-500 border border-gray-200 rounded-xl p-3 text-sm resize-none transition-shadow'
                    placeholder='Ví dụ: Thiết bị không lên nguồn tự nhiên sau khi sạc đầy...'
                  ></textarea>
                </div>

                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={() => setSelectedWarranty(null)}
                    className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors'
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type='submit'
                    disabled={submitting || !issueDescription.trim()}
                    className='flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                  >
                    {submitting ? (
                      <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    ) : (
                      'Gửi yêu cầu'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
