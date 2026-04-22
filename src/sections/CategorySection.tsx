import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard, { type Product } from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'

type Props = {
  title: string
  banner: string
}

export default function CategorySection({ title, banner }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const toCategorySlug = (value: string) => {
    const normalized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    const aliasMap: Record<string, string> = {
      'dien-thoai': 'dien-thoai',
      laptop: 'laptop',
      'dong-ho': 'dong-ho',
      'phu-kien': 'phu-kien'
    }

    return aliasMap[normalized] || normalized || 'all'
  }

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true)
        const res = await fetchClient<any>('/products')
        const allProducts: Product[] = Array.isArray(res) ? res : res?.data || []

        const filtered = allProducts.filter((p: any) => {
          const catName = (p.category_id?.name || p.category || '').toLowerCase()
          const t = title.toLowerCase()
          const slug = (p.category_id?.slug || '').toLowerCase()

          if (catName.includes(t) || t.includes(catName)) return true
          if (slug && t.includes(slug.replace(/-/g, ' '))) return true

          // Bí danh do db khác tên frontend
          if (t.includes('điện thoại') && (catName.includes('smartphone') || slug.includes('smartphone'))) return true
          if (t.includes('đồng hồ') && (catName.includes('watch') || slug.includes('watch'))) return true
          if (t.includes('phụ kiện') && (catName.includes('access') || slug.includes('phu-kien'))) return true
          if (t.includes('tablet') && (catName.includes('tablet') || catName.includes('ipad'))) return true

          return false
        })

        const selectedProducts = filtered.slice(0, 4)

        // Enrich thêm Variants / Images giống trang Home
        const enrichedProducts = await Promise.all(
          selectedProducts.map(async (prod: any) => {
            try {
              const [variantsRes, imagesRes] = await Promise.all([
                fetchClient(`/variants/product/${prod._id}`).catch(() => []),
                fetchClient(`/product-images/product/${prod._id}`).catch(() => [])
              ])

              const variants = Array.isArray(variantsRes) ? variantsRes : (variantsRes as any)?.data || []
              const images = Array.isArray(imagesRes) ? imagesRes : (imagesRes as any)?.data || []

              return {
                ...prod,
                variants,
                image:
                  resolveImageUrl(
                    images.length > 0 ? images.find((img: any) => img.is_primary)?.url || images[0].url : undefined
                  ) || resolveImageUrl(prod.thumbnail || prod.image)
              }
            } catch {
              return prod
            }
          })
        )
        setProducts(enrichedProducts)
      } catch (error) {
        console.error(`Lỗi tải danh mục ${title}:`, error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategoryProducts()
  }, [title])

  return (
    <section className='max-w-7xl mx-auto px-4 mt-10'>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-5'>
        {/* Banner trái */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-3xl overflow-hidden shadow-md h-full border border-gray-200'>
            <img
              src={resolveImageUrl(banner) || banner}
              alt='banner'
              className='w-full h-full min-h-125 object-cover bg-white cursor-pointer hover:opacity-90 transition'
            />
          </div>
        </div>

        {/* Product phải */}
        <div className='lg:col-span-4 bg-white rounded-3xl shadow-md p-5 flex flex-col'>
          <div className='flex items-center justify-between border-b pb-4 mb-4 font-semibold'>
            <span className='text-gray-700 text-lg uppercase'>{title}</span>
            <Link to={`/category/${toCategorySlug(title)}`} className='text-sm text-red-500 hover:underline'>
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 flex-1 items-start'>
              {products.length > 0 ? (
                products.map((product) => <ProductCard key={product._id || product.id} product={product} />)
              ) : (
                <div className='col-span-full py-10 text-center text-gray-500'>Chưa có sản phẩm nào.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
