import { useParams } from 'react-router-dom'

export default function CategoryPage() {
  const { name } = useParams()

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>
        Danh mục: {name}
      </h1>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='bg-white p-4 shadow rounded-xl'>
            Sản phẩm {i}
          </div>
        ))}
      </div>
    </div>
  )
}