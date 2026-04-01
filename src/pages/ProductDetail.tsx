import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  BadgeCheck,
  Gift,
  CreditCard,
  Smartphone
} from 'lucide-react'

const sampleProduct = {
  id: 1,
  name: 'Tên sản phẩm',
  brand: 'Apple',
  category: 'Điện thoại',
  price: 25990000,
  oldPrice: 28990000,
  discount: 10,
  rating: 4.8,
  sold: 120,
  image: 'https://via.placeholder.com/600x600?text=Product+Image',
  images: [
    'https://via.placeholder.com/600x600?text=Image+1',
    'https://via.placeholder.com/600x600?text=Image+2',
    'https://via.placeholder.com/600x600?text=Image+3',
    'https://via.placeholder.com/600x600?text=Image+4'
  ],
  colors: ['Màu 1', 'Màu 2', 'Màu 3', 'Màu 4'],
  storage: ['128GB', '256GB', '512GB'],
  specs: {
    screen: 'Thông tin màn hình',
    chip: 'Thông tin chip',
    ram: 'Thông tin RAM',
    storage: 'Thông tin bộ nhớ',
    rearCamera: 'Thông tin camera sau',
    frontCamera: 'Thông tin camera trước',
    battery: 'Thông tin pin',
    os: 'Thông tin hệ điều hành'
  },
  description: 'Mô tả sản phẩm của bạn sẽ hiển thị ở đây. Sau này chỉ cần thay bằng dữ liệu API hoặc dữ liệu thật.'
}

export default function ProductDetail() {
  useParams()
  const navigate = useNavigate()

  const product = useMemo(() => {
    // Sau này thay sampleProduct bằng dữ liệu API hoặc find theo id
    return sampleProduct
  }, [])

  const [selectedImage, setSelectedImage] = useState(product.images[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedStorage, setSelectedStorage] = useState(product.storage[0])
  const [quantity, setQuantity] = useState(1)

  return (
    <div className='bg-gray-100 min-h-screen pb-10'>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        {/* Breadcrumb */}
        <div className='flex items-center gap-2 text-sm text-gray-500 mb-5'>
          <span className='cursor-pointer hover:text-red-500' onClick={() => navigate('/')}>
            Trang chủ
          </span>
          <ChevronRight size={16} />
          <span>{product.category}</span>
          <ChevronRight size={16} />
          <span className='text-gray-800 font-medium'>{product.name}</span>
        </div>

        {/* Top Info */}
        <div className='bg-white rounded-3xl p-6 shadow-sm'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>

              <div className='flex flex-wrap items-center gap-4 mt-3 text-sm'>
                <div className='flex items-center gap-1 text-yellow-500'>
                  <Star size={16} fill='currentColor' />
                  <span className='font-semibold'>{product.rating}</span>
                  <span className='text-gray-500'>(120 đánh giá)</span>
                </div>

                <div className='text-gray-500'>Đã bán {product.sold}+</div>

                <div className='flex items-center gap-1 text-green-600'>
                  <BadgeCheck size={16} />
                  Chính hãng VN/A
                </div>
              </div>
            </div>

            <div className='flex gap-3'>
              <button className='border border-gray-300 px-4 py-2 rounded-2xl flex items-center gap-2 hover:border-red-500 hover:text-red-500 transition'>
                <Heart size={18} />
                Yêu thích
              </button>

              <button className='border border-gray-300 px-4 py-2 rounded-2xl flex items-center gap-2 hover:border-red-500 hover:text-red-500 transition'>
                <Share2 size={18} />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>

        <div className='grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-6'>
          {/* Left */}
          <div className='space-y-6'>
            <div className='bg-white rounded-3xl p-5 shadow-sm'>
              <img
                src={selectedImage}
                alt={product.name}
                className='w-full h-[420px] object-contain rounded-2xl bg-gray-50'
              />

              <div className='grid grid-cols-4 gap-3 mt-4'>
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`border rounded-2xl overflow-hidden p-2 transition ${
                      selectedImage === img ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} className='w-full h-20 object-cover rounded-xl' />
                  </button>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-3xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold mb-4'>Thông số kỹ thuật</h3>

              <div className='grid sm:grid-cols-2 gap-4'>
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className='flex justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100'
                  >
                    <span className='text-gray-500 capitalize'>
                      {key === 'screen' && 'Màn hình'}
                      {key === 'chip' && 'Chip'}
                      {key === 'ram' && 'RAM'}
                      {key === 'storage' && 'Bộ nhớ'}
                      {key === 'rearCamera' && 'Camera sau'}
                      {key === 'frontCamera' && 'Camera trước'}
                      {key === 'battery' && 'Pin'}
                      {key === 'os' && 'Hệ điều hành'}
                    </span>
                    <span className='font-semibold text-right'>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-3xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold mb-4'>Mô tả sản phẩm</h3>
              <p className='text-gray-600 leading-8'>{product.description}</p>
            </div>
          </div>

          {/* Right */}
          <div className='space-y-6'>
            <div className='bg-white rounded-3xl p-6 shadow-sm sticky top-4'>
              <div className='flex items-end gap-3'>
                <span className='text-4xl font-bold text-red-600'>{product.price.toLocaleString()}đ</span>
                <span className='text-lg text-gray-400 line-through'>{product.oldPrice.toLocaleString()}đ</span>
                <span className='bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold'>
                  -{product.discount}%
                </span>
              </div>

              <div className='mt-6'>
                <h4 className='font-semibold mb-3'>Chọn phiên bản</h4>
                <div className='grid grid-cols-3 gap-3'>
                  {product.storage.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedStorage(item)}
                      className={`border rounded-2xl py-3 font-medium transition ${
                        selectedStorage === item ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className='mt-6'>
                <h4 className='font-semibold mb-3'>Chọn màu sắc</h4>
                <div className='grid grid-cols-2 gap-3'>
                  {product.colors.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedColor(item)}
                      className={`border rounded-2xl p-3 text-sm font-medium transition ${
                        selectedColor === item ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className='mt-6'>
                <h4 className='font-semibold mb-3'>Số lượng</h4>

                <div className='flex items-center gap-4'>
                  <div className='flex items-center border border-gray-300 rounded-2xl overflow-hidden'>
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className='w-12 h-12 flex items-center justify-center hover:bg-gray-100'
                    >
                      <Minus size={18} />
                    </button>

                    <span className='w-12 text-center font-semibold'>{quantity}</span>

                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className='w-12 h-12 flex items-center justify-center hover:bg-gray-100'
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className='space-y-3 mt-8'>
                <button className='w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition'>
                  <ShoppingCart size={22} />
                  Thêm vào giỏ hàng
                </button>

                <button className='w-full border-2 border-red-500 text-red-600 hover:bg-red-50 py-4 rounded-2xl font-bold text-lg transition'>
                  Mua ngay
                </button>
              </div>

              <div className='mt-8 space-y-4 border-t pt-6'>
                <div className='flex items-center gap-3 text-gray-700'>
                  <Truck className='text-red-500' size={20} />
                  Giao hàng nhanh toàn quốc
                </div>

                <div className='flex items-center gap-3 text-gray-700'>
                  <ShieldCheck className='text-green-500' size={20} />
                  Bảo hành chính hãng 12 tháng
                </div>

                <div className='flex items-center gap-3 text-gray-700'>
                  <RotateCcw className='text-blue-500' size={20} />
                  Đổi trả miễn phí trong 30 ngày
                </div>

                <div className='flex items-center gap-3 text-gray-700'>
                  <Gift className='text-pink-500' size={20} />
                  Tặng kèm ưu đãi hấp dẫn
                </div>

                <div className='flex items-center gap-3 text-gray-700'>
                  <CreditCard className='text-purple-500' size={20} />
                  Hỗ trợ trả góp 0%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className='mt-8 bg-white rounded-3xl p-6 shadow-sm'>
          <h2 className='text-2xl font-bold mb-6'>Sản phẩm liên quan</h2>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className='border border-gray-200 rounded-3xl p-4 hover:shadow-lg transition cursor-pointer group'
              >
                <div className='bg-gray-100 rounded-2xl p-4'>
                  <Smartphone className='mx-auto text-gray-500' size={70} />
                </div>

                <h3 className='font-semibold mt-4 line-clamp-2 group-hover:text-red-500 transition'>
                  Samsung Galaxy S25 Ultra 512GB
                </h3>

                <div className='flex items-center gap-2 mt-2'>
                  <span className='text-red-600 font-bold text-lg'>28.990.000đ</span>
                  <span className='text-gray-400 line-through text-sm'>31.990.000đ</span>
                </div>

                <div className='flex items-center gap-1 text-yellow-500 mt-2'>
                  <Star size={14} fill='currentColor' />
                  <span className='text-sm font-medium'>4.8</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
