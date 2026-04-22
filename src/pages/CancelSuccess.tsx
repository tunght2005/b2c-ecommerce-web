import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

export default function CancelSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/orders/${id}`, { replace: true })
    }, 1500)

    return () => clearTimeout(timer)
  }, [id, navigate])

  return (
    <div className='bg-gray-50 min-h-screen flex flex-col'>
      {/* Header Mobile-friendly */}
      <div className='bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0'>
        <button onClick={() => navigate('/orders')} className='text-gray-600 p-1'>
          <ChevronLeft size={24} />
        </button>
        <h1 className='text-lg font-bold text-gray-900'>Chi tiết hủy đơn</h1>
      </div>

      {/* Nội dung chính */}
      <div className='flex-1 flex flex-col items-center justify-center p-6 mt-10'>
        <div className='bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-6'>
          <CheckCircle2 size={50} className='text-green-500' />
        </div>

        <h2 className='text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3'>
          Yêu cầu hủy đơn hàng đã được gửi
        </h2>

        <p className='text-gray-500 text-center max-w-sm mb-8 text-sm sm:text-base leading-relaxed'>
          <b className='text-red-600 text-xl'>7Store</b> đang xử lý yêu cầu hủy đơn hàng #{id} của bạn. <br /> Nếu bạn
          đã thanh toán trước, hệ thống sẽ tự động hoàn tiền trong vòng 1-3 ngày làm việc.
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <p className='text-gray-600 font-semibold text-lg'>Đang về...</p>
        </div>
      </div>
    </div>
  )
}
