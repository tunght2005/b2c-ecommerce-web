import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Truck, MapPin, Store, ClipboardList, Loader2, Calendar, CreditCard, History } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'

interface OrderItem {
  variant_id: any
  price: number
  quantity: number
  name?: string
  image?: string
}

interface OrderDetailData {
  _id: string
  status: string
  createdAt: string
  final_price: number
  total_price: number
  discount_price: number
  payment_status: string
  address_id: any
  items: OrderItem[]
  voucher_id?: any
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Chờ lấy hàng',
  shipping: 'Đang giao',
  completed: 'Đã hoàn thành',
  delivered: 'Đã hoàn thành',
  return: 'Trả hàng/Hoàn tiền',
  cancelled: 'Đã hủy'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Đơn hàng đã được ghi nhận và đang chờ shop xác nhận.',
  confirmed: 'Shop đã xác nhận đơn hàng và đang chuẩn bị hàng cho shipper.',
  shipping: 'Shipper đã lấy hàng và đang trên đường đến với bạn.',
  completed: 'Giao hàng thành công! Hy vọng bạn hài lòng với sản phẩm.',
  delivered: 'Giao hàng thành công! Hy vọng bạn hài lòng với sản phẩm.',
  return: 'Yêu cầu trả hàng/hoàn tiền đang được xử lý.',
  cancelled: 'Đơn hàng này đã bị hủy.'
}

function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setIsLoading(true)
        const res = await fetchClient<any>('/order')
        const orders = res?.data || (Array.isArray(res) ? res : [])
        const found = orders.find((o: any) => o._id === id)
        setOrder(found || null)
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrderData()
  }, [id])

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
        <Loader2 className='animate-spin text-red-600 mb-4' size={48} />
        <p className='text-gray-500 font-medium'>Đang tải chi tiết đơn hàng...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-20 text-center bg-gray-50 h-screen'>
        <Store size={64} className='mx-auto text-gray-300 mb-4' />
        <h2 className='text-2xl font-bold text-gray-800'>Không tìm thấy đơn hàng</h2>
        <p className='text-gray-500 mt-2'>Có vẻ như mã đơn hàng này không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => navigate('/profile/orders')}
          className='mt-8 px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-100'
        >
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Tự sinh tracking logs dựa trên status hiện tại
  const getTimeline = () => {
    const steps = [
      { key: 'pending', label: 'Đặt hàng thành công', time: order.createdAt },
      { key: 'confirmed', label: 'Shop đã xác nhận', time: order.createdAt },
      { key: 'shipping', label: 'Đang giao hàng', time: '' },
      { key: 'completed', label: 'Giao hàng thành công', time: '' }
    ]

    const currentIndex = steps.findIndex(
      (s) => s.key === order.status || (order.status === 'delivered' && s.key === 'completed')
    )
    return steps
      .map((s, idx) => ({
        ...s,
        isDone: idx <= currentIndex && currentIndex !== -1,
        isCurrent: idx === currentIndex
      }))
      .reverse()
  }

  // Xử lý địa chỉ hiển thị
  const shippingAddress = order.address_id
    ? typeof order.address_id === 'object'
      ? `${order.address_id.receiver_name} | ${order.address_id.receiver_phone}\n${order.address_id.detail_address}, ${order.address_id.ward}, ${order.address_id.district}, ${order.address_id.province}`
      : 'Đang tải thông tin địa chỉ...'
    : 'Chưa có thông tin địa chỉ'

  const skuToDisplayName = (sku: string): string => {
    if (!sku) return 'Sản phẩm tiêu chuẩn'
    const parts = sku.split('-')
    const meaningful = parts.filter((p, i) => (i < parts.length - 1 && !/^[A-Z]{3,5}\d*$/.test(p)) || parts.length <= 3)
    const keyword = (meaningful.length > 2 ? meaningful : parts.slice(0, 4)).join(' ')
    return keyword
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-8'>
        <button
          onClick={() => navigate('/profile/orders')}
          className='p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-red-600 transition'
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Chi tiết đơn hàng</h1>
          <p className='text-sm text-gray-500 font-medium mt-1'>
            SevenStore • Mã đơn: #{order._id.substring(order._id.length - 8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* CỘT TRÁI: TRACKING & SẢN PHẨM */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Trạng thái chính */}
          <div className='bg-red-600 rounded-3xl p-8 text-white shadow-xl shadow-red-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden'>
            <div className='relative z-10'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='bg-white/20 p-2 rounded-xl'>
                  <History size={24} />
                </div>
                <h2 className='text-xl sm:text-2xl font-bold uppercase tracking-tight'>
                  {statusLabels[order.status] || 'Đang xử lý'}
                </h2>
              </div>
              <p className='text-white/90 text-sm font-medium mt-1'>{statusDescriptions[order.status]}</p>
            </div>
            <div className='relative z-10 text-center md:text-right'>
              <p className='text-white/80 text-xs uppercase font-bold tracking-widest mb-1.5 mt-2 md:mt-0'>
                Tổng thanh toán
              </p>
              <p className='text-3xl font-bold tracking-tight'>{formatCurrency(order.final_price)}</p>
            </div>
            {/* Background Decoration */}
            <Truck className='absolute -bottom-6 -right-6 text-white/10' size={160} />
          </div>

          {/* Tracking Timeline */}
          <div className='bg-white rounded-3xl p-8 shadow-sm border border-gray-100'>
            <h3 className='font-bold text-gray-900 flex items-center gap-3 mb-8 text-lg'>
              <div className='bg-green-100 p-2 rounded-xl text-green-600'>
                <Truck size={20} />
              </div>
              Hành trình đơn hàng
            </h3>
            <div className='relative pl-6 space-y-10'>
              <div className='absolute top-2 bottom-2 left-[33px] w-0.5 bg-gray-50 z-0' />
              {getTimeline().map((step, idx) => (
                <div key={idx} className={`relative z-10 flex gap-8 items-start ${!step.isDone ? 'opacity-30' : ''}`}>
                  <div
                    className={`mt-1.5 w-5 h-5 rounded-full border-4 border-white shadow-md transition-all duration-500 ${
                      step.isCurrent
                        ? 'bg-green-500 ring-8 ring-green-100 scale-125'
                        : step.isDone
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                    }`}
                  />
                  <div>
                    <h4
                      className={`text-base font-bold transition-colors ${step.isCurrent ? 'text-green-600' : 'text-gray-800'}`}
                    >
                      {step.label}
                    </h4>
                    {step.time && (
                      <p className='text-xs text-gray-400 mt-1 font-bold'>
                        {new Date(step.time).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sản phẩm đã đặt */}
          <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-8'>
            <h2 className='text-lg font-bold text-gray-900 mb-8 flex items-center gap-3'>
              <div className='bg-blue-100 p-2 rounded-xl text-blue-600'>
                <Store size={20} />
              </div>
              Sản phẩm đã mua ({order.items.length})
            </h2>
            <div className='space-y-6'>
              {order.items.map((item, index) => {
                const vInfo = typeof item.variant_id === 'object' ? item.variant_id : null
                const displayName =
                  item.name ||
                  vInfo?.name ||
                  (vInfo?.sku ? skuToDisplayName(vInfo.sku) : null) ||
                  'Sản phẩm điện tử SevenStore'
                return (
                  <div
                    key={index}
                    className='flex items-center gap-6 p-5 sm:p-6 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition'
                  >
                    <div className='relative flex-shrink-0'>
                      <img
                        src={item.image || 'https://via.placeholder.com/300x300?text=7Store'}
                        alt={displayName}
                        className='w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-gray-50 border border-gray-100'
                      />
                      <div className='absolute -top-2 -right-2 bg-gray-900 text-white text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-sm'>
                        x{item.quantity}
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-bold text-gray-800 text-base sm:text-lg leading-tight'>{displayName}</h3>
                      <p className='text-gray-400 text-[11px] sm:text-xs font-semibold mt-1.5 uppercase tracking-wider'>
                        SKU: {vInfo?.sku || 'N/A'}
                      </p>
                      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 gap-1 sm:gap-0'>
                        <p className='text-gray-500 text-sm'>
                          Đơn giá: <span className='font-medium text-gray-700'>{formatCurrency(item.price)}</span>
                        </p>
                        <p className='font-bold text-red-600 text-base sm:text-lg'>
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN & THANH TOÁN */}
        <div className='space-y-8'>
          <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8'>
            <h2 className='text-lg font-bold text-gray-900 mb-6 flex items-center gap-3'>
              <div className='bg-orange-100 p-2 rounded-xl text-orange-600'>
                <ClipboardList size={20} />
              </div>
              Hồ sơ đơn mua
            </h2>
            <div className='space-y-6'>
              <div className='flex items-start gap-4'>
                <Calendar className='text-gray-400 mt-0.5 relative z-10' size={20} />
                <div>
                  <p className='text-[11px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider'>
                    Ngày lập hóa đơn
                  </p>
                  <p className='font-semibold text-gray-900 mt-1'>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')} lúc{' '}
                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <CreditCard className='text-gray-400 mt-0.5 relative z-10' size={20} />
                <div>
                  <p className='text-[11px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider'>
                    Trạng thái thanh toán
                  </p>
                  <p
                    className={`font-semibold mt-1 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {order.payment_status === 'paid'
                      ? 'Đã T.Toán trực tuyến'
                      : 'Thanh toán trực tuyến VNPay / COD (khi nhận hàng)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 relative overflow-hidden'>
            <h2 className='text-lg font-bold text-gray-900 mb-6 flex items-center gap-3'>
              <div className='bg-red-100 p-2 rounded-xl text-red-600'>
                <MapPin size={20} />
              </div>
              Địa chỉ nhận hàng
            </h2>
            <p className='text-gray-700 text-sm leading-relaxed font-medium whitespace-pre-wrap px-1'>
              {shippingAddress}
            </p>
            <div className='mt-6 flex gap-2'>
              <span className='px-3 py-1 bg-gray-900 text-white text-[10px] rounded-full font-bold uppercase'>
                Nhà riêng
              </span>
            </div>
          </div>

          <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8'>
            <h2 className='text-lg font-bold text-gray-900 mb-6 pl-1'>Chi tiết biên lai</h2>
            <div className='space-y-4 text-sm font-medium px-1'>
              <div className='flex justify-between text-gray-600'>
                <span>Tạm tính ({order.items.length} món)</span>
                <span className='text-gray-900'>{formatCurrency(order.total_price)}</span>
              </div>
              <div className='flex justify-between text-gray-600'>
                <span>Phí vận chuyển</span>
                <span className='text-green-600'>Miễn phí</span>
              </div>
              {order.discount_price > 0 && (
                <div className='flex justify-between text-red-600'>
                  <span>Giảm giá Voucher {order.voucher_id?.code ? `(${order.voucher_id.code})` : ''}</span>
                  <span>- {formatCurrency(order.discount_price)}</span>
                </div>
              )}
              <div className='border-t border-dashed border-gray-200 pt-5 mt-3 flex justify-between items-center'>
                <span className='text-gray-500 font-bold uppercase tracking-wider text-xs'>Tổng cộng</span>
                <span className='text-red-600 text-2xl font-bold'>{formatCurrency(order.final_price)}</span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className='space-y-4'>
            {order.status === 'completed' && (
              <button className='w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-200 hover:bg-black transition scale-100 active:scale-95'>
                Đánh giá sản phẩm
              </button>
            )}
            {order.payment_status !== 'paid' && order.status === 'pending' && (
              <button className='w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition'>
                Thanh toán lại (VNPAY)
              </button>
            )}
            <button
              onClick={() => navigate('/return-policy')}
              className='w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition'
            >
              Cần hỗ trợ?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
