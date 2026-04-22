import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { XCircle, Loader2 } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import Seo from '../components/Seo'

export default function VnpayReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'failed'>('loading')
  const [orderId, setOrderId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      // Lấy toàn bộ query params từ VNPAY redirect
      const responseCode = searchParams.get('vnp_ResponseCode')
      const txnRef = searchParams.get('vnp_TxnRef') // Đây là order_id

      if (txnRef) {
        setOrderId(txnRef)
      }

      try {
        // Gửi toàn bộ query string lên BE để xác thực chữ ký VNPAY
        const queryString = searchParams.toString()
        await fetchClient(`/payment/vnpay-return?${queryString}`)
      } catch {
        // BE trả lỗi không phải lỗi nghiêm trọng, tiếp tục dùng responseCode
      }

      // Dù BE có lỗi hay không, dựa vào responseCode để hiện UI
      if (responseCode === '00') {
        if (txnRef) {
          navigate(`/order-success/${txnRef}`, { replace: true })
          return
        }

        navigate('/profile/orders', { replace: true })
        return
      } else {
        setStatus('failed')
        const codeMessages: Record<string, string> = {
          '07': 'Giao dịch bị nghi ngờ gian lận.',
          '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ.',
          '10': 'Xác thực thông tin thẻ sai quá 3 lần.',
          '11': 'Giao dịch đã hết hạn thanh toán.',
          '12': 'Thẻ/Tài khoản bị khóa.',
          '13': 'Sai OTP. Vui lòng thử lại.',
          '24': 'Bạn đã hủy giao dịch.',
          '51': 'Tài khoản không đủ số dư.',
          '65': 'Vượt quá hạn mức giao dịch trong ngày.',
          '75': 'Ngân hàng đang bảo trì.',
          '79': 'Sai mật khẩu thanh toán quá số lần quy định.',
          '99': 'Lỗi không xác định.'
        }
        setErrorMessage(codeMessages[responseCode || '99'] || 'Giao dịch thất bại. Vui lòng thử lại.')
      }
    }

    verifyPayment()
  }, [navigate, searchParams])

  useEffect(() => {
    if (status !== 'failed') return

    const timer = setTimeout(() => {
      navigate('/profile/orders', { replace: true })
    }, 1000)

    return () => clearTimeout(timer)
  }, [navigate, status])

  if (status === 'loading') {
    return (
      <div className='min-h-[85vh] flex flex-col items-center justify-center gap-5'>
        <div className='w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center'>
          <Loader2 className='animate-spin text-blue-500' size={40} />
        </div>
        <p className='text-gray-600 font-semibold text-lg'>Đang xác minh giao dịch...</p>
        <p className='text-gray-400 text-sm'>Vui lòng không đóng trình duyệt</p>
      </div>
    )
  }

  // Failed
  return (
    <div className='min-h-[85vh] bg-gray-50 flex items-center justify-center py-10 px-4'>
      <Seo
        title='Thanh toán thất bại'
        description='Xác minh kết quả thanh toán VNPay tại 7Store.'
        keywords='VNPay, thanh toán, 7Store'
        canonicalPath='/payment/vnpay-return'
      />
      <div className='bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-xl w-full text-center relative overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-32 bg-linear-to-b from-red-50 to-white' />

        <div className='relative z-10'>
          <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner'>
            <XCircle className='text-red-500' size={56} />
          </div>

          <h1 className='text-3xl font-black text-gray-900 mb-2'>Thanh toán thất bại</h1>
          <p className='text-gray-500 mb-8 text-base'>{errorMessage}</p>

          <div className='bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100'>
            <div className='flex items-center justify-between border-b border-gray-200 pb-3 mb-3'>
              <span className='text-gray-500 font-medium'>Mã đơn hàng</span>
              <span className='font-bold text-gray-900 text-lg'>{orderId ? `#${orderId}` : 'Không xác định'}</span>
            </div>
            <div className='flex items-center justify-between border-b border-gray-200 pb-3 mb-3'>
              <span className='text-gray-500 font-medium'>Phương thức</span>
              <span className='font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded'>VNPay</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-500 font-medium'>Trạng thái</span>
              <span className='font-bold text-red-600'>Thất bại / Đã hủy</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-500 font-medium'>Thanh toán lại...</span>
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
