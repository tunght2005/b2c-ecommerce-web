import { ShieldCheck, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

export default function ReturnPolicy() {
  return (
    <div className='bg-gray-50 min-h-screen py-8 sm:py-12'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100'>
          <div className='flex items-center gap-4 mb-8'>
            <div className='bg-red-50 p-3 rounded-2xl'>
              <FileText className='text-red-600' size={32} />
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Chính sách đổi trả & Hoàn tiền</h1>
          </div>

          <div className='space-y-8'>
            <section>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-4 text-gray-800'>
                <Clock className='text-blue-500' size={20} />
                1. Thời gian áp dụng
              </h2>
              <p className='text-gray-600 leading-relaxed ml-7'>
                Khách hàng có thể yêu cầu đổi trả sản phẩm trong vòng <strong>30 ngày</strong> kể từ ngày nhận hàng thành công (đối với các lỗi từ nhà sản xuất).
              </p>
            </section>

            <section>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-4 text-gray-800'>
                <CheckCircle2 className='text-green-500' size={20} />
                2. Điều kiện đổi trả
              </h2>
              <ul className='space-y-3 ml-7 text-gray-600'>
                <li className='flex gap-2'>• Sản phẩm còn nguyên tem, mác, hộp và đầy đủ phụ kiện đi kèm.</li>
                <li className='flex gap-2'>• Sản phẩm không có dấu hiệu trầy xước, móp méo do tác động ngoại lực từ phía người dùng.</li>
                <li className='flex gap-2'>• Có hóa đơn mua hàng hoặc thông tin đơn hàng trên hệ thống SevenStore.</li>
              </ul>
            </section>

            <section className='bg-red-50 p-5 rounded-2xl border border-red-100'>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-3 text-red-700'>
                <AlertCircle size={20} />
                Lưu ý quan trọng
              </h2>
              <p className='text-sm text-red-600 leading-relaxed'>
                Các sản phẩm thuộc danh mục quà tặng kèm, phụ kiện tiêu hao (như miếng dán màn hình) sẽ không áp dụng chính sách hoàn trả trừ khi có lỗi kỹ thuật ngay khi mở hộp.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}