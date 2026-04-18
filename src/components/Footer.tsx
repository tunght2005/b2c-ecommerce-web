export default function Footer() {
  return (
    <footer className='bg-gray-900 text-white mt-12 py-10'>
      {/* Chuyển từ grid-cols-3 cố định sang cấu trúc Responsive */}
      <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12'>
        {/* Cột 1 */}
        <div className='text-center sm:text-left'>
          <h3 className='text-2xl font-bold text-[#E7000B]'>SevenStore</h3>
          <p className='text-gray-400 mt-3 text-sm sm:text-base leading-relaxed'>
            Hệ thống bán lẻ đồ công nghệ, điện thoại, laptop chính hãng uy tín hàng đầu.
          </p>
        </div>

        {/* Cột 2 */}
        <div className='text-center sm:text-left'>
          <h3 className='font-bold mb-4 text-lg'>Danh mục sản phẩm</h3>
          <div className='space-y-3'>
            <p className='text-gray-400 hover:text-white cursor-pointer transition'>Điện thoại di động</p>
            <p className='text-gray-400 hover:text-white cursor-pointer transition'>Laptop & MacBook</p>
            <p className='text-gray-400 hover:text-white cursor-pointer transition'>Tablet & iPad</p>
            <p className='text-gray-400 hover:text-white cursor-pointer transition'>Phụ kiện công nghệ</p>
          </div>
        </div>

        {/* Cột 3 */}
        <div className='text-center sm:text-left'>
          <h3 className='font-bold mb-4 text-lg'>Liên hệ & Hỗ trợ</h3>
          <div className='space-y-3 text-gray-400'>
            <p>
              Tổng đài: <span className='text-white font-semibold'>1900 1234</span>
            </p>
            <p>
              Email: <span className='hover:text-white cursor-pointer transition'>support@sevenstore.vn</span>
            </p>
            <p>Địa chỉ: Khu Công Nghệ Cao, TP. Thủ Đức, TP. HCM</p>
          </div>
        </div>
      </div>

      {/* Dòng Copyright phía dưới */}
      <div className='max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm'>
        <p>© 2026 SevenStore. All rights reserved.</p>
      </div>
    </footer>
  )
}
