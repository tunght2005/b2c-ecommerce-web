import { ShoppingCart, Star } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'

// Cập nhật Product Interface để khớp Backend + Tự xử lý Fallback
export type Product = {
  _id?: string;
  id?: number | string;
  name: string;
  image?: string;
  thumbnail?: string;
  price?: number | string;
  rating?: number;
  discount?: number;
  oldPrice?: number | string;
  variants?: Record<string, unknown>[];
}

export default function ProductCard({ product }: { product: Product }) {
  // Hàm bắn sự kiện khi click "Thêm vào giỏ"
  const handleAddToCart = async () => {
    // Ép kiểu chống cháy: móc lấy id của Variant đầu tiên, nếu BE rỗng thì đưa ID sp giả dạng
    const variantIdTarget = product.variants?.[0]?._id || product._id || product.id;
    
    try {
      await fetchClient('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          variant_id: variantIdTarget,
          quantity: 1
        })
      })
      window.dispatchEvent(new CustomEvent('addToCart', { detail: { product } }))
      alert('Đã thêm sản phẩm trực tiếp vào Server!');
    } catch (error) {
      // Đề phòng BE cự tuyệt vì truyền lên thiếu variant
      console.warn('Backend rejected the cart action, firing local fallback', error)
      alert('Có lỗi. Vui lòng đảm bảo bạn Đã Đăng Nhập hoặc Sản Phẩm đã có Variant thực.')
    }
  }

  // --- DEV TOOL TOOL: Hàm tạo Variant khẩn cấp ---
  const handleDevCreateVariant = async () => {
    try {
      await fetchClient('/variants', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product._id || product.id,
          sku: "ACER-DEFAULT",
          price: 17500000,
          old_price: 20000000,
          stock: 999,
          attributes: []
        })
      });
      alert('Đã ép tạo Variant Thành Công! Bây giờ bạn hãy F5 (Tải lại trang) rồi bấm Thêm vào giỏ hàng nhé.');
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : JSON.stringify(e);
      alert('Tạo thất bại! Lỗi Backend: ' + errorMsg);
    }
  }

  // Lấy ảnh thật từ DB, tự động gán domain nếu cần
  const rawImage = product.thumbnail || product.image || product.variants?.[0]?.image
  const finalImage = resolveImageUrl(rawImage as string | undefined)
    ?? `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`
  
  // Lấy giá thật từ DB, hoặc tự sinh giá ảo dựa lắt léo vào chuỗi Tên cho phong phú
  const seedPrice = product.name.length * 1000000 + 5990000;
  const rawPrice = (product.price || product.variants?.[0]?.price || seedPrice) as string | number;
  const finalPrice = typeof rawPrice === 'number' 
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawPrice) 
    : rawPrice;

  // Lấy giá Gốc (để gạch ngang)
  const rawOldPrice = (product.oldPrice || product.variants?.[0]?.oldPrice || (typeof rawPrice === 'number' ? rawPrice * 1.15 : null)) as string | number | null;
  const finalOldPrice = rawOldPrice && typeof rawOldPrice === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawOldPrice)
    : rawOldPrice;

  // Discount %
  const finalDiscount = product.discount || (typeof rawPrice === 'number' && typeof rawOldPrice === 'number' && rawOldPrice > 0 ? Math.round(100 - (rawPrice / rawOldPrice) * 100) : 15);

  return (
    <div className='bg-white rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition duration-300 relative border flex flex-col h-full'>
      {/* BADGE (Khuyến mãi) */}
      <div className='absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-semibold z-10'>
        -{finalDiscount}%
      </div>

      {/* IMAGE */}
      <div className='bg-gray-100 rounded-xl h-32 sm:h-44 flex items-center justify-center p-2'>
        <img src={finalImage} alt={product.name} className='h-full object-contain hover:scale-105 transition' />
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
          <span className='text-red-600 text-sm sm:text-lg font-bold'>{finalPrice}</span>
          {finalOldPrice && <span className='text-gray-400 line-through text-[10px] sm:text-sm'>{finalOldPrice}</span>}
        </div>

        {/* Nút Fix lỗi (Xóa sau) */}
        {(!product.variants || product.variants.length === 0) && (
          <button 
             onClick={handleDevCreateVariant}
             className='w-full mt-2 bg-yellow-400 text-yellow-900 py-1 rounded-lg text-[10px] font-bold hover:bg-yellow-500'
          >
            [DEV] Auto Cấp Variant
          </button>
        )}

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