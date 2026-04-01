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
  {
    id: 1,
    name: 'Tên sản phẩm 1',
    brand: 'Apple',
    ram: '8GB',
    memory: '256GB',
    chip: 'Chip xử lý',
    category: 'dien-thoai',
    priceValue: 25000000,
    price: '25.000.000đ',
    oldPrice: '28.000.000đ',
    image: 'https://via.placeholder.com/300x300?text=Product',
    badge: 'Giảm giá',
    installment: 'Trả góp 0%'
  },
  {
    id: 2,
    name: 'Tên sản phẩm 2',
    brand: 'Samsung',
    ram: '12GB',
    memory: '512GB',
    chip: 'Chip xử lý',
    category: 'dien-thoai',
    priceValue: 32000000,
    price: '32.000.000đ',
    oldPrice: '35.000.000đ',
    image: 'https://via.placeholder.com/300x300?text=Product',
    badge: 'Ưu đãi HOT',
    installment: 'Trả góp 0%'
  },
  {
    id: 3,
    name: 'Tên sản phẩm 3',
    brand: 'Xiaomi',
    ram: '8GB',
    memory: '128GB',
    chip: 'Chip xử lý',
    category: 'dien-thoai',
    priceValue: 18000000,
    price: '18.000.000đ',
    oldPrice: '20.000.000đ',
    image: 'https://via.placeholder.com/300x300?text=Product',
    badge: 'Mới',
    installment: 'Trả góp 0%'
  }
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

const priceOptions = [
  { value: 'low', label: 'Dưới 20 triệu' },
  { value: 'mid', label: '20 - 30 triệu' },
  { value: 'high', label: 'Trên 30 triệu' }
]

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
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false
      if (selectedRams.length && !selectedRams.includes(p.ram)) return false
      if (selectedMemory.length && !selectedMemory.includes(p.memory)) return false

      if (selectedPrice === 'low' && p.priceValue > 20000000) return false
      if (selectedPrice === 'mid' && (p.priceValue < 20000000 || p.priceValue > 30000000)) return false
      if (selectedPrice === 'high' && p.priceValue < 30000000) return false

      return true
    })

    if (sort === 'low-high') {
      filtered.sort((a, b) => a.priceValue - b.priceValue)
    }

    if (sort === 'high-low') {
      filtered.sort((a, b) => b.priceValue - a.priceValue)
    }

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
    <div className='bg-gray-100 min-h-screen py-6'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='bg-white rounded-3xl p-6 shadow-sm'>
          <h1 className='text-3xl font-bold mb-6'>Danh mục sản phẩm</h1>

          <div className='mb-8'>
            <h2 className='font-bold text-lg mb-4'>Thương hiệu nổi bật</h2>
            <div className='flex flex-wrap gap-3'>
              {brandOptions.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => toggleFilter('brand', brand.name)}
                  className={`px-4 py-3 rounded-2xl border transition flex items-center gap-3 min-w-[140px] ${
                    selectedBrands.includes(brand.name)
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white hover:border-red-400 hover:text-red-500'
                  }`}
                >
                  <div className='w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1'>
                    <img src={brand.logo} alt={brand.name} className='w-full h-full object-contain' />
                  </div>
                  <span className='font-medium'>{brand.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='flex flex-wrap gap-3 mb-8'>
            <button className='flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-500 bg-red-50'>
              <SlidersHorizontal size={18} />
              Bộ lọc
            </button>

            <button className='px-4 py-2 rounded-xl bg-gray-100 flex items-center gap-2'>
              <Truck size={16} />
              Sẵn hàng
            </button>

            <button className='px-4 py-2 rounded-xl bg-gray-100 flex items-center gap-2'>
              <BadgePercent size={16} />
              Hàng mới về
            </button>

            <button className='px-4 py-2 rounded-xl bg-gray-100 flex items-center gap-2'>
              <Cpu size={16} />
              Chip xử lý
              <ChevronDown size={16} />
            </button>
          </div>

          <div className='flex flex-wrap gap-3 mb-8'>
            {ramOptions.map((ram) => (
              <button
                key={ram}
                onClick={() => toggleFilter('ram', ram)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedRams.includes(ram)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white hover:border-blue-400'
                }`}
              >
                {ram}
              </button>
            ))}

            {memoryOptions.map((memory) => (
              <button
                key={memory}
                onClick={() => toggleFilter('memory', memory)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedMemory.includes(memory)
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white hover:border-green-400'
                }`}
              >
                {memory}
              </button>
            ))}
          </div>

          <div className='flex flex-wrap gap-3 mb-8'>
            <button className='px-4 py-2 rounded-full border flex items-center gap-2 bg-blue-50 border-blue-500 text-blue-500'>
              <Star size={16} />
              Phổ biến
            </button>

            <button className='px-4 py-2 rounded-full border flex items-center gap-2'>
              <Flame size={16} />
              HOT
            </button>

            <button className='px-4 py-2 rounded-full border flex items-center gap-2'>
              <ArrowDownWideNarrow size={16} />
              Giá thấp - cao
            </button>

            <button className='px-4 py-2 rounded-full border flex items-center gap-2'>
              <ArrowUpWideNarrow size={16} />
              Giá cao - thấp
            </button>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className='bg-white border rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group'
              >
                <div className='relative p-4'>
                  <span className='absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-lg'>
                    {product.badge}
                  </span>

                  <span className='absolute top-3 right-3 bg-blue-100 text-blue-500 text-xs px-2 py-1 rounded-lg'>
                    {product.installment}
                  </span>

                  <div className='w-full h-44 bg-gray-100 rounded-2xl flex items-center justify-center'>
                    <Smartphone size={70} className='text-gray-400' />
                  </div>
                </div>

                <div className='px-4 pb-4'>
                  <h3 className='font-semibold text-sm line-clamp-2 min-h-[40px]'>
                    {product.name}
                  </h3>

                  <div className='flex flex-wrap gap-2 mt-3'>
                    <span className='text-xs bg-gray-100 px-2 py-1 rounded-lg'>{product.ram}</span>
                    <span className='text-xs bg-gray-100 px-2 py-1 rounded-lg'>{product.memory}</span>
                  </div>

                  <div className='mt-3'>
                    <p className='text-red-500 font-bold text-lg'>{product.price}</p>
                    <p className='text-gray-400 line-through text-sm'>{product.oldPrice}</p>
                  </div>

                  <button className='mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-medium'>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className='text-center py-16'>
              <h3 className='text-xl font-semibold text-gray-700'>Không có sản phẩm phù hợp</h3>
              <button
                onClick={resetFilters}
                className='mt-4 px-6 py-3 bg-red-500 text-white rounded-xl'
              >
                Reset bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}