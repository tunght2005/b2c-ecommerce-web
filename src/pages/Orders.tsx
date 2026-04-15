import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, 
  Search, 
  ArrowRight, 
  HelpCircle,
  X,
  Loader2
} from 'lucide-react'
import { fetchClient } from '../api/fetchClient'

// Interface chuẩn hóa theo DB Diagram của nhóm
interface OrderItem {
  variant_id: string | { _id: string, name?: string, sku?: string }
  name?: string
  image?: string
  price?: number
  quantity: number
}

interface Order {
  _id: string
  status: string
  payment_status?: string
  createdAt: string
  final_price: number
  items: OrderItem[]
}

const orderStatuses = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Chờ lấy hàng' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'return', label: 'Trả hàng' },
  { key: 'cancelled', label: 'Đã hủy' }
]

// Các lý do hủy đơn (Giống thực tế)
const cancelReasonsList = [
  'Muốn thay đổi địa chỉ giao hàng',
  'Muốn thay đổi sản phẩm (Màu sắc, Dung lượng,...)',
  'Tìm thấy giá rẻ hơn ở chỗ khác',
  'Đổi ý, không muốn mua nữa',
  'Lý do khác'
]

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all')
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // State quản lý Popup Hủy đơn
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; orderId: string | null }>({ isOpen: false, orderId: null })
  const [selectedReason, setSelectedReason] = useState('')

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setIsLoading(true)
        const response: Record<string, unknown> = await fetchClient('/order')
        if (response?.data) {
          setOrders(response.data as Order[])
        }
      } catch (err) {
        console.error('Lỗi khi lấy đơn hàng:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyOrders()
  }, [])

  const filteredOrders = activeTab === 'all' ? orders : orders.filter((order) => order.status === activeTab)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const renderStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-orange-50 text-orange-600 border-orange-100',
      confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
      shipping: 'bg-purple-50 text-purple-600 border-purple-100',
      delivered: 'bg-green-50 text-green-600 border-green-100',
      cancelled: 'bg-gray-50 text-gray-500 border-gray-100',
      return: 'bg-red-50 text-red-600 border-red-100'
    }
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận', confirmed: 'Chờ lấy hàng', shipping: 'Đang giao',
      delivered: 'Giao thành công', cancelled: 'Đã hủy', return: 'Trả hàng/Hoàn tiền'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // Hàm xử lý khi bấm nút "Đồng ý" trong Popup
  const handleSubmitCancel = () => {
    if (!selectedReason) return alert('Vui lòng chọn lý do hủy đơn!')
    
    // Đóng popup
    setCancelModal({ isOpen: false, orderId: null })
    setSelectedReason('')
    
    // Chuyển hướng sang trang Thành công
    navigate(`/orders/${cancelModal.orderId}/cancel-success`)
  }

  return (
    <div className='bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-full'>
      <div className='w-full'>
        
        {/* Banner Chính sách */}
        <div className='bg-white rounded-3xl p-4 sm:p-5 mb-6 flex items-center justify-between shadow-sm border border-red-100 bg-gradient-to-r from-white to-red-50'>
          <div className='flex items-center gap-3'>
            <div className='bg-red-500 p-2 rounded-xl text-white'>
              <HelpCircle size={20} />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-900'>Bạn cần hỗ trợ đổi trả hàng?</p>
              <p className='text-xs text-gray-500'>Tìm hiểu ngay chính sách bảo vệ người mua của SevenStore</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/return-policy')}
            className='flex items-center gap-1 text-red-600 text-sm font-bold hover:gap-2 transition-all whitespace-nowrap'
          >
            Xem chính sách <ArrowRight size={16} />
          </button>
        </div>

        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-6'>Đơn mua của tôi</h1>

        {/* Tabs */}
        <div className='flex overflow-x-auto no-scrollbar gap-2 mb-8 border-b border-gray-200 pb-px'>
          {orderStatuses.map((status) => (
            <button
              key={status.key}
              onClick={() => setActiveTab(status.key)}
              className={`whitespace-nowrap px-6 py-3 text-sm font-bold transition-all relative ${
                activeTab === status.key ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status.label}
              {activeTab === status.key && (
                <div className='absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full' />
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className='space-y-6'>
          {isLoading ? (
             <div className='text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center'>
               <Loader2 className="animate-spin text-[#E7000B] mb-4" size={40} />
               <p className='text-gray-500 font-medium'>Đang tải danh sách đơn hàng...</p>
             </div>
          ) : filteredOrders.length === 0 ? (
            <div className='text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100'>
              <Search className='mx-auto text-gray-300 mb-4' size={48} />
              <p className='text-gray-500'>Bạn chưa có đơn hàng nào ở trạng thái này.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition'>
                <div className='px-6 py-4 bg-gray-50 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100'>
                  <div className='flex items-center gap-3'>
                    <Package className='text-red-600' size={20} />
                    <span className='font-bold text-gray-900 uppercase'>Mã đơn: Seven-{order._id.substring(order._id.length - 6)}</span>
                  </div>
                  {renderStatusBadge(order.status)}
                </div>

                <div className='p-6 space-y-4'>
                  {order.items.map((item, idx) => (
                    <div key={idx} className='flex gap-4 items-start sm:items-center'>
                      <img src={item.image || 'https://via.placeholder.com/300x300'} className='w-20 h-20 object-cover rounded-2xl bg-gray-100' />
                      <div className='flex-1'>
                        <h4 className='font-bold text-gray-900 line-clamp-1'>
                          {item.name || (typeof item.variant_id === 'object' ? item.variant_id?.name || item.variant_id?.sku : '') || 'Sản phẩm tiêu chuẩn'}
                        </h4>
                        <p className='text-sm text-gray-500 mt-1'>Số lượng: x{item.quantity}</p>
                        <p className='text-red-600 font-bold mt-1 sm:hidden'>{formatCurrency(item.price || order.final_price / item.quantity)}</p>
                      </div>
                      <div className='hidden sm:block text-right'>
                        <p className='font-bold text-gray-900'>{formatCurrency(item.price || order.final_price / item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='px-6 py-5 bg-white border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4'>
                  <div className='text-sm text-gray-500 italic'>
                    Ngày đặt: {new Date(order.createdAt || '').toLocaleDateString('vi-VN')} • {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Thanh toán trực tuyến VNPay / COD'}
                  </div>
                  
                  <div className='flex flex-wrap justify-center gap-3 w-full sm:w-auto'>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => setCancelModal({ isOpen: true, orderId: order._id })}
                        className='flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition'
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <>
                        <button 
                          onClick={() => navigate(`/orders/${order._id}/return`)}
                          className='flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-orange-200 text-orange-600 font-bold text-sm hover:bg-orange-50 transition'
                        >
                          Trả hàng/Hoàn tiền
                        </button>
                        <button className='flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red-100'>
                          Đánh giá
                        </button>
                      </>
                    )}

                    <button 
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className='flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition'
                    >
                      Chi tiết đơn
                    </button>
                  </div>
                </div>

                <div className='px-6 py-3 bg-red-50/30 text-right'>
                   <span className='text-gray-600 text-sm'>Thành tiền: </span>
                   <span className='text-xl font-black text-red-600 ml-2'>{formatCurrency(order.final_price)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* POPUP (MODAL) LÝ DO HỦY ĐƠN */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl scale-100 transition-transform">
            
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Lý do hủy đơn</h3>
              <button 
                onClick={() => {
                  setCancelModal({ isOpen: false, orderId: null })
                  setSelectedReason('') // Reset lý do khi tắt popup
                }}
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-500 mb-4">Vui lòng chọn lý do hủy đơn hàng #{cancelModal.orderId}. Lưu ý, hành động này không thể hoàn tác.</p>
              
              {cancelReasonsList.map((reason) => (
                <div 
                  key={reason} 
                  onClick={() => setSelectedReason(reason)} // ĐÃ THÊM SỰ KIỆN CLICK VÀO ĐÂY
                  className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedReason === reason ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedReason === reason ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    {selectedReason === reason && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                  </div>
                  <span className={`text-sm font-medium ${selectedReason === reason ? 'text-red-700' : 'text-gray-700'}`}>
                    {reason}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => {
                  setCancelModal({ isOpen: false, orderId: null })
                  setSelectedReason('')
                }}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Không
              </button>
              <button 
                onClick={handleSubmitCancel}
                className={`flex-1 py-3.5 rounded-2xl font-bold text-white transition shadow-lg ${
                  selectedReason ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
              >
                Đồng ý
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}