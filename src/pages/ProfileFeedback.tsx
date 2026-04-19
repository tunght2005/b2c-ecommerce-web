import { useState, useEffect } from 'react'
import { fetchClient } from '../api/fetchClient'
import {
  Plus,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  Loader2,
  HelpCircle,
  Search,
  Package,
  ShoppingBag
} from 'lucide-react'
import { resolveImageUrl } from '../api/config'

type Feedback = {
  _id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  product_id?: { _id: string; name: string; thumbnail?: string } | string
  order_id?: { _id: string; totalAmount?: number } | string
  createdAt: string
}

type DropdownItem = {
  _id: string
  name: string
  thumbnail?: string
  extra?: string
}

const PRODUCT_SUGGESTIONS = [
  'Có chơi được game không?',
  'Có chống nước không?',
  'Có hỗ trợ 5G không?',
  'Thời gian bảo hành bao lâu?',
  'Có giao hàng toàn quốc không?',
  'Có dùng được SIM Việt Nam không?'
]

const ORDER_SUGGESTIONS = [
  'Đóng gói sản phẩm chưa cẩn thận',
  'Giao hàng quá chậm',
  'Khiếu nại về thái độ Shipper',
  'Hàng bị hư hỏng khi nhận',
  'Đơn hàng bị tách kiện',
  'Yêu cầu xuất hoá đơn đỏ'
]

export default function ProfileFeedback() {
  const [activeTab, setActiveTab] = useState<'product' | 'order'>('product')
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>([])
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ ref_id: '', title: '', content: '', priority: 'medium' })
  const [errorMsg, setErrorMsg] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetchClient<any>('/feedback/my').catch(() => [])
      setFeedbacks(Array.isArray(res) ? res : res?.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(dropdownItems)
    } else {
      setFilteredItems(dropdownItems.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase())))
    }
  }, [searchTerm, dropdownItems])

  const fetchDropdownItems = async (tab: 'product' | 'order') => {
    setItemsLoading(true)
    try {
      if (tab === 'product') {
        const res = await fetchClient<any>('/products')
        const list: any[] = Array.isArray(res) ? res : res?.data || []
        setDropdownItems(
          list.map((p: any) => ({
            _id: p._id || p.id,
            name: p.name,
            thumbnail: resolveImageUrl(p.thumbnail || p.image) || undefined
          }))
        )
      } else {
        const res = await fetchClient<any>('/feedback/eligible-orders').catch(() => [])
        const list: any[] = Array.isArray(res) ? res : res?.data || []
        setDropdownItems(
          list.map((o: any) => ({
            _id: o._id || o.id,
            name: `Đơn hàng #${(o._id || o.id).substring(0, 8).toUpperCase()}`,
            extra: new Date(o.createdAt).toLocaleDateString('vi-VN')
          }))
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setItemsLoading(false)
    }
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setErrorMsg('')
    setFormData({ ref_id: '', title: '', content: '', priority: 'medium' })
    setSearchTerm('')
    setDropdownItems([])
    setFilteredItems([])
    fetchDropdownItems(activeTab)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.ref_id) {
      setErrorMsg(activeTab === 'product' ? 'Vui lòng chọn sản phẩm.' : 'Vui lòng chọn đơn hàng.')
      return
    }
    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tiêu đề và nội dung.')
      return
    }
    try {
      setIsSubmitting(true)
      setErrorMsg('')
      const payload =
        activeTab === 'product'
          ? {
              product_id: formData.ref_id,
              title: formData.title,
              content: formData.content,
              priority: formData.priority
            }
          : { order_id: formData.ref_id, title: formData.title, content: formData.content, priority: formData.priority }
      await fetchClient('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      setErrorMsg(error.message || 'Gửi thất bại. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: Feedback['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className='px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1'>
            <AlertCircle size={12} /> Chờ phản hồi
          </span>
        )
      case 'in_progress':
        return (
          <span className='px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold flex items-center gap-1'>
            <Clock size={12} /> Đang xử lý
          </span>
        )
      case 'resolved':
      case 'closed':
        return (
          <span className='px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1'>
            <CheckCircle2 size={12} /> Đã trả lời
          </span>
        )
      default:
        return (
          <span className='px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold'>Không rõ</span>
        )
    }
  }

  const getPriorityLabel = (p: string) => {
    if (p === 'high') return { label: 'Gấp', cls: 'text-red-600 bg-red-50 border-red-200' }
    if (p === 'low') return { label: 'Thấp', cls: 'text-gray-500 bg-gray-50 border-gray-200' }
    return { label: 'Bình thường', cls: 'text-blue-600 bg-blue-50 border-blue-200' }
  }

  const selectedItem = dropdownItems.find((i) => i._id === formData.ref_id)
  const suggestions = activeTab === 'product' ? PRODUCT_SUGGESTIONS : ORDER_SUGGESTIONS

  // Lọc theo Tab
  const tabFeedbacks = feedbacks.filter((fb) => (activeTab === 'product' ? !!fb.product_id : !!fb.order_id))

  return (
    <>
      <div className='bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <HelpCircle className='text-red-500' />
              Hỏi đáp & Hỗ trợ
            </h1>
            <p className='text-gray-500 text-sm mt-1'>Tư vấn sản phẩm hoặc góp ý về đơn hàng đã nhận.</p>
          </div>
          <button
            onClick={handleOpenModal}
            className='bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 shadow-sm hover:shadow-md'
          >
            <Plus size={18} />
            {activeTab === 'product' ? 'Đặt câu hỏi' : 'Tạo khiếu nại'}
          </button>
        </div>

        {/* Tab Bar */}
        <div className='flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 w-full sm:w-fit'>
          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'product' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag size={16} />
            Hỏi đáp Sản Phẩm
            {feedbacks.filter((fb) => !!fb.product_id).length > 0 && (
              <span className='bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full'>
                {feedbacks.filter((fb) => !!fb.product_id).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'order' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package size={16} />
            Khiếu nại Đơn Hàng
            {feedbacks.filter((fb) => !!fb.order_id).length > 0 && (
              <span className='bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full'>
                {feedbacks.filter((fb) => !!fb.order_id).length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='animate-spin text-red-500 mr-3' size={30} />
            <span className='text-gray-500 font-medium'>Đang tải...</span>
          </div>
        ) : tabFeedbacks.length > 0 ? (
          <div className='space-y-4'>
            {tabFeedbacks.map((fb) => {
              const pri = getPriorityLabel(fb.priority)
              return (
                <div
                  key={fb._id}
                  className='border rounded-2xl p-5 hover:border-gray-300 transition-colors bg-gray-50/50'
                >
                  <div className='flex flex-wrap items-center gap-2 mb-3'>
                    {getStatusBadge(fb.status || 'open')}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${pri.cls}`}
                    >
                      {pri.label}
                    </span>
                    <span className='text-xs text-gray-400 font-medium ml-auto'>
                      {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Sản phẩm liên quan */}
                  {fb.product_id && (
                    <div className='flex items-center gap-2 mb-3 bg-white p-2 border border-gray-100 rounded-xl max-w-sm'>
                      <div className='w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0'>
                        {typeof fb.product_id === 'object' && fb.product_id.thumbnail ? (
                          <img src={fb.product_id.thumbnail} alt='' className='w-full h-full object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-gray-400'>
                            <ShoppingBag size={16} />
                          </div>
                        )}
                      </div>
                      <span className='text-sm font-medium text-gray-700 line-clamp-1'>
                        {typeof fb.product_id === 'object' ? fb.product_id.name : 'Sản phẩm'}
                      </span>
                    </div>
                  )}

                  {/* Đơn hàng liên quan */}
                  {fb.order_id && (
                    <div className='flex items-center gap-3 mb-3 bg-white p-2 border border-gray-100 rounded-xl max-w-sm'>
                      <div className='w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-100'>
                        <Package size={16} className='text-red-400' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 font-medium'>Đơn hàng</p>
                        <p className='text-sm font-bold text-gray-800'>
                          #
                          {(typeof fb.order_id === 'object' ? fb.order_id._id : String(fb.order_id))
                            .substring(0, 8)
                            .toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )}

                  <h3 className='font-bold text-gray-900 mb-2 flex items-start gap-2'>
                    <MessageSquare size={16} className='text-red-400 mt-0.5 flex-shrink-0' />
                    {fb.title}
                  </h3>
                  <p className='text-gray-600 text-sm bg-white p-3 rounded-xl border border-gray-100 mb-3'>
                    {fb.content}
                  </p>

                  <div className='flex justify-end'>
                    <button className='text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition'>
                      Xem phản hồi <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='text-center py-20 flex flex-col items-center'>
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${activeTab === 'product' ? 'bg-blue-50 text-blue-300' : 'bg-red-50 text-red-300'}`}
            >
              {activeTab === 'product' ? <HelpCircle size={40} /> : <Package size={40} />}
            </div>
            <h3 className='text-xl font-bold text-gray-700 mb-2'>
              {activeTab === 'product' ? 'Chưa có câu hỏi nào' : 'Chưa có khiếu nại nào'}
            </h3>
            <p className='text-gray-500 max-w-sm mx-auto mb-6'>
              {activeTab === 'product'
                ? 'Bạn có thắc mắc về sản phẩm? Hãy đặt câu hỏi, đội CSKH sẽ phản hồi nhanh nhất!'
                : 'Chưa có khiếu nại nào. Hy vọng mọi đơn hàng của bạn đều thành công tốt đẹp!'}
            </p>
            <button
              onClick={handleOpenModal}
              className='text-red-500 font-semibold hover:underline flex items-center gap-1'
            >
              <Plus size={16} />
              {activeTab === 'product' ? 'Đặt câu hỏi ngay' : 'Tạo khiếu nại ngay'}
            </button>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col'>
            {/* Header */}
            <div className='border-b px-6 py-4 flex items-center justify-between bg-gray-50/50 flex-shrink-0'>
              <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                {activeTab === 'product' ? (
                  <>
                    <HelpCircle size={20} className='text-blue-500' /> Đặt câu hỏi về Sản Phẩm
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} className='text-red-500' /> Tạo phiếu Khiếu nại Đơn Hàng
                  </>
                )}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition'
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 overflow-y-auto flex-1'>
              {errorMsg && (
                <div className='mb-4 bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-medium'>
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}

              <div className='space-y-5'>
                {/* Dropdown chọn Sản phẩm hoặc Đơn hàng */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
                    {activeTab === 'product' ? 'Sản phẩm bạn muốn hỏi *' : 'Đơn hàng muốn khiếu nại *'}
                  </label>

                  {selectedItem && (
                    <div className='flex items-center gap-3 mb-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2'>
                      {activeTab === 'product' && selectedItem.thumbnail ? (
                        <img src={selectedItem.thumbnail} alt='' className='w-8 h-8 rounded object-cover shrink-0' />
                      ) : (
                        <div className='w-8 h-8 rounded bg-red-100 text-red-500 flex items-center justify-center shrink-0'>
                          {activeTab === 'product' ? <ShoppingBag size={15} /> : <Package size={15} />}
                        </div>
                      )}
                      <span className='text-sm font-semibold text-red-700 flex-1 line-clamp-1'>
                        {selectedItem.name}
                      </span>
                      <button
                        type='button'
                        onClick={() => setFormData({ ...formData, ref_id: '' })}
                        className='text-red-400 hover:text-red-600'
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {!selectedItem && (
                    <>
                      <div className='relative mb-1'>
                        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                          type='text'
                          placeholder={activeTab === 'product' ? 'Tìm sản phẩm...' : 'Tìm đơn hàng...'}
                          className='w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      {itemsLoading ? (
                        <div className='flex items-center gap-2 text-gray-500 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3'>
                          <Loader2 size={15} className='animate-spin' />
                          {activeTab === 'product' ? 'Đang tải sản phẩm...' : 'Đang tải đơn hàng...'}
                        </div>
                      ) : (
                        <div className='max-h-44 overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y divide-gray-50'>
                          {filteredItems.length === 0 ? (
                            <p className='text-gray-400 text-sm text-center py-4'>
                              {activeTab === 'product' ? 'Không tìm thấy sản phẩm' : 'Bạn chưa có đơn hàng hợp lệ'}
                            </p>
                          ) : (
                            filteredItems.map((item) => (
                              <button
                                key={item._id}
                                type='button'
                                onClick={() => setFormData({ ...formData, ref_id: item._id })}
                                className='w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 transition text-left'
                              >
                                {activeTab === 'product' && item.thumbnail ? (
                                  <img
                                    src={item.thumbnail}
                                    alt=''
                                    className='w-9 h-9 rounded object-cover flex-shrink-0'
                                  />
                                ) : (
                                  <div className='w-9 h-9 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0'>
                                    {activeTab === 'product' ? <ShoppingBag size={16} /> : <Package size={16} />}
                                  </div>
                                )}
                                <div>
                                  <p className='text-sm text-gray-800 font-medium line-clamp-1'>{item.name}</p>
                                  {item.extra && <p className='text-xs text-gray-400'>{item.extra}</p>}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Tiêu đề */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
                    {activeTab === 'product' ? 'Câu hỏi của bạn *' : 'Tiêu đề khiếu nại *'}
                  </label>
                  <input
                    type='text'
                    required
                    maxLength={120}
                    placeholder={
                      activeTab === 'product'
                        ? 'VD: Có chơi được game không? Có hỗ trợ 5G không?'
                        : 'VD: Giao hàng quá trễ, Hàng bị hư hỏng...'
                    }
                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition'
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <div className='flex flex-wrap gap-1.5 mt-2'>
                    {suggestions.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        type='button'
                        onClick={() => setFormData({ ...formData, title: s })}
                        className='text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition'
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Mô tả chi tiết *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder='Mô tả chi tiết để được hỗ trợ chính xác nhất...'
                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition resize-none'
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                {/* Mức độ ưu tiên */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Mức độ ưu tiên</label>
                  <div className='flex gap-2'>
                    {[
                      { value: 'low', label: 'Không gấp', activeCls: 'bg-gray-100 border-gray-500 text-gray-700' },
                      { value: 'medium', label: 'Bình thường', activeCls: 'bg-blue-50 border-blue-500 text-blue-600' },
                      { value: 'high', label: 'Cần gấp', activeCls: 'bg-red-50 border-red-500 text-red-600' }
                    ].map(({ value, label, activeCls }) => (
                      <label
                        key={value}
                        className={`flex-1 flex justify-center items-center py-2.5 rounded-xl border cursor-pointer font-medium text-sm transition-all
                          ${formData.priority === value ? activeCls : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      >
                        <input
                          type='radio'
                          name='priority'
                          value={value}
                          className='hidden'
                          checked={formData.priority === value}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className='mt-6 flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition'
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[130px]'
                >
                  {isSubmitting ? (
                    <Loader2 className='animate-spin' size={20} />
                  ) : activeTab === 'product' ? (
                    'Gửi câu hỏi'
                  ) : (
                    'Gửi khiếu nại'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
