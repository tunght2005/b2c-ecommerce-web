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
  // Hàm bắn sự kiện khi click "Thêm vào giỏ"
  const handleAddToCart = () => {
    window.dispatchEvent(new CustomEvent('addToCart'))
  }

  return (
    <div className='bg-white rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition duration-300 relative border flex flex-col h-full'>
      {/* BADGE (Khuyến mãi) */}
      <div className='absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-semibold z-10'>
        -{product.discount ?? 10}%
      </div>

      {/* IMAGE */}
      <div className='bg-gray-100 rounded-xl h-32 sm:h-44 flex items-center justify-center p-2'>
        <img src={product.image} alt={product.name} className='h-full object-contain hover:scale-105 transition' />
      </div>

      {/* CONTENT */}
      <div className='mt-3 sm:mt-4 flex flex-col flex-1'>
        {/* NAME */}
        <h3 className='text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 min-h-[32px] sm:min-h-[40px]'>
          {product.name}
        </h3>

        {/* RATING */}
        <div className='flex items-center gap-1 mt-1 text-yellow-400 text-sm'>
          <Star size={12} className="sm:w-[14px] sm:h-[14px]" fill='currentColor' />
          <span className='text-gray-600 text-[10px] sm:text-xs'>{product.rating ?? 4.5}</span>
        </div>

        {/* PRICE */}
        <div className='mt-2 flex items-baseline gap-1.5 sm:gap-2 flex-wrap'>
          <span className='text-red-600 text-sm sm:text-lg font-bold'>{product.price}</span>
          {product.oldPrice && <span className='text-gray-400 line-through text-[10px] sm:text-sm'>{product.oldPrice}</span>}
        </div>

        {/* BUTTON - Đẩy xuống đáy bằng mt-auto */}
        <button 
          onClick={handleAddToCart}
          className='mt-auto pt-2 sm:pt-3 w-full flex items-center justify-center gap-1 sm:gap-2 bg-red-500 text-white py-2 rounded-lg sm:rounded-xl font-semibold hover:bg-red-600 transition text-xs sm:text-base'
        >
          <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Thêm vào giỏ</span>
          <span className="sm:hidden">Mua ngay</span> {/* Điện thoại chỉ hiện chữ Mua ngay cho ngắn */}
        </button>
      </div>
    </div>
  )
}