import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import {
  SlidersHorizontal,
  ChevronDown,
  Star,
  Flame,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Loader2,
  Smartphone
} from 'lucide-react'

import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'
import ProductCard, { type Product } from '../components/ProductCard'

export default function CategoryPage() {
  const { name } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string; logo: string }[]>([])
  const [loading, setLoading] = useState(true)

  const selectedBrands = searchParams.getAll('brand')
  const sort = searchParams.get('sort') || 'popular'

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Lấy Brands
        const bRes = await fetchClient<any>('/brands').catch(() => [])
        const bData = Array.isArray(bRes) ? bRes : bRes?.data || []
        setBrands(
          bData.map((b: any) => ({
            id: b._id || b.id,
            name: b.name,
            logo: resolveImageUrl(b.logo || b.image) || `https://via.placeholder.com/80x40?text=${b.name}`
          }))
        )

        // 2. Lấy Products
        const pRes = await fetchClient<any>('/products').catch(() => [])
        const baseProducts: Product[] = Array.isArray(pRes) ? pRes : pRes?.data || []

        // 3. Enrich Products (Call API chi tiết cho từng máy để có ảnh bìa & giá thấp nhất)
        const enrichedProducts = await Promise.all(
          baseProducts.map(async (prod: any) => {
            try {
              const [variantsRes, imagesRes] = await Promise.all([
                fetchClient(`/variants/product/${prod._id}`).catch(() => []),
                fetchClient(`/product-images/product/${prod._id}`).catch(() => [])
              ])
              const variants = Array.isArray(variantsRes) ? variantsRes : variantsRes?.data || []
              const images = Array.isArray(imagesRes) ? imagesRes : imagesRes?.data || []

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
        console.error('Failed to load category page data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // FILTER LOGIC Cục bộ
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p: any) => {
      // Filter Category (dựa vào Params URL)
      if (name && name !== 'all') {
        const catName = p.category_id?.name?.toLowerCase() || p.category?.toLowerCase() || ''
        const slug = p.category_id?.slug?.toLowerCase() || ''
        const urlName = name.replace(/-/g, ' ').toLowerCase()

        let match = false
        if (catName.includes(urlName) || urlName.includes(catName)) match = true
        if (slug.includes(urlName) || urlName.includes(slug)) match = true

        if (urlName.includes('dien thoai') && (catName.includes('smartphone') || slug.includes('smartphone')))
          match = true
        if (urlName.includes('dong ho') && (catName.includes('watch') || slug.includes('watch'))) match = true
        if (urlName.includes('phu kien') && (catName.includes('access') || slug.includes('phu-kien'))) match = true

        if (!match) return false
      }

      // Filter Brands (Bổ sung linh hoạt nếu DB cấu hình sai hãng)
      if (selectedBrands.length > 0) {
        const pBrand = p.brand_id?.name?.toLowerCase() || p.brand?.toLowerCase() || ''
        const pName = p.name?.toLowerCase() || ''
        if (
          !selectedBrands.some((b) => {
            const low = b.toLowerCase()
            return low === pBrand || pName.includes(low)
          })
        ) {
          return false
        }
      }

      return true
    })

    // Sorting
    if (sort === 'low-high') {
      filtered.sort((a, b) => {
        const priceA = a.variants && a.variants.length > 0 ? a.variants[0].price : a.price || 0
        const priceB = b.variants && b.variants.length > 0 ? b.variants[0].price : b.price || 0
        return (Number(priceA) || 0) - (Number(priceB) || 0)
      })
    } else if (sort === 'high-low') {
      filtered.sort((a, b) => {
        const priceA = a.variants && a.variants.length > 0 ? a.variants[0].price : a.price || 0
        const priceB = b.variants && b.variants.length > 0 ? b.variants[0].price : b.price || 0
        return (Number(priceB) || 0) - (Number(priceA) || 0)
      })
    }

    return filtered
  }, [products, name, selectedBrands, sort])

  // UPDATE URL PARAMS
  const toggleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    const values = params.getAll(key)

    if (values.includes(value)) {
      const newValues = values.filter((v) => v !== value)
      params.delete(key)
      newValues.forEach((v) => params.append(key, v))
    } else {
      params.append(key, value)
    }
    setSearchParams(params)
  }

  const resetFilters = () => setSearchParams({})

  return (
    <div className='bg-gray-50 min-h-screen py-4 sm:py-6'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4'>
        <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h1 className='text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900'>
            Danh mục {name && name !== 'all' ? decodeURIComponent(name) : 'Sản phẩm'}
          </h1>

          {/* BRAND FILTER TỪ API */}
          {brands.length > 0 && (
            <div className='mb-6'>
              <h2 className='font-bold text-base sm:text-lg mb-3'>Thương hiệu nổi bật</h2>
              <div className='flex flex-wrap gap-2 sm:gap-3'>
                {brands.map((brand) => {
                  const isSelected = selectedBrands.map((b) => b.toLowerCase()).includes(brand.name.toLowerCase())
                  return (
                    <button
                      key={brand.id}
                      onClick={() => toggleFilter('brand', brand.name.toLowerCase())}
                      className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border transition flex items-center justify-center gap-2 flex-grow sm:flex-grow-0 min-w-[calc(33.33%-8px)] sm:min-w-[140px] ${
                        isSelected
                          ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200'
                          : 'bg-white hover:border-red-400 hover:text-red-500'
                      }`}
                    >
                      <div className='w-6 h-6 sm:w-8 sm:h-8 bg-white rounded flex-shrink-0 flex items-center justify-center p-0.5 overflow-hidden'>
                        <img src={brand.logo} alt={brand.name} className='w-full h-full object-contain' />
                      </div>
                      <span className='font-medium text-sm sm:text-base'>{brand.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* CASCADING BUTTONS */}
          <div className='flex flex-wrap gap-2 sm:gap-3 mb-8'>
            <button
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'popular' })}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'popular' ? 'bg-blue-50 border-blue-500 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}
            >
              <Star size={14} className='sm:w-4 sm:h-4' /> Phổ biến
            </button>
            <button
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'hot' })}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'hot' ? 'bg-red-50 border-red-500 text-red-600 font-medium' : 'hover:bg-gray-50'}`}
            >
              <Flame size={14} className='sm:w-4 sm:h-4' /> HOT
            </button>
            <button
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'low-high' })}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'low-high' ? 'bg-gray-100 border-gray-400 font-medium' : 'hover:bg-gray-50'}`}
            >
              <ArrowDownWideNarrow size={14} className='sm:w-4 sm:h-4' /> Giá thấp - cao
            </button>
            <button
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'high-low' })}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'high-low' ? 'bg-gray-100 border-gray-400 font-medium' : 'hover:bg-gray-50'}`}
            >
              <ArrowUpWideNarrow size={14} className='sm:w-4 sm:h-4' /> Giá cao - thấp
            </button>
            <button className='flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-red-500 text-red-500 bg-red-50 whitespace-nowrap text-sm sm:text-base'>
              <SlidersHorizontal size={14} className='sm:w-[16px] sm:h-[16px]' />
              Bộ lọc nâng cao
            </button>
          </div>

          {/* PRODUCT GRID Bằng API Thật */}
          {loading ? (
            <div className='flex flex-col items-center justify-center py-20'>
              <Loader2 className='animate-spin text-red-500 mb-4' size={50} />
              <p className='text-gray-500 font-medium animate-pulse'>Đang tải toàn bộ sản phẩm từ DB...</p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5'>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className='text-center py-10 sm:py-16'>
                  <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Smartphone size={32} className='text-gray-400' />
                  </div>
                  <h3 className='text-lg sm:text-xl font-semibold text-gray-700'>Không tìm thấy sản phẩm nào</h3>
                  <p className='text-sm text-gray-500 mt-2 max-w-sm mx-auto'>
                    Chưa có sản phẩm nào thuộc bộ lọc này trong hệ thống. Vui lòng thiết lập lại.
                  </p>
                  <button
                    onClick={resetFilters}
                    className='mt-4 sm:mt-6 px-4 py-2 sm:px-6 sm:py-3 bg-red-500 hover:bg-red-600 transition text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium'
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
