import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, MapPin, Store, ClipboardList } from 'lucide-react'

interface OrderItem {
  name: string
  image: string
  price: number
  quantity: number
}

interface OrderDetail {
  id: string
  status: string
  date: string
  total: number
  shippingAddress: string
  paymentMethod: string
  items: OrderItem[]
}

const mockOrderDetails: Record<string, OrderDetail> = {
  ORD001: {
    id: 'ORD001', status: 'pending', date: '2024-01-15', total: 15000000,
    shippingAddress: '123 Đường ABC, Quận 1, TP.HCM', paymentMethod: 'Thanh toán khi nhận hàng',
    items: [
      { name: 'iPhone 15 Pro Max', image: 'https://via.placeholder.com/300x300?text=iPhone+15', price: 32990000, quantity: 1 },
      { name: 'AirPods Pro', image: 'https://via.placeholder.com/300x300?text=AirPods+Pro', price: 5990000, quantity: 1 }
    ]
  },
  ORD002: {
    id: 'ORD002', status: 'confirmed', date: '2024-01-14', total: 25000000,
    shippingAddress: '456 Đường XYZ, Quận 2, TP.HCM', paymentMethod: 'Ví điện tử',
    items: [{ name: 'MacBook Air M3', image: 'https://via.placeholder.com/300x300?text=MacBook+M3', price: 27490000, quantity: 1 }]
  },
  ORD003: {
    id: 'ORD003', status: 'shipping', date: '2024-01-13', total: 8000000,
    shippingAddress: '789 Đường DEF, Quận 3, TP.HCM', paymentMethod: 'Thẻ tín dụng',
    items: [{ name: 'Samsung Galaxy S25 Ultra', image: 'https://via.placeholder.com/300x300?text=Samsung+S25', price: 28990000, quantity: 1 }]
  },
  ORD004: {
    id: 'ORD004', status: 'delivered', date: '2024-01-12', total: 12000000,
    shippingAddress: '321 Đường GHI, Quận 4, TP.HCM', paymentMethod: 'Thanh toán khi nhận hàng',
    items: [{ name: 'Apple Watch Series 9', image: 'https://via.placeholder.com/300x300?text=Watch+Series+9', price: 9990000, quantity: 1 }]
  },
  ORD005: {
    id: 'ORD005', status: 'return', date: '2024-01-11', total: 5000000,
    shippingAddress: '654 Đường JKL, Quận 5, TP.HCM', paymentMethod: 'Ví điện tử',
    items: [{ name: 'Tai nghe Sony', image: 'https://via.placeholder.com/300x300?text=Sony+Headphones', price: 5000000, quantity: 1 }]
  },
  ORD006: {
    id: 'ORD006', status: 'cancelled', date: '2024-01-10', total: 3000000,
    shippingAddress: '987 Đường MNO, Quận 6, TP.HCM', paymentMethod: 'Thẻ tín dụng',
    items: [{ name: 'Cáp Lightning', image: 'https://via.placeholder.com/300x300?text=Lightning+Cable', price: 300000, quantity: 1 }]
  }
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Chờ lấy hàng', shipping: 'Đang giao',
  delivered: 'Đã giao', return: 'Trả hàng/Hoàn tiền', cancelled: 'Đã hủy'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Bạn vừa đặt hàng, shop chưa xác nhận đơn.',
  confirmed: 'Shop đã xác nhận và đang đóng gói, chờ đơn vị vận chuyển đến lấy.',
  shipping: 'Hàng đã được giao cho đơn vị vận chuyển và đang trên đường đến bạn.',
  delivered: 'Shipper giao thành công, bạn đã nhận được hàng.',
  return: 'Đơn đang được xử lý trả hàng hoặc hoàn tiền.',
  cancelled: 'Đơn đã bị hủy bởi bạn, shop hoặc hệ thống.'
}


const trackingLogs = [
  { id: 4, status: 'Đã giao hàng thành công', note: 'Người nhận: Tùng HT', time: '14:30 - 15/03/2024', isDone: true, isCurrent: true },
  { id: 3, status: 'Đang giao hàng', note: 'Shipper đang trên đường giao hàng cho bạn.', time: '09:15 - 15/03/2024', isDone: true, isCurrent: false },
  { id: 2, status: 'Đã đến kho trung chuyển', note: 'Đơn hàng đã đến kho Quận 7, TP.HCM', time: '22:00 - 14/03/2024', isDone: true, isCurrent: false },
  { id: 1, status: 'Đã lấy hàng', note: 'Đơn vị vận chuyển đã lấy hàng thành công', time: '15:00 - 14/03/2024', isDone: true, isCurrent: false },
  { id: 0, status: 'Đơn hàng đã đặt', note: 'SevenStore đã xác nhận đơn hàng', time: '14:30 - 14/03/2024', isDone: true, isCurrent: false },
]

function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const order = id ? mockOrderDetails[id] : null

  if (!order) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-8 text-center'>
        <p className='text-gray-500'>Không tìm thấy đơn hàng.</p>
        <button onClick={() => navigate('/profile/orders')} className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg'>Quay lại danh sách</button>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-6'>
        <button onClick={() => navigate('/profile/orders')} className='flex items-center gap-2 text-gray-600 hover:text-red-600 transition'>
          <ArrowLeft size={20} /> Quay lại
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>Chi tiết đơn hàng #{order.id}</h1>
      </div>

      {/* 1. Trạng thái đơn hàng & Mô tả  */}
      <div className='bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-bold'>Trạng thái đơn hàng</h2>
          <span className={`px-4 py-1 rounded-full text-sm font-bold ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {statusLabels[order.status]}
          </span>
        </div>
        <p className='text-gray-600 text-sm'>{statusDescriptions[order.status]}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* CỘT TRÁI: SẢN PHẨM & TRACKING */}
        <div className='lg:col-span-2 space-y-6'>
          
          {/* Tracking Timeline (TÍCH HỢP MỚI) */}
          <div className='bg-white rounded-3xl p-6 shadow-sm border border-gray-200'>
            <h3 className='font-bold text-gray-900 flex items-center gap-2 mb-6'>
              <Truck className='text-green-500' size={22} /> Hành trình đơn hàng
            </h3>
            <div className='relative pl-4 space-y-8'>
              <div className='absolute top-2 bottom-2 left-[23px] w-0.5 bg-gray-100 z-0' />
              {trackingLogs.map((log) => (
                <div key={log.id} className='relative z-10 flex gap-6 items-start'>
                  <div className={`mt-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${log.isCurrent ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'}`} />
                  <div>
                    <h4 className={`text-sm font-bold ${log.isCurrent ? 'text-green-600' : 'text-gray-800'}`}>{log.status}</h4>
                    <p className='text-[11px] text-gray-400 mt-0.5 font-medium'>{log.time}</p>
                    {log.note && <p className='text-xs text-gray-500 mt-1 leading-relaxed'>{log.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sản phẩm đã đặt (GIỮ NGUYÊN MOCK CỦA BẠN) */}
          <div className='bg-white rounded-3xl shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-bold mb-6 flex items-center gap-2'>
              <Store className='text-blue-500' size={22} /> Sản phẩm đã đặt
            </h2>
            <div className='space-y-4'>
              {order.items.map((item, index) => (
                <div key={index} className='flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                  <img src={item.image} alt={item.name} className='w-20 h-20 object-cover rounded-xl bg-white border' />
                  <div className='flex-1'>
                    <h3 className='font-bold text-gray-900'>{item.name}</h3>
                    <p className='text-sm text-gray-500 mt-1'>Số lượng: {item.quantity}</p>
                    <p className='font-bold text-red-600 mt-1'>{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TỔNG TIỀN & THÔNG TIN */}
        <div className='space-y-6'>
          <div className='bg-white rounded-3xl shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-bold mb-4 flex items-center gap-2'><ClipboardList className='text-orange-500' size={20} /> Thông tin đơn hàng</h2>
            <div className='space-y-4 text-sm'>
              <div><p className='text-gray-500'>Mã đơn hàng</p><p className='font-bold'>#{order.id}</p></div>
              <div><p className='text-gray-500'>Ngày đặt hàng</p><p className='font-bold'>{order.date}</p></div>
              <div><p className='text-gray-500'>Thanh toán</p><p className='font-bold text-blue-600'>{order.paymentMethod}</p></div>
            </div>
          </div>

          <div className='bg-white rounded-3xl shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-bold mb-4 flex items-center gap-2'><MapPin className='text-red-500' size={20} /> Địa chỉ giao hàng</h2>
            <p className='text-sm text-gray-600 leading-relaxed'>{order.shippingAddress}</p>
          </div>

          <div className='bg-white rounded-3xl shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-bold mb-4'>Tổng cộng</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'><span>Tạm tính</span><span className='font-bold'>{formatCurrency(order.total)}</span></div>
              <div className='flex justify-between'><span>Phí vận chuyển</span><span className='text-green-600 font-bold'>Miễn phí</span></div>
              <div className='border-t pt-4 mt-2 flex justify-between items-center font-bold text-lg'>
                <span>Tổng tiền</span><span className='text-red-600 text-xl font-black'>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Nút hành động (GIỮ NGUYÊN LOGIC CỦA BẠN) */}
          <div className='space-y-3'>
            {order.status === 'delivered' && (
              <button className='w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700'>Đánh giá sản phẩm</button>
            )}
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <button className='w-full py-4 border-2 border-red-600 text-red-600 rounded-2xl font-bold hover:bg-red-50'>Hủy đơn hàng</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail