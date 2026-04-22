import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchClient } from '../api/fetchClient'
import Seo from '../components/Seo'

interface OrderSummary {
  _id: string
  final_price: number
}

export default function OrderSuccess() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [orderAmount, setOrderAmount] = useState<number | null>(null)

  useEffect(() => {
    const fetchOrderAmount = async () => {
      if (!id) return

      try {
        const res = await fetchClient<{ data?: OrderSummary[] } | OrderSummary[]>('/order')
        const orders = Array.isArray(res) ? res : (res?.data ?? [])
        const matched = orders.find((order) => order._id === id)

        if (matched?.final_price != null) {
          setOrderAmount(Number(matched.final_price))
        }
      } catch (error) {
        console.error('Không thể lấy đơn giá đơn hàng thành công:', error)
      }
    }

    fetchOrderAmount()
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/profile/orders', { replace: true })
    }, 1500)

    return () => clearTimeout(timer)
  }, [navigate])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatOrderCode = (orderId?: string) => {
    if (!orderId) return 'SS-UNKNOWN'
    return `SS-${orderId.slice(-8).toUpperCase()}`
  }

  return (
    <div className='min-h-[85vh] bg-gray-50 flex items-center justify-center py-10 px-4'>
      <Seo
        title='Đặt hàng thành công'
        description='Đơn hàng đã được ghi nhận thành công tại 7Store. Kiểm tra chi tiết thanh toán và trạng thái đơn hàng.'
        keywords='đặt hàng thành công, 7Store, thanh toán'
        canonicalPath={`/order-success/${id || ''}`}
      />
      <div className='bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-xl w-full text-center relative overflow-hidden'>
        {/* Background decorations */}
        <div className='absolute top-0 left-0 w-full h-32 bg-linear-to-b from-green-50 to-white'></div>

        <div className='relative z-10'>
          <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner'>
            <CheckCircle2 className='text-green-500' size={56} />
          </div>

          <h1 className='text-3xl font-black text-gray-900 mb-2 mt-2'>Đặt hàng thành công!</h1>
          <p className='text-gray-500 mb-8 text-base'>
            Cảm ơn bạn đã mua sắm tại <b className='text-red-600 text-xl'>7Store</b>Chúng tôi sẽ sớm liên hệ để xác nhận
            đơn hàng.
          </p>

          <div className='bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100'>
            <div className='flex items-center justify-between border-b border-gray-200 pb-3 mb-3'>
              <span className='text-gray-500 font-medium'>Mã đơn hàng</span>
              <span className='font-bold text-gray-900 text-lg'>{formatOrderCode(id)}</span>
            </div>
            <div className='flex items-center justify-between border-b border-gray-200 pb-3 mb-3'>
              <span className='text-gray-500 font-medium'>Phương thức</span>
              <span className='font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded'>VNPay</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-500 font-medium'>Tổng thanh toán</span>
              <span className='font-bold text-[#E7000B] text-xl'>
                {orderAmount != null ? formatCurrency(orderAmount) : 'Đang cập nhật...'}
              </span>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <p className='text-gray-600 font-semibold text-lg'>Đang về...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
