import { useState, useEffect, useRef } from 'react'

function Banner() {
  const [current, setCurrent] = useState(0)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  const mainBanners = [
    '/690x300_open_iPhone 17e.webp',
    '/690x300_ROI_MacBookNeo.webp',
    '/oppofingn6.webp',
  ]

  // LEFT small
  const leftBanners = [
    {
      title: '🎓 Ưu đãi sinh viên',
      desc: 'Giảm đến 30% laptop + phụ kiện',
    },
    {
      title: '💻 Laptop giảm sâu',
      desc: 'Deal khủng chỉ từ 9.9tr',
    },
  ]

  // RIGHT đẹp hơn
  const rightBanners = [
    {
      title: 'iPhone trợ giá',
      highlight: 'Đến 3 TRIỆU',
      bg: 'from-pink-500 to-red-500',
    },
    {
      title: 'Samsung giảm sốc',
      highlight: 'Đến 4 TRIỆU',
      bg: 'from-blue-500 to-indigo-500',
    },
  ]

  const bottomSlider = [
    '/banner1.webp',
    '/banner2.webp',
    '/banner3.webp',
    '/banner4.webp',
    '/banner5.webp',
    '/banner6.webp',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % mainBanners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return

    sliderRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    })
  }

  return (
    <section className='max-w-7xl mx-auto px-4 mt-6 space-y-4'>

      {/* TOP */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>

        {/* LEFT */}
        <div className='space-y-4'>
          <div className='bg-white p-4 rounded-2xl shadow'>
            <h3 className='font-bold text-sm'>
              Chào mừng đến SevenStore
            </h3>
            <p className='text-gray-500 text-xs mt-2'>
              Đăng ký để nhận ưu đãi hấp dẫn
            </p>

            <button className='mt-3 w-full bg-red-500 text-white py-2 rounded-lg'>
              Đăng nhập / Đăng ký
            </button>
          </div>

          {leftBanners.map((item, i) => (
            <div
              key={i}
              className='bg-white p-4 rounded-xl shadow hover:shadow-lg transition'
            >
              <p className='font-semibold text-sm'>{item.title}</p>
              <p className='text-xs text-gray-500 mt-1'>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div className='lg:col-span-2 relative bg-white rounded-2xl overflow-hidden shadow'>
          <img
            src={mainBanners[current]}
            className='w-full h-[320px] object-cover transition'
          />

          {/* dots */}
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
            {mainBanners.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full cursor-pointer ${
                  i === current ? 'bg-red-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT (🔥 nâng cấp đẹp) */}
        <div className='grid grid-cols-1 gap-4'>
          {rightBanners.map((item, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl text-white shadow-lg bg-gradient-to-r ${item.bg} hover:scale-105 transition`}
            >
              <p className='text-sm opacity-90'>📱 {item.title}</p>

              <h3 className='text-xl font-bold mt-1'>
                {item.highlight}
              </h3>

              <p className='text-xs mt-2 opacity-80'>
                Áp dụng ngay hôm nay
              </p>

              <button className='mt-3 bg-white text-black text-xs px-3 py-1 rounded-lg font-semibold'>
                Xem ngay
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SLIDER DƯỚI */}
      <div className='relative'>

        <button
          onClick={() => scroll('left')}
          className='absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10'
        >
          ◀
        </button>

        <div
          ref={sliderRef}
          className='flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8'
        >
          {bottomSlider.map((img, index) => (
            <img
              key={index}
              src={img}
              className='min-w-[220px] h-[120px] object-cover rounded-xl shadow hover:scale-105 transition cursor-pointer'
            />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className='absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10'
        >
          ▶
        </button>
      </div>

    </section>
  )
}

export default Banner