import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface OrderItem {
  name: string
  image: string
}

interface Order {
  id: string
  status: string
  date: string
  total: number
  items: OrderItem[]
}

// Order statuses for backend reference:
// - pending: Chờ xác nhận - bạn vừa đặt hàng, shop chưa xác nhận đơn
// - confirmed: Chờ lấy hàng - shop đã xác nhận và đang đóng gói, chờ đơn vị vận chuyển đến lấy
// - shipping: Đang giao - hàng đã được giao cho đơn vị vận chuyển và đang trên đường đến bạn
// - delivered: Đã giao - shipper giao thành công, bạn đã nhận được hàng
// - return: Trả hàng/Hoàn tiền - đơn đang được xử lý trả hàng hoặc hoàn tiền
// - cancelled: Đã hủy - đơn đã bị hủy bởi bạn, shop hoặc hệ thống
// Additional: completed (Hoàn thành), waiting_return (Chờ người mua trả hàng)

const orderStatuses = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Chờ lấy hàng' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'return', label: 'Trả hàng/Hoàn tiền' },
  { key: 'cancelled', label: 'Đã hủy' }
]

// Mock data - thay thế bằng API call sau
const mockOrders: Order[] = [
  {
    id: 'ORD001',
    status: 'pending',
    date: '2024-01-15',
    total: 15000000,
    items: [
      { name: 'iPhone 15 Pro Max', image: 'https://via.placeholder.com/300x300?text=iPhone+15' },
      { name: 'AirPods Pro', image: 'https://via.placeholder.com/300x300?text=AirPods+Pro' }
    ]
  },
  {
    id: 'ORD002',
    status: 'confirmed',
    date: '2024-01-14',
    total: 25000000,
    items: [{ name: 'MacBook Air M3', image: 'https://via.placeholder.com/300x300?text=MacBook+M3' }]
  },
  {
    id: 'ORD003',
    status: 'shipping',
    date: '2024-01-13',
    total: 8000000,
    items: [{ name: 'Samsung Galaxy S25 Ultra', image: 'https://via.placeholder.com/300x300?text=Samsung+S25' }]
  },
  {
    id: 'ORD004',
    status: 'delivered',
    date: '2024-01-12',
    total: 12000000,
    items: [{ name: 'Apple Watch Series 9', image: 'https://via.placeholder.com/300x300?text=Watch+Series+9' }]
  },
  {
    id: 'ORD005',
    status: 'return',
    date: '2024-01-11',
    total: 5000000,
    items: [{ name: 'Tai nghe Sony', image: 'https://via.placeholder.com/300x300?text=Sony+Headphones' }]
  },
  {
    id: 'ORD006',
    status: 'cancelled',
    date: '2024-01-10',
    total: 3000000,
    items: [{ name: 'Cáp Lightning', image: 'https://via.placeholder.com/300x300?text=Lightning+Cable' }]
  }
]

function Orders() {
  const [activeTab, setActiveTab] = useState('all')
  const navigate = useNavigate()

  const filteredOrders = activeTab === 'all' ? mockOrders : mockOrders.filter((order) => order.status === activeTab)

  const getStatusLabel = (status: string) => {
    const statusObj = orderStatuses.find((s) => s.key === status)
    return statusObj ? statusObj.label : status
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>Đơn mua</h1>

      {/* Tabs */}
      <div className='flex flex-wrap gap-2 mb-6 border-b border-gray-200'>
        {orderStatuses.map((status) => (
          <button
            key={status.key}
            onClick={() => setActiveTab(status.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === status.key
                ? 'bg-red-600 text-white border-b-2 border-red-600'
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className='space-y-4'>
        {filteredOrders.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500'>Không có đơn hàng nào.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='font-semibold text-lg'>Đơn hàng #{order.id}</h3>
                  <p className='text-sm text-gray-600'>Ngày đặt: {order.date}</p>
                </div>
                <div className='text-right'>
                  <p className='font-semibold text-red-600'>{formatCurrency(order.total)}</p>
                  <p className='text-sm text-gray-600'>{getStatusLabel(order.status)}</p>
                </div>
              </div>

              <div className='mb-4'>
                <p className='text-sm text-gray-700 mb-2'>Sản phẩm:</p>
                <div className='flex flex-wrap gap-4'>
                  {order.items.map((item, index) => (
                    <div key={index} className='flex items-center gap-3 bg-gray-50 rounded-lg p-3'>
                      <img src={item.image} alt={item.name} className='w-12 h-12 object-cover rounded-lg' />
                      <span className='text-sm text-gray-800'>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className='px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition'
                >
                  Xem chi tiết
                </button>
                {order.status === 'delivered' && (
                  <button className='px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition'>
                    Đánh giá
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders
