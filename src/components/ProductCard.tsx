import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { resolveImageUrl } from '../api/config'
import WishlistButton from './WishlistButton'

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

import { fetchClient } from '../api/fetchClient'

// Cache chống gọi API 50 lần khi render 50 Card cùng lúc
let promoPromise: Promise<any> | null = null;
let globalPromo: any = null;

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [promo, setPromo] = useState<any>(globalPromo);

  useEffect(() => {
    if (globalPromo) {
      setPromo(globalPromo);
      return;
    }
    if (!promoPromise) {
      promoPromise = fetchClient('/promotions').then((res: any) => {
        const data = res?.data || res;
        if (Array.isArray(data)) {
          globalPromo = data.find((p: any) => p.status !== 'inactive' || p.active || p.is_active) || null;
        } else { globalPromo = null; }
        return globalPromo;
      }).catch(() => null);
    }
    promoPromise.then(p => setPromo(p));
  }, []);

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
    <div 
      onClick={() => navigate('/product/' + (product._id || product.id))}
      className='bg-white cursor-pointer rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition duration-300 relative border flex flex-col h-full'
    >
      {/* BADGE (Khuyến mãi) */}
      <div className='absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-semibold z-10'>
        -{finalDiscount}%
      </div>

      {/* NÚT YÊU THÍCH */}
      <div className='absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/80 backdrop-blur rounded-full p-1.5 shadow-sm'>
        <WishlistButton productId={(product._id || product.id) as string} size={16} />
      </div>

      {/* IMAGE */}
      <div className='bg-gray-100 rounded-xl h-32 sm:h-44 flex items-center justify-center p-2 relative overflow-hidden'>
        <img src={finalImage} alt={product.name} className='h-full object-contain hover:scale-105 transition z-0' />
        {/* EVENT BANNER BOTTOM */}
        {promo && (
           <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] sm:text-[10px] font-bold text-center py-1 uppercase tracking-wider z-10 shadow-inner opacity-95'>
             🎁 ƯU ĐÃI {promo.name}
           </div>
        )}
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

      </div>
    </div>
  )
}