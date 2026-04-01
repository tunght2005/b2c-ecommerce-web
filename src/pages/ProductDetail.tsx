import { useParams } from 'react-router-dom'

export default function ProductDetail() {
  const { id } = useParams()

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>
        Chi tiết sản phẩm #{id}
      </h1>

      <div className='grid md:grid-cols-2 gap-6'>
        <img
          src='https://via.placeholder.com/400'
          className='w-full rounded-xl'
        />

        <div>
          <h2 className='text-xl font-bold'>Tên sản phẩm</h2>
          <p className='text-red-500 text-2xl mt-2'>25.990.000đ</p>

          <button className='mt-4 bg-red-500 text-white px-6 py-3 rounded-xl'>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  )
}