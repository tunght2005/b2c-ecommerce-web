import { products } from '../data/products'

type Product = {
  id: number | string
  name: string
  image: string
  price: number | string
  oldPrice?: number | string
}

type Props = {
  title: string
  banner: string
}

export default function CategorySection({ title, banner }: Props) {
  return (
    <section className='max-w-7xl mx-auto px-4 mt-10'>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-5'>
        {/* Banner trái */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-3xl overflow-hidden shadow-md h-full border border-gray-200'>
            <img src={banner} alt='banner' className='w-full h-full min-h-[500px] object-contain p-4 bg-white' />
          </div>
        </div>

        {/* Product phải */}
        <div className='lg:col-span-4 bg-white rounded-3xl shadow-md p-5'>
          <div className='flex items-center border-b pb-4 mb-4 font-semibold'>
            <span className='text-gray-700'>{title}</span>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
            {products.map((product: Product) => (
              <div key={product.id} className='border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition'>
                <img src={product.image} alt={product.name} className='w-full h-40 object-contain mb-4' />

                <h3 className='font-semibold text-sm min-h-[40px]'>{product.name}</h3>

                <div className='mt-3'>
                  <p className='text-red-600 text-xl font-bold'>{product.price}</p>

                  {product.oldPrice && <p className='text-gray-400 line-through text-sm'>{product.oldPrice}</p>}
                </div>

                <button className='mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition'>
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
