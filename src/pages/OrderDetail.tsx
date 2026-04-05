import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

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

// Mock detailed order data
const mockOrderDetails: Record<string, OrderDetail> = {
  ORD001: {
    id: 'ORD001',
    status: 'pending',
    date: '2024-01-15',
    total: 15000000,
    shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
    paymentMethod: 'Thanh toán khi nhận hàng',
    items: [
      {
        name: 'iPhone 15 Pro Max',
        image: 'https://via.placeholder.com/300x300?text=iPhone+15',
        price: 32990000,
        quantity: 1
      },
      {
        name: 'AirPods Pro',
        image: 'https://via.placeholder.com/300x300?text=AirPods+Pro',
        price: 5990000,
        quantity: 1
      }
    ]
  },
  ORD002: {
    id: 'ORD002',
    status: 'confirmed',
    date: '2024-01-14',
    total: 25000000,
    shippingAddress: '456 Đường XYZ, Quận 2, TP.HCM',
    paymentMethod: 'Ví điện tử',
    items: [
      {
        name: 'MacBook Air M3',
        image: 'https://via.placeholder.com/300x300?text=MacBook+M3',
        price: 27490000,
        quantity: 1
      }
    ]
  },
  ORD003: {
    id: 'ORD003',
    status: 'shipping',
    date: '2024-01-13',
    total: 8000000,
    shippingAddress: '789 Đường DEF, Quận 3, TP.HCM',
    paymentMethod: 'Thẻ tín dụng',
    items: [
      {
        name: 'Samsung Galaxy S25 Ultra',
        image: 'https://via.placeholder.com/300x300?text=Samsung+S25',
        price: 28990000,
        quantity: 1
      }
    ]
  },
  ORD004: {
    id: 'ORD004',
    status: 'delivered',
    date: '2024-01-12',
    total: 12000000,
    shippingAddress: '321 Đường GHI, Quận 4, TP.HCM',
    paymentMethod: 'Thanh toán khi nhận hàng',
    items: [
      {
        name: 'Apple Watch Series 9',
        image: 'https://via.placeholder.com/300x300?text=Watch+Series+9',
        price: 9990000,
        quantity: 1
      }
    ]
  },
  ORD005: {
    id: 'ORD005',
    status: 'return',
    date: '2024-01-11',
    total: 5000000,
    shippingAddress: '654 Đường JKL, Quận 5, TP.HCM',
    paymentMethod: 'Ví điện tử',
    items: [
      {
        name: 'Tai nghe Sony',
        image: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
        price: 5000000,
        quantity: 1
      }
    ]
  },
  ORD006: {
    id: 'ORD006',
    status: 'cancelled',
    date: '2024-01-10',
    total: 3000000,
    shippingAddress: '987 Đường MNO, Quận 6, TP.HCM',
    paymentMethod: 'Thẻ tín dụng',
    items: [
      {
        name: 'Cáp Lightning',
        image: 'https://via.placeholder.com/300x300?text=Lightning+Cable',
        price: 300000,
        quantity: 1
      }
    ]
  }
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Chờ lấy hàng',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  return: 'Trả hàng/Hoàn tiền',
  cancelled: 'Đã hủy'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Bạn vừa đặt hàng, shop chưa xác nhận đơn.',
  confirmed: 'Shop đã xác nhận và đang đóng gói, chờ đơn vị vận chuyển đến lấy.',
  shipping: 'Hàng đã được giao cho đơn vị vận chuyển và đang trên đường đến bạn.',
  delivered: 'Shipper giao thành công, bạn đã nhận được hàng.',
  return: 'Đơn đang được xử lý trả hàng hoặc hoàn tiền.',
  cancelled: 'Đơn đã bị hủy bởi bạn, shop hoặc hệ thống.'
}

function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const order = id ? mockOrderDetails[id] : null

  if (!order) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='text-center py-12'>
          <p className='text-gray-500'>Không tìm thấy đơn hàng.</p>
          <button
            onClick={() => navigate('/orders')}
            className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-6'>
        <button
          onClick={() => navigate('/orders')}
          className='flex items-center gap-2 text-gray-600 hover:text-red-600 transition'
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1 className='text-2xl font-bold text-gray-900'>Chi tiết đơn hàng #{order.id}</h1>
      </div>

      {/* Order Status */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>Trạng thái đơn hàng</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            order.status === 'return' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {statusLabels[order.status]}
          </span>
        </div>
        <p className='text-gray-600'>{statusDescriptions[order.status]}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Order Items */}
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold mb-4'>Sản phẩm đã đặt</h2>
            <div className='space-y-4'>
              {order.items.map((item, index) => (
                <div key={index} className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                  <img src={item.image} alt={item.name} className='w-16 h-16 object-cover rounded-lg' />
                  <div className='flex-1'>
                    <h3 className='font-medium text-gray-900'>{item.name}</h3>
                    <p className='text-sm text-gray-600'>Số lượng: {item.quantity}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-red-600'>{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className='space-y-6'>
          {/* Order Info */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold mb-4'>Thông tin đơn hàng</h2>
            <div className='space-y-3'>
              <div>
                <p className='text-sm text-gray-600'>Mã đơn hàng</p>
                <p className='font-medium'>#{order.id}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Ngày đặt hàng</p>
                <p className='font-medium'>{order.date}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Phương thức thanh toán</p>
                <p className='font-medium'>{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold mb-4'>Địa chỉ giao hàng</h2>
            <p className='text-gray-700'>{order.shippingAddress}</p>
          </div>

          {/* Total */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold mb-4'>Tổng tiền</h2>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Tạm tính</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className='border-t pt-2 flex justify-between font-semibold text-lg'>
                <span>Tổng cộng</span>
                <span className='text-red-600'>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='space-y-3'>
              {order.status === 'delivered' && (
                <button className='w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'>
                  Đánh giá sản phẩm
                </button>
              )}
              {order.status === 'pending' || order.status === 'confirmed' && (
                  <button className='w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition'>
                    Hủy đơn hàng
                  </button>
                )}
              {order.status === 'shipping' && (
                <button className='w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition'>
                  Theo dõi đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
