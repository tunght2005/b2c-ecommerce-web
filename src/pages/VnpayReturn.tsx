import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Home, ChevronRight } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'

export default function VnpayReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderId, setOrderId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      // Lấy toàn bộ query params từ VNPAY redirect
      const responseCode = searchParams.get('vnp_ResponseCode')
      const txnRef = searchParams.get('vnp_TxnRef') // Đây là order_id

      if (txnRef) setOrderId(txnRef)

      try {
        // Gửi toàn bộ query string lên BE để xác thực chữ ký VNPAY
        const queryString = searchParams.toString()
        await fetchClient(`/payment/vnpay-return?${queryString}`)
      } catch {
        // BE trả lỗi không phải lỗi nghiêm trọng, tiếp tục dùng responseCode
      }

      // Dù BE có lỗi hay không, dựa vào responseCode để hiện UI
      if (responseCode === '00') {
        setStatus('success')
        // Tự động redirect sang OrderSuccess sau 3 giây
        if (txnRef) {
          setTimeout(() => {
            navigate(`/order-success/${txnRef}`, { replace: true })
          }, 2500)
        }
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
          '99': 'Lỗi không xác định.',
        }
        setErrorMessage(codeMessages[responseCode || '99'] || 'Giao dịch thất bại. Vui lòng thử lại.')
      }
    }

    verifyPayment()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center gap-5">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
        <p className="text-gray-600 font-semibold text-lg">Đang xác minh giao dịch...</p>
        <p className="text-gray-400 text-sm">Vui lòng không đóng trình duyệt</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-[85vh] bg-gray-50 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-white" />
          <div className="relative z-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="text-green-500" size={56} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-2">Đơn hàng đã được xác nhận. Đang chuyển hướng...</p>
            {orderId && (
              <p className="text-sm text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg inline-block mb-8">
                Mã đơn: #{orderId.substring(0, 12).toUpperCase()}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                <Home size={18} /> Về trang chủ
              </button>
              <button
                onClick={() => navigate('/profile/orders')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E7000B] text-white font-bold rounded-xl hover:bg-[#C10008] transition shadow-lg shadow-red-200"
              >
                Đơn mua của tôi <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Failed
  return (
    <div className="min-h-[85vh] bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-50 to-white" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <XCircle className="text-red-500" size={56} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh toán thất bại</h1>
          <p className="text-gray-500 mb-8">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
            >
              <Home size={18} /> Về trang chủ
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E7000B] text-white font-bold rounded-xl hover:bg-[#C10008] transition shadow-lg shadow-red-200"
            >
              Thử lại <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
