import { useState, useEffect, useRef } from 'react'
import { fetchClient } from '../api/fetchClient'
import { resolveImageUrl } from '../api/config'

interface BannerType {
  _id: string
  title: string
  image_url?: string
  image?: string
  link?: string
}

function Banner() {
  const [current, setCurrent] = useState(0)
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [apiBanners, setApiBanners] = useState<BannerType[]>([])

  const defaultBanners = ['/690x300_open_iPhone 17e.webp', '/690x300_ROI_MacBookNeo.webp', '/oppofingn6.webp']

  const mainBanners =
    apiBanners.length > 0 ? apiBanners.map((b) => resolveImageUrl(b.image_url || b.image || '')) : defaultBanners

  // LEFT small
  const leftBanners = [
    {
      title: '🎓 Ưu đãi sinh viên',
      desc: 'Giảm đến 30% laptop + phụ kiện'
    },
    {
      title: '💻 Laptop giảm sâu',
      desc: 'Deal khủng chỉ từ 9.9tr'
    }
  ]

  // RIGHT đẹp hơn
  const rightBanners = [
    {
      title: 'iPhone trợ giá',
      highlight: 'Đến 3 TRIỆU',
      bg: 'from-pink-500 to-red-500'
    },
    {
      title: 'Samsung giảm sốc',
      highlight: 'Đến 4 TRIỆU',
      bg: 'from-blue-500 to-indigo-500'
    }
  ]

  const bottomSlider = [
    '/banner1.webp',
    '/banner2.webp',
    '/banner3.webp',
    '/banner4.webp',
    '/banner5.webp',
    '/banner6.webp'
  ]

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await fetchClient<any>('/banners')
        let data: any[] = []
        if (Array.isArray(res)) data = res
        else if (res?.data && Array.isArray(res.data)) data = res.data
        else if (res?.data?.items && Array.isArray(res.data.items)) data = res.data.items
        else if (res?.data?.banners && Array.isArray(res.data.banners)) data = res.data.banners
        else if (res?.banners && Array.isArray(res.banners)) data = res.banners

        // Chỉ lấy những banner đang active (để đề phòng BE trả cả inactive)
        const activeBanners = data.filter((b: any) => b.is_active !== false)
        setApiBanners(activeBanners)
      } catch (err) {
        console.error('Lỗi khi tải Banner:', err)
      }
    }
    loadBanners()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % mainBanners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [mainBanners.length])

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return

    sliderRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth'
    })
  }

  // HÀM PHÁT SỰ KIỆN MỞ MODAL
  const triggerAuthModal = () => {
    window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { view: 'login' } }))
  }

  return (
    <section className='max-w-7xl mx-auto px-4 mt-6 space-y-4'>
      {/* TOP */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
        {/* LEFT */}
        <div className='space-y-4'>
          <div className='bg-white p-4 rounded-2xl shadow'>
            <h3 className='font-bold text-sm'>Chào mừng đến SevenStore</h3>
            <p className='text-gray-500 text-xs mt-2'>Đăng ký để nhận ưu đãi hấp dẫn</p>

            {/* GẮN SỰ KIỆN VÀO NÚT NÀY */}
            <button
              onClick={triggerAuthModal}
              className='mt-3 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition'
            >
              Đăng nhập / Đăng ký
            </button>
          </div>

          {/* Ẩn các banner phụ bên trái trên mobile để đỡ dài màn hình, chỉ hiện trên màn hình to (lg:block) */}
          <div className='hidden lg:block space-y-4'>
            {leftBanners.map((item, i) => (
              <div key={i} className='bg-white p-4 rounded-xl shadow hover:shadow-lg transition'>
                <p className='font-semibold text-sm'>{item.title}</p>
                <p className='text-xs text-gray-500 mt-1'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className='lg:col-span-2 relative bg-white rounded-2xl overflow-hidden shadow'>
          {/* Chỉnh lại chiều cao cho phù hợp Mobile vs Desktop */}
          <img src={mainBanners[current]} className='w-full h-[200px] lg:h-[320px] object-cover transition' />

          {/* dots */}
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
            {mainBanners.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full cursor-pointer ${i === current ? 'bg-red-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT (🔥 nâng cấp đẹp) - Xếp 2 cột ngang trên Mobile, 1 cột dọc trên Desktop */}
        <div className='grid grid-cols-2 lg:grid-cols-1 gap-4'>
          {rightBanners.map((item, i) => (
            <div
              key={i}
              className={`p-3 lg:p-4 rounded-2xl text-white shadow-lg bg-gradient-to-r ${item.bg} hover:scale-105 transition flex flex-col justify-center`}
            >
              <p className='text-xs lg:text-sm opacity-90'>📱 {item.title}</p>
              <h3 className='text-sm sm:text-lg lg:text-xl font-bold mt-1'>{item.highlight}</h3>
              <p className='hidden lg:block text-xs mt-2 opacity-80'>Áp dụng ngay hôm nay</p>
              <button className='mt-2 lg:mt-3 bg-white text-black text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-lg font-semibold w-fit'>
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
          className='absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 hidden sm:block'
        >
          ◀
        </button>

        {/* Thêm no-scrollbar và thu nhỏ kích thước ảnh trên mobile */}
        <div ref={sliderRef} className='flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-2 sm:px-8'>
          {bottomSlider.map((img, index) => (
            <img
              key={index}
              src={img}
              className='min-w-[160px] sm:min-w-[220px] h-[80px] sm:h-[120px] object-cover rounded-xl shadow hover:scale-105 transition cursor-pointer'
            />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className='absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 hidden sm:block'
        >
          ▶
        </button>
      </div>

      {/* Ẩn thanh cuộn */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

export default Banner
