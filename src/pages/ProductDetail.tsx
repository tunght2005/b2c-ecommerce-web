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

  // HÀM BẮN SỰ KIỆN ĐỂ NHẢY SỐ GIỎ HÀNG TRÊN HEADER
  const handleAddToCart = () => {
    window.dispatchEvent(new CustomEvent('addToCart'));
    // Có thể thêm 1 alert hoặc toast thông báo ở đây cho sinh động
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  }

  return (
    <div className='bg-gray-50 min-h-screen pb-6 sm:pb-10'>
      <div className='max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6'>
        
        {/* Breadcrumb - Thêm flex-wrap để không bị tràn màn hình */}
        <div className='flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5'>
          <span className='cursor-pointer hover:text-red-500 whitespace-nowrap' onClick={() => navigate('/')}>
            Trang chủ
          </span>
          <ChevronRight size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">{product.category}</span>
          <ChevronRight size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className='text-gray-800 font-medium line-clamp-1'>{product.name}</span>
        </div>

        {/* Top Info */}
        <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>{product.name}</h1>

              <div className='flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm'>
                <div className='flex items-center gap-1 text-yellow-500'>
                  <Star size={14} className="sm:w-4 sm:h-4" fill='currentColor' />
                  <span className='font-semibold'>{product.rating}</span>
                  <span className='text-gray-500'>(120 đánh giá)</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className='text-gray-500'>Đã bán {product.sold}+</div>
                <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className='flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md'>
                  <BadgeCheck size={14} className="sm:w-4 sm:h-4" />
                  Chính hãng VN/A
                </div>
              </div>
            </div>

            <div className='flex gap-2 sm:gap-3'>
              <button className='flex-1 lg:flex-none border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 hover:border-red-500 hover:text-red-500 transition text-sm sm:text-base'>
                <Heart size={16} className="sm:w-[18px] sm:h-[18px]" />
                Yêu thích
              </button>
              <button className='flex-1 lg:flex-none border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 hover:border-red-500 hover:text-red-500 transition text-sm sm:text-base'>
                <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>

        <div className='grid lg:grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 mt-4 sm:mt-6'>
          {/* CỘT TRÁI (Ảnh, Thông số, Mô tả) */}
          <div className='space-y-4 sm:space-y-6'>
            
            {/* Box Ảnh */}
            <div className='bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-gray-100'>
              <img
                src={selectedImage}
                alt={product.name}
                // Thay đổi chiều cao linh hoạt cho Mobile
                className='w-full h-[250px] sm:h-[350px] lg:h-[420px] object-contain rounded-xl sm:rounded-2xl bg-gray-50 transition-all duration-300'
              />

              <div className='grid grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4'>
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`border rounded-xl sm:rounded-2xl overflow-hidden p-1 sm:p-2 transition ${
                      selectedImage === img ? 'border-red-500 ring-1 sm:ring-2 ring-red-200' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} className='w-full h-12 sm:h-16 lg:h-20 object-cover rounded-lg sm:rounded-xl' />
                  </button>
                ))}
              </div>
            </div>

            {/* Box Thông số */}
            <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
              <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>Thông số kỹ thuật</h3>
              <div className='grid sm:grid-cols-2 gap-2 sm:gap-4'>
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className='flex justify-between gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 text-sm sm:text-base'
                  >
                    <span className='text-gray-500 capitalize flex-shrink-0'>
                      {key === 'screen' && 'Màn hình'}
                      {key === 'chip' && 'Chip'}
                      {key === 'ram' && 'RAM'}
                      {key === 'storage' && 'Bộ nhớ'}
                      {key === 'rearCamera' && 'Camera sau'}
                      {key === 'frontCamera' && 'Camera trước'}
                      {key === 'battery' && 'Pin'}
                      {key === 'os' && 'Hệ điều hành'}
                    </span>
                    <span className='font-semibold text-right text-gray-800 line-clamp-2'>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box Mô tả */}
            <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
              <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>Mô tả sản phẩm</h3>
              <p className='text-sm sm:text-base text-gray-600 leading-relaxed sm:leading-8'>{product.description}</p>
            </div>
          </div>

          {/* CỘT PHẢI (Mua hàng, Chính sách) */}
          <div className='space-y-4 sm:space-y-6'>
            <div className='bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-[100px]'>
              
              {/* Box Giá tiền */}
              <div className='flex flex-wrap items-end gap-2 sm:gap-3'>
                <span className='text-2xl sm:text-4xl font-bold text-red-600'>{product.price.toLocaleString()}đ</span>
                <span className='text-sm sm:text-lg text-gray-400 line-through pb-1'>{product.oldPrice.toLocaleString()}đ</span>
                <span className='bg-red-100 text-red-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-full text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5'>
                  -{product.discount}%
                </span>
              </div>

              {/* Box Bộ nhớ */}
              <div className='mt-5 sm:mt-6'>
                <h4 className='font-semibold mb-2 sm:mb-3 text-sm sm:text-base'>Chọn phiên bản</h4>
                <div className='grid grid-cols-3 gap-2 sm:gap-3'>
                  {product.storage.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedStorage(item)}
                      className={`border rounded-xl sm:rounded-2xl py-2 sm:py-3 text-xs sm:text-sm font-medium transition ${
                        selectedStorage === item ? 'border-red-500 bg-red-50 text-red-600 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box Màu sắc */}
              <div className='mt-5 sm:mt-6'>
                <h4 className='font-semibold mb-2 sm:mb-3 text-sm sm:text-base'>Chọn màu sắc</h4>
                <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                  {product.colors.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedColor(item)}
                      className={`border rounded-xl sm:rounded-2xl p-2 sm:p-3 text-xs sm:text-sm font-medium transition ${
                        selectedColor === item ? 'border-red-500 bg-red-50 text-red-600 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box Số lượng */}
              <div className='mt-5 sm:mt-6'>
                <h4 className='font-semibold mb-2 sm:mb-3 text-sm sm:text-base'>Số lượng</h4>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center border border-gray-300 rounded-xl sm:rounded-2xl overflow-hidden'>
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className='w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 transition'
                    >
                      <Minus size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <span className='w-10 sm:w-12 text-center font-semibold text-sm sm:text-base'>{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className='w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-100 transition'
                    >
                      <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Nút bấm mua hàng */}
              <div className='space-y-2 sm:space-y-3 mt-6 sm:mt-8'>
                <button 
                  onClick={handleAddToCart}
                  className='w-full bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition shadow-lg shadow-red-200'
                >
                  <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px]" />
                  Thêm vào giỏ hàng
                </button>

                <button 
                  onClick={() => navigate('/cart')}
                  className='w-full border-2 border-red-500 text-red-600 hover:bg-red-50 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition'
                >
                  Mua ngay
                </button>
              </div>

              {/* Box Chính sách */}
              <div className='mt-6 sm:mt-8 space-y-3 sm:space-y-4 border-t pt-5 sm:pt-6'>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <Truck className='text-red-500 flex-shrink-0' size={18} />
                  Giao hàng nhanh toàn quốc
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <ShieldCheck className='text-green-500 flex-shrink-0' size={18} />
                  Bảo hành chính hãng 12 tháng
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <RotateCcw className='text-blue-500 flex-shrink-0' size={18} />
                  Đổi trả miễn phí trong 30 ngày
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <Gift className='text-pink-500 flex-shrink-0' size={18} />
                  Tặng kèm ưu đãi hấp dẫn
                </div>
                <div className='flex items-center gap-3 text-sm sm:text-base text-gray-700'>
                  <CreditCard className='text-purple-500 flex-shrink-0' size={18} />
                  Hỗ trợ trả góp 0%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products - Hiển thị 2 sản phẩm/hàng trên mobile */}
        <div className='mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h2 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6'>Sản phẩm liên quan</h2>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'>
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                onClick={() => navigate(`/product/${item}`)}
                className='border border-gray-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col h-full bg-white'
              >
                <div className='bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex-shrink-0'>
                  <Smartphone className='mx-auto text-gray-300 sm:w-[70px] sm:h-[70px] w-[50px] h-[50px] group-hover:scale-110 transition-transform' />
                </div>

                <div className='flex flex-col flex-1'>
                  <h3 className='text-xs sm:text-sm font-semibold mt-3 sm:mt-4 line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-red-500 transition'>
                    Samsung Galaxy S25 Ultra 512GB
                  </h3>

                  <div className='mt-auto pt-2'>
                    <div className='flex items-baseline gap-1.5 sm:gap-2 flex-wrap'>
                      <span className='text-red-600 font-bold text-sm sm:text-lg'>28.990.000đ</span>
                      <span className='text-gray-400 line-through text-[10px] sm:text-sm'>31.990.000đ</span>
                    </div>

                    <div className='flex items-center gap-1 text-yellow-500 mt-1 sm:mt-2'>
                      <Star size={12} className="sm:w-[14px] sm:h-[14px]" fill='currentColor' />
                      <span className='text-[10px] sm:text-sm font-medium text-gray-600'>4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}