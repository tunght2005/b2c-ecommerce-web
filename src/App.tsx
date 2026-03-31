import { useEffect, useState, useRef } from 'react'
import { ChevronUp } from 'lucide-react'

function App() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)

  const videoRefs = useRef([])

  const banners = [
    '/690x300_open_iPhone 17e.webp',
    '/690x300_ROI_MacBookNeo.webp',
    '/oppofingn6.webp',
    '/Home(3).webp',
  ]

  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: '32.990.000đ',
      oldPrice: '35.990.000đ',
      image: 'https://via.placeholder.com/300x300?text=iPhone+15',
    },
    {
      id: 2,
      name: 'Samsung Galaxy S25 Ultra',
      price: '28.990.000đ',
      oldPrice: '31.990.000đ',
      image: 'https://via.placeholder.com/300x300?text=Samsung+S25',
    },
    {
      id: 3,
      name: 'MacBook Air M3',
      price: '27.490.000đ',
      oldPrice: '29.990.000đ',
      image: 'https://via.placeholder.com/300x300?text=MacBook+M3',
    },
    {
      id: 4,
      name: 'Apple Watch Series 9',
      price: '9.990.000đ',
      oldPrice: '11.990.000đ',
      image: 'https://via.placeholder.com/300x300?text=Watch+Series+9',
    },
  ]

  const reviewVideos = [
    {
      id: 1,
      title: 'Review OPPO Reno15 Có Đáng Mua Không?',
      description: 'Video đánh giá chi tiết thiết kế, hiệu năng và camera.',
      video: '/7678183743063.mp4',
    },
    {
      id: 2,
      title: 'Đánh Giá Đồng Hồ Thông Minh Xiaomi',
      description: 'Trải nghiệm thực tế , pin và hiệu năng.',
      video: '/7678183724007.mp4',
    },
    {
      id: 3,
      title: 'Máy Hút Bụi ',
      description: 'Review hiệu năng.',
      video: '/7678183734899.mp4',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <header className='bg-red-600 text-white shadow-md sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-4'>
          <h1
            onClick={() => window.location.href = '/'}
            className='text-3xl font-bold cursor-pointer hover:text-yellow-300 transition'
          >
            SevenStore
          </h1>

          <div className='w-full lg:w-[500px]'>
            <input
              type='text'
              placeholder='Tìm kiếm điện thoại, laptop, phụ kiện...'
              className='w-full px-4 py-3 rounded-xl text-black outline-none'
            />
          </div>

          <div className='flex gap-6 font-medium'>
            <button className='hover:text-yellow-300 transition'>
              Đăng nhập
            </button>
            <button className='hover:text-yellow-300 transition'>
              Giỏ hàng
            </button>
          </div>
        </div>
      </header>

      {/* Navbar */}
      <nav className='bg-white border-b shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-6 font-semibold text-gray-700'>
          <button className='hover:text-red-600'>Điện thoại</button>
          <button className='hover:text-red-600'>Laptop</button>
          <button className='hover:text-red-600'>Tablet</button>
          <button className='hover:text-red-600'>Tai nghe</button>
          <button className='hover:text-red-600'>Đồng hồ</button>
          <button className='hover:text-red-600'>Phụ kiện</button>
        </div>
      </nav>

      {/* Banner */}
      <section className='max-w-7xl mx-auto px-4 mt-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-xl bg-white'>
          <div className='bg-gradient-to-r from-red-600 to-orange-500 p-8 md:p-14 flex flex-col justify-center text-white'>
            <h2 className='text-3xl md:text-6xl font-bold mb-4 leading-tight'>
              Sale Công Nghệ
              <br />
              Giảm Đến 50%
            </h2>

            <p className='text-base md:text-xl mb-8 text-gray-100'>
              Hàng ngàn sản phẩm điện tử với giá siêu ưu đãi.
            </p>

            <div className='flex flex-wrap gap-4'>
              <button className='bg-white text-red-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition'>
                Mua ngay
              </button>

              <button className='border border-white hover:bg-white hover:text-red-600 px-6 py-3 rounded-xl font-semibold transition'>
                Đăng ký nhận tin
              </button>
            </div>
          </div>

          <div className='relative bg-gray-100 flex items-center justify-center p-4'>
            <img
              src={banners[currentBanner]}
              alt='Banner'
              className='w-full h-[220px] md:h-[380px] object-contain transition-all duration-700'
            />

            <div className='absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3'>
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    currentBanner === index
                      ? 'bg-red-500 scale-125'
                      : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product nổi bật */}
      <section className='max-w-7xl mx-auto px-4 mt-10'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-3xl font-bold text-gray-800'>
            Sản phẩm nổi bật
          </h2>

          <button className='text-red-600 font-semibold hover:underline'>
            Xem tất cả
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {products.map((product) => (
            <div
              key={product.id}
              className='bg-white rounded-3xl p-4 shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300'
            >
              <div className='bg-gray-100 rounded-2xl h-56 flex items-center justify-center'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='h-40 object-contain'
                />
              </div>

              <div className='mt-4'>
                <h3 className='text-lg font-bold text-gray-800 min-h-[56px]'>
                  {product.name}
                </h3>

                <div className='mt-2 flex items-center gap-2 flex-wrap'>
                  <span className='text-red-600 text-xl font-bold'>
                    {product.price}
                  </span>

                  <span className='text-gray-400 line-through text-sm'>
                    {product.oldPrice}
                  </span>
                </div>

                <button className='w-full mt-5 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition'>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Laptop section */}
      <section className='max-w-7xl mx-auto px-4 mt-10'>
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-5'>
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-3xl overflow-hidden shadow-md h-full border border-gray-200'>
              <img
                src='01KK8E4NQYFFSS1BRHNV4WXZZP.webp'
                alt='Laptop Banner'
                className='w-full h-full min-h-[500px] object-contain p-4 bg-white'
              />
            </div>
          </div>

          <div className='lg:col-span-4 bg-white rounded-3xl shadow-md p-5'>
            <div className='flex flex-wrap items-center gap-6 border-b pb-4 mb-4 text-sm font-semibold'>
              <button className='text-gray-600 hover:text-red-500 transition'>
              ĐIỆN THOẠI
                </button>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
              {products.map((product) => (
                <div
                  key={product.id}
                  className='border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition'
              >
                  <img
              src={product.image}
              alt={product.name}
              className='w-full h-40 object-contain mb-4'
              />

                  <h3 className='font-semibold text-sm min-h-[40px]'>
            {product.name}
            </h3>

                <div className='mt-3'>
                    <p className='text-red-600 text-xl font-bold'>
                {product.price}
                </p>
                  <p className='text-gray-400 line-through text-sm'>
                {product.oldPrice}
              </p>
            </div>

            <button className='mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition'>
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
      </section>
      <section className='max-w-7xl mx-auto px-4 mt-10'>
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-5'>
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-3xl overflow-hidden shadow-md h-full border border-gray-200'>
              <img
                src='01KK84Q078JE7HEGK1SF3GGZGZ.webp'
                alt='Laptop Banner'
                className='w-full h-full min-h-[500px] object-contain p-4 bg-white'
              />
            </div>
          </div>

          <div className='lg:col-span-4 bg-white rounded-3xl shadow-md p-5'>
            <div className='flex flex-wrap items-center gap-6 border-b pb-4 mb-4 text-sm font-semibold'>
              <button className='text-gray-600 hover:text-red-500 transition'>
              LAPTOP
                </button>
          </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {products.map((product) => (
          <div
            key={product.id}
            className='border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition'
          >
            <img
              src={product.image}
              alt={product.name}
              className='w-full h-40 object-contain mb-4'
            />

            <h3 className='font-semibold text-sm min-h-[40px]'>
              {product.name}
            </h3>

            <div className='mt-3'>
              <p className='text-red-600 text-xl font-bold'>
                {product.price}
              </p>
                    <p className='text-gray-400 line-through text-sm'>
                      {product.oldPrice}
                  </p>
                  </div>

                  <button className='mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition'>
                    Xem chi tiết
                  </button>
                </div>
           ))}
            </div>
          </div>
        </div>
      </section>
<section className='max-w-7xl mx-auto px-4 mt-10'>
  <div className='grid grid-cols-1 lg:grid-cols-5 gap-5'>
    <div className='lg:col-span-1'>
      <div className='bg-white rounded-3xl overflow-hidden shadow-md h-full border border-gray-200'>
        <img
          src='01KG6K3S7WG02MXRFGD9N1WQQE.webp'
          alt='Laptop Banner'
          className='w-full h-full min-h-[500px] object-contain p-4 bg-white'
        />
      </div>
    </div>

    <div className='lg:col-span-4 bg-white rounded-3xl shadow-md p-5'>
      <div className='flex flex-wrap items-center gap-6 border-b pb-4 mb-4 text-sm font-semibold'>
        <button className='text-gray-600 hover:text-red-500 transition'>
          ĐỒNG HỒ
        </button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {products.map((product) => (
          <div
            key={product.id}
            className='border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition'
          >
            <img
              src={product.image}
              alt={product.name}
              className='w-full h-40 object-contain mb-4'
            />

            <h3 className='font-semibold text-sm min-h-[40px]'>
              {product.name}
            </h3>

            <div className='mt-3'>
              <p className='text-red-600 text-xl font-bold'>
                {product.price}
                  </p>
                  <p className='text-gray-400 line-through text-sm'>
                    {product.oldPrice}
                </p>
                  </div>

                  <button className='mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition'>
              Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
          </section>
          <section className='max-w-7xl mx-auto px-4 mt-10'>
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-5'>
              <div className='lg:col-span-1'>
                <div className='bg-white rounded-3xl overflow-hidden shadow-md h-full border border-gray-200'>
                  <img
                    src='01KM2Q70GFVDKYHVN3SR9SWAGK.webp'
                    alt='Laptop Banner'
                    className='w-full h-full min-h-[500px] object-contain p-4 bg-white'
                  />
                </div>
              </div>

              <div className='lg:col-span-4 bg-white rounded-3xl shadow-md p-5'>
                <div className='flex flex-wrap items-center gap-6 border-b pb-4 mb-4 text-sm font-semibold'>
                  <button className='text-gray-600 hover:text-red-500 transition'>
                    PHỤ KIỆN
                  </button>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className='border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition'
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className='w-full h-40 object-contain mb-4'
                      />

                      <h3 className='font-semibold text-sm min-h-[40px]'>
                        {product.name}
                      </h3>

                      <div className='mt-3'>
                        <p className='text-red-600 text-xl font-bold'>
                          {product.price}
                        </p>
                        <p className='text-gray-400 line-through text-sm'>
                          {product.oldPrice}
                        </p>
                      </div>

                      <button className='mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition'>
                        Xem chi tiết
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

      {/* VIDEO SECTION */}
      <section className='max-w-7xl mx-auto px-4 mt-14'>
        <h2 className='text-3xl font-bold mb-8'>
          Video Review Sản Phẩm
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {reviewVideos.map((video, index) => (
            <div
              key={video.id}
              className='bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition'
            >
              <video
                ref={(el) => {
                  if (el) videoRefs.current[index] = el
                }}
                controls
                className='w-full h-60 object-cover bg-black'
                onPlay={() => {
                  setActiveVideo(video.id)

                  videoRefs.current.forEach((item, idx) => {
                    if (idx !== index && item) {
                      item.pause()
                    }
                  })
                }}
                onPause={() => {
                  if (activeVideo === video.id) {
                    setActiveVideo(null)
                  }
                }}
              >
                <source src={video.video} type='video/mp4' />
              </video>

              <div className='p-4'>
                <h3 className='font-bold text-lg'>
                  {video.title}
                </h3>
                <p className='text-gray-500 text-sm mt-2'>
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hàng Cũ Section */}
      <section className='max-w-7xl mx-auto px-4 mt-12'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-3xl font-bold text-gray-800'>Hàng Cũ Giá Tốt</h2>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className='bg-white rounded-3xl p-4 shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 border border-gray-200'
            >
              <div className='relative bg-gray-100 rounded-2xl h-56 flex items-center justify-center'>
                <span className='absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold'>
                  Hàng cũ
                </span>

                <img
                  src='https://via.placeholder.com/300x300?text=iPhone+Cu'
                  alt='Hàng cũ'
                  className='h-40 object-contain'
                />
              </div>

              <div className='mt-4'>
                <h3 className='text-lg font-bold text-gray-800 min-h-[56px]'>
                  iPhone 14 Pro Max 256GB Cũ Đẹp
                </h3>

                <div className='mt-2 flex items-center gap-2 flex-wrap'>
                  <span className='text-red-600 text-xl font-bold'>21.990.000đ</span>
                  <span className='text-gray-400 line-through text-sm'>24.990.000đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hàng Cũ Section */}
      <section className='max-w-7xl mx-auto px-4 mt-12'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-3xl font-bold text-gray-800'>
            Hàng Cũ Giá Tốt
          </h2>

          <button className='text-red-600 font-semibold hover:underline'>
            Xem tất cả
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className='bg-white rounded-3xl p-4 shadow-md hover:shadow-2xl hover:-translate-y-2 transition duration-300 border border-gray-200'
            >
              <div className='relative bg-gray-100 rounded-2xl h-56 flex items-center justify-center'>
                <span className='absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold'>
                  Hàng cũ
                </span>

                <img
                  src='https://via.placeholder.com/300x300?text=iPhone+Cu'
                  alt='Hàng cũ'
                  className='h-40 object-contain'
                />
              </div>

              <div className='mt-4'>
                <h3 className='text-lg font-bold text-gray-800 min-h-[56px]'>
                  iPhone 14 Pro Max 256GB Cũ Đẹp
                </h3>

                <div className='mt-2 flex items-center gap-2 flex-wrap'>
                  <span className='text-red-600 text-xl font-bold'>
                    21.990.000đ
                  </span>

                  <span className='text-gray-400 line-through text-sm'>
                    24.990.000đ
                  </span>
                </div>

                <p className='text-green-600 text-sm mt-2 font-medium'>
                  Bảo hành 6 tháng
                </p>

                <button className='w-full mt-5 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition'>
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>    

      {/* Footer */}
      <footer className='bg-gray-900 text-white mt-12 py-10'>
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3
              onClick={() => window.location.href = '/'}
              className='text-3xl font-bold cursor-pointer'
            >
              SevenStore
            </h3>
            <p className='text-gray-400 mt-3'>
              Website bán điện thoại, laptop và phụ kiện công nghệ.
            </p>
          </div>

          <div>
            <h3 className='text-2xl font-bold mb-4'>Danh mục</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>Điện thoại</li>
              <li>Laptop</li>
              <li>Tablet</li>
              <li>Phụ kiện</li>
            </ul>
          </div>

          <div>
            <h3 className='text-2xl font-bold mb-4'>Liên hệ</h3>
            <p className='text-gray-400'>Email: support@sevenstore.vn</p>
            <p className='text-gray-400'>Hotline: 0123 456 789</p>
          </div>
        </div>
      </footer>

      {/* Scroll To Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className='fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition z-50'
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  )
}

export default App