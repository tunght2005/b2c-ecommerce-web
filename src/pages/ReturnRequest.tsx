import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, AlertCircle, ChevronLeft, Send } from 'lucide-react'

export default function ReturnRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reason, setReason] = useState('')

  const reasons = [
    'Sản phẩm bị lỗi kỹ thuật',
    'Giao sai sản phẩm/màu sắc',
    'Sản phẩm bị hư hỏng do vận chuyển',
    'Sản phẩm không giống mô tả',
    'Lý do khác'
  ]

  return (
    <div className='bg-gray-50 min-h-screen py-6 sm:py-10'>
      <div className='max-w-2xl mx-auto px-4'>
        <button onClick={() => navigate(-1)} className='flex items-center gap-2 text-gray-500 hover:text-red-600 mb-6 transition'>
          <ChevronLeft size={20} /> Quay lại đơn hàng
        </button>

        <div className='bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100'>
          <h1 className='text-xl sm:text-2xl font-bold mb-2'>Yêu cầu trả hàng</h1>
          <p className='text-gray-500 text-sm mb-8'>Mã đơn hàng: #{id}</p>

          <form className='space-y-6'>
            <div>
              <label className='block font-semibold mb-3'>Lý do trả hàng</label>
              <div className='grid gap-3'>
                {reasons.map((r) => (
                  <button
                    key={r}
                    type='button'
                    onClick={() => setReason(r)}
                    className={`text-left px-4 py-3 rounded-2xl border text-sm transition ${
                      reason === r ? 'border-red-500 bg-red-50 text-red-600 font-medium' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block font-semibold mb-3'>Mô tả chi tiết (không bắt buộc)</label>
              <textarea 
                placeholder='Vui lòng mô tả rõ hơn về tình trạng sản phẩm...'
                className='w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none min-h-[120px]'
              />
            </div>

            <div>
              <label className='block font-semibold mb-3'>Hình ảnh minh chứng</label>
              <div className='grid grid-cols-3 gap-3'>
                <button type='button' className='aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 hover:border-red-300 hover:text-red-500 transition'>
                  <Camera size={24} />
                  <span className='text-[10px] font-medium'>Thêm ảnh</span>
                </button>
              </div>
              <p className='text-[11px] text-gray-400 mt-2 flex items-center gap-1'>
                <AlertCircle size={12} /> Tối đa 3 hình ảnh rõ nét
              </p>
            </div>

            <button
              type='submit'
              className='w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-200 mt-8'
            >
              <Send size={20} />
              Gửi yêu cầu
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}