function UsedProductSection() {
  return (
    <section className='max-w-7xl mx-auto px-4 mt-12'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-3xl font-bold text-gray-800'>Hàng Cũ Giá Tốt</h2>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className='bg-white rounded-3xl p-4 shadow-md border border-gray-200'>
            Nội dung hàng cũ
          </div>
        ))}
      </div>
    </section>
  )
}

export default UsedProductSection