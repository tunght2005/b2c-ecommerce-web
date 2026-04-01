import { ShoppingCart, Star } from 'lucide-react'

type Product = {
  name: string
  image: string
  price: number | string
  rating?: number
  discount?: number
  oldPrice?: number | string
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className='bg-white rounded-2xl p-4 shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 relative border'>

      {/* BADGE */}
      <div className='absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold'>
        -{product.discount ?? 10}%
      </div>

      {/* IMAGE */}
      <div className='bg-gray-100 rounded-xl h-44 flex items-center justify-center'>
        <img
          src={product.image}
          alt={product.name}
          className='h-36 object-contain hover:scale-105 transition'
        />
      </div>

      {/* CONTENT */}
      <div className='mt-4'>

        {/* NAME */}
        <h3 className='text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]'>
          {product.name}
        </h3>

        {/* RATING */}
        <div className='flex items-center gap-1 mt-1 text-yellow-400 text-sm'>
          <Star size={14} fill='currentColor' />
          <span className='text-gray-600 text-xs'>
            {product.rating ?? 4.5}
          </span>
        </div>

        {/* PRICE */}
        <div className='mt-2 flex items-center gap-2 flex-wrap'>
          <span className='text-red-600 text-lg font-bold'>
            {product.price}
          </span>

          {product.oldPrice && (
            <span className='text-gray-400 line-through text-sm'>
              {product.oldPrice}
            </span>
          )}
        </div>

        {/* BUTTON */}
        <button className='mt-4 w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl font-semibold hover:bg-red-600 transition'>
          <ShoppingCart size={16} />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  )
}