export default function Footer() {
  return (
    <footer className='bg-gray-900 text-white mt-12 py-10'>
      <div className='max-w-7xl mx-auto px-4 grid grid-cols-3 gap-8'>
        <div>
          <h3 className='text-2xl font-bold'>SevenStore</h3>
          <p className='text-gray-400 mt-2'>
            Website bán đồ công nghệ
          </p>
        </div>

        <div>
          <h3 className='font-bold mb-2'>Danh mục</h3>
          <p className='text-gray-400'>Điện thoại</p>
          <p className='text-gray-400'>Laptop</p>
        </div>

        <div>
          <h3 className='font-bold mb-2'>Liên hệ</h3>
          <p className='text-gray-400'>support@sevenstore.vn</p>
        </div>
      </div>
    </footer>
  )
}