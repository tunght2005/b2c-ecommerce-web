import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import {
  SlidersHorizontal,
  ChevronDown,
  Star,
  Flame,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Truck,
  BadgePercent,
  Cpu,
  Smartphone,
} from 'lucide-react'

const sampleProducts = [
  { id: 1, name: 'Tên sản phẩm 1', brand: 'Apple', ram: '8GB', memory: '256GB', chip: 'Chip xử lý', category: 'dien-thoai', priceValue: 25000000, price: '25.000.000đ', oldPrice: '28.000.000đ', image: 'https://via.placeholder.com/300x300?text=Product', badge: 'Giảm giá', installment: 'Trả góp 0%' },
  { id: 2, name: 'Tên sản phẩm 2', brand: 'Samsung', ram: '12GB', memory: '512GB', chip: 'Chip xử lý', category: 'dien-thoai', priceValue: 32000000, price: '32.000.000đ', oldPrice: '35.000.000đ', image: 'https://via.placeholder.com/300x300?text=Product', badge: 'Ưu đãi HOT', installment: 'Trả góp 0%' },
  { id: 3, name: 'Tên sản phẩm 3', brand: 'Xiaomi', ram: '8GB', memory: '128GB', chip: 'Chip xử lý', category: 'dien-thoai', priceValue: 18000000, price: '18.000.000đ', oldPrice: '20.000.000đ', image: 'https://via.placeholder.com/300x300?text=Product', badge: 'Mới', installment: 'Trả góp 0%' }
]

const brandOptions = [
  { name: 'Apple', logo: 'https://via.placeholder.com/80x40?text=Apple' },
  { name: 'Samsung', logo: 'https://via.placeholder.com/80x40?text=Samsung' },
  { name: 'Xiaomi', logo: 'https://via.placeholder.com/80x40?text=Xiaomi' },
  { name: 'OPPO', logo: 'https://via.placeholder.com/80x40?text=OPPO' },
  { name: 'Vivo', logo: 'https://via.placeholder.com/80x40?text=Vivo' },
  { name: 'Realme', logo: 'https://via.placeholder.com/80x40?text=Realme' },
]

const ramOptions = ['8GB', '12GB', '16GB']
const memoryOptions = ['128GB', '256GB', '512GB']

export default function CategoryPage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedBrands = searchParams.getAll('brand')
  const selectedRams = searchParams.getAll('ram')
  const selectedMemory = searchParams.getAll('memory')
  const selectedPrice = searchParams.get('price')
  const sort = searchParams.get('sort') || 'popular'

  const filteredProducts = useMemo(() => {
    const filtered = sampleProducts.filter((p) => {
      if (name && p.category !== name) return false
      if (selectedBrands.length && !selectedBrands.map(b => b.toLowerCase()).includes(p.brand.toLowerCase())) return false
      if (selectedRams.length && !selectedRams.includes(p.ram)) return false
      if (selectedMemory.length && !selectedMemory.includes(p.memory)) return false

      if (selectedPrice === 'low' && p.priceValue > 20000000) return false
      if (selectedPrice === 'mid' && (p.priceValue < 20000000 || p.priceValue > 30000000)) return false
      if (selectedPrice === 'high' && p.priceValue < 30000000) return false

      return true
    })

    if (sort === 'low-high') filtered.sort((a, b) => a.priceValue - b.priceValue)
    if (sort === 'high-low') filtered.sort((a, b) => b.priceValue - a.priceValue)

    return filtered
  }, [name, selectedBrands, selectedRams, selectedMemory, selectedPrice, sort])

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
          <h1 className='text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900'>Danh mục sản phẩm</h1>

          {/* BRAND FILTER */}
          <div className='mb-6'>
            <h2 className='font-bold text-base sm:text-lg mb-3'>Thương hiệu nổi bật</h2>
            <div className='flex flex-wrap gap-2 sm:gap-3'>
              {brandOptions.map((brand) => {
                const isSelected = selectedBrands.map(b => b.toLowerCase()).includes(brand.name.toLowerCase());
                return (
                  <button
                    key={brand.name}
                    onClick={() => toggleFilter('brand', brand.name.toLowerCase())}
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border transition flex items-center justify-center gap-2 flex-grow sm:flex-grow-0 min-w-[calc(33.33%-8px)] sm:min-w-[140px] ${
                      isSelected
                        ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200'
                        : 'bg-white hover:border-red-400 hover:text-red-500'
                    }`}
                  >
                    <div className='w-6 h-6 sm:w-8 sm:h-8 bg-white rounded flex-shrink-0 flex items-center justify-center p-0.5'>
                      <img src={brand.logo} alt={brand.name} className='w-full h-full object-contain' />
                    </div>
                    <span className='font-medium text-sm sm:text-base'>{brand.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* TOOLS FILTER: Sửa lại thành flex-wrap */}
          <div className='flex flex-wrap gap-2 sm:gap-3 mb-4'>
            <button className='flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-red-500 text-red-500 bg-red-50 whitespace-nowrap text-sm sm:text-base'>
              <SlidersHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" />
              Bộ lọc
            </button>
            <button className='px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base transition'>
              <Truck size={14} className="sm:w-4 sm:h-4" /> Sẵn hàng
            </button>
            <button className='px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base transition'>
              <BadgePercent size={14} className="sm:w-4 sm:h-4" /> Hàng mới về
            </button>
            <button className='px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base transition'>
              <Cpu size={14} className="sm:w-4 sm:h-4" /> Chip xử lý <ChevronDown size={14} />
            </button>
          </div>

          {/* RAM & MEMORY FILTER: Sửa lại thành flex-wrap */}
          <div className='flex flex-wrap items-center gap-2 sm:gap-3 mb-6'>
            {ramOptions.map((ram) => (
              <button
                key={ram}
                onClick={() => toggleFilter('ram', ram)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border whitespace-nowrap text-sm sm:text-base transition ${
                  selectedRams.includes(ram) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white hover:border-blue-400'
                }`}
              >
                {ram}
              </button>
            ))}
            <div className="w-[1px] h-6 sm:h-8 bg-gray-200 mx-1 hidden sm:block"></div>
            {memoryOptions.map((memory) => (
              <button
                key={memory}
                onClick={() => toggleFilter('memory', memory)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border whitespace-nowrap text-sm sm:text-base transition ${
                  selectedMemory.includes(memory) ? 'bg-green-500 text-white border-green-500' : 'bg-white hover:border-green-400'
                }`}
              >
                {memory}
              </button>
            ))}
          </div>

          {/* SORT FILTER: Sửa lại thành flex-wrap */}
          <div className='flex flex-wrap gap-2 sm:gap-3 mb-8'>
            <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'popular' })} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'popular' ? 'bg-blue-50 border-blue-500 text-blue-600 font-medium' : 'hover:bg-gray-50'}`}>
              <Star size={14} className="sm:w-4 sm:h-4" /> Phổ biến
            </button>
            <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'hot' })} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'hot' ? 'bg-red-50 border-red-500 text-red-600 font-medium' : 'hover:bg-gray-50'}`}>
              <Flame size={14} className="sm:w-4 sm:h-4" /> HOT
            </button>
            <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'low-high' })} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'low-high' ? 'bg-gray-100 border-gray-400 font-medium' : 'hover:bg-gray-50'}`}>
              <ArrowDownWideNarrow size={14} className="sm:w-4 sm:h-4" /> Giá thấp - cao
            </button>
            <button onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), sort: 'high-low' })} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border flex items-center gap-1.5 whitespace-nowrap text-sm sm:text-base transition ${sort === 'high-low' ? 'bg-gray-100 border-gray-400 font-medium' : 'hover:bg-gray-50'}`}>
              <ArrowUpWideNarrow size={14} className="sm:w-4 sm:h-4" /> Giá cao - thấp
            </button>
          </div>

          {/* PRODUCT GRID */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5'>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className='bg-white border rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full'
              >
                <div className='relative p-2 sm:p-4'>
                  <span className='absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg z-10'>
                    {product.badge}
                  </span>
                  <span className='absolute top-2 right-2 sm:top-3 sm:right-3 bg-blue-100 text-blue-600 font-medium text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg z-10'>
                    {product.installment}
                  </span>
                  <div className='w-full h-32 sm:h-44 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center p-2'>
                    <Smartphone size={50} className='text-gray-300 sm:w-[70px] sm:h-[70px] group-hover:scale-110 transition-transform duration-300' />
                  </div>
                </div>

                <div className='px-3 pb-3 sm:px-4 pb-4 flex flex-col flex-1'>
                  <h3 className='font-semibold text-xs sm:text-sm line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-red-600 transition-colors'>
                    {product.name}
                  </h3>

                  <div className='flex flex-wrap gap-1 sm:gap-2 mt-2'>
                    <span className='text-[10px] sm:text-xs bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-gray-600'>{product.ram}</span>
                    <span className='text-[10px] sm:text-xs bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-gray-600'>{product.memory}</span>
                  </div>

                  <div className='mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap'>
                    <p className='text-red-600 font-bold text-sm sm:text-lg'>{product.price}</p>
                    <p className='text-gray-400 line-through text-[10px] sm:text-sm'>{product.oldPrice}</p>
                  </div>

                  <button className='mt-auto pt-3 w-full bg-red-500 hover:bg-red-600 text-white py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-colors'>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className='text-center py-10 sm:py-16'>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone size={32} className="text-gray-400" />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-gray-700'>Không có sản phẩm phù hợp</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Thử thay đổi hoặc xóa các bộ lọc để xem thêm nhiều sản phẩm khác.</p>
              <button
                onClick={resetFilters}
                className='mt-4 sm:mt-6 px-4 py-2 sm:px-6 sm:py-3 bg-red-500 hover:bg-red-600 transition text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium'
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}