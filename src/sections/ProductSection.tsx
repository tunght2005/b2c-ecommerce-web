import { useState, useEffect } from 'react'
import ProductCard, { type Product } from '../components/ProductCard'
import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'
import { Loader2 } from 'lucide-react'

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const parseList = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) return payload as T[]
    if (payload && typeof payload === 'object' && Array.isArray((payload as Record<string, unknown>).data)) {
      return (payload as Record<string, unknown>).data as T[]
    }
    return []
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // 1. Lấy danh sách sản phẩm gốc
        let baseProducts: Product[] = []
        const res = await fetchClient<Product[]>('/products')

        if (Array.isArray(res)) {
          baseProducts = res
        } else if (res && Array.isArray((res as Record<string, unknown>).data)) {
          baseProducts = (res as Record<string, unknown>).data as Product[]
        }

        // 2. Chạy vòng lặp song song (Promise.all) để móc Giá (variants) & Ảnh (product-images) cho từng ID
        if (baseProducts.length > 0) {
          const enrichedProducts = await Promise.all(
            baseProducts.map(async (prod) => {
              try {
                // Gọi song song Variant và Image cho 1 Product
                const [variantsRes, imagesRes] = await Promise.all([
                  fetchClient<Record<string, unknown>[]>(`/variants/product/${prod._id}`).catch(() => []),
                  fetchClient<Record<string, unknown>[]>(`/product-images/product/${prod._id}`).catch(() => [])
                ])

                // Trích xuất list vào product object
                const variants = parseList<Record<string, unknown>>(variantsRes)
                const images = parseList<Record<string, unknown>>(imagesRes)

                // Chỉ lấy sản phẩm đang có promotion thật theo ít nhất 1 variant
                const variantIds = variants.map((v) => String(v?._id || v?.id || '')).filter((id) => id.length > 0)

                if (variantIds.length === 0) {
                  return null
                }

                const promotions = await Promise.all(
                  variantIds.map((variantId) => fetchClient(`/promotions/best/${variantId}`).catch(() => null))
                )

                const hasActiveDiscount = promotions.some((promoRes: any) => {
                  const promo = promoRes?.data || promoRes
                  const finalPrice = Number(promo?.final_price)
                  const originalPrice = Number(promo?.original_price)
                  return (
                    !!promo?._id &&
                    Number.isFinite(finalPrice) &&
                    Number.isFinite(originalPrice) &&
                    finalPrice < originalPrice
                  )
                })

                if (!hasActiveDiscount) {
                  return null
                }

                return {
                  ...prod,
                  variants: variants,
                  // Fix field: API dùng "url" không phải "image_url"; ưu tiên ảnh is_primary
                  image: resolveImageUrl(
                    images.length > 0
                      ? ((images.find((img: Record<string, unknown>) => img.is_primary)?.url || images[0].url) as
                          | string
                          | undefined)
                      : undefined
                  )
                }
              } catch {
                // Lỗi lẻ của 1 sản phẩm không làm văng toàn bộ hệ thống
                return null
              }
            })
          )

          const onlyDiscountedProducts = enrichedProducts.filter(Boolean) as Product[]
          setProducts(onlyDiscountedProducts)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <section className='max-w-7xl mx-auto mt-8 sm:mt-12 px-4'>
      <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 border-l-4 border-red-500 pl-3'>
        Sản phẩm nổi bật đang giảm giá
      </h2>

      {loading ? (
        <div className='flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed'>
          <Loader2 className='animate-spin text-red-500 mb-4' size={40} />
          <p className='text-gray-500 font-medium animate-pulse'>Đang tải sản phẩm siêu hot...</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5'>
          {products.length > 0 ? (
            products.map((p) => <ProductCard key={p._id || p.id} product={p} />)
          ) : (
            <div className='col-span-full text-center py-10 text-gray-500'>Chưa có sản phẩm nào được hiển thị.</div>
          )}
        </div>
      )}
    </section>
  )
}
