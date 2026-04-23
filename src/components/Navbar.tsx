import { Smartphone, Laptop, Tablet, Headphones, Watch, Cable, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const menus = [
    {
      name: 'Điện thoại',
      icon: <Smartphone size={18} />,
      path: '/category/dien-thoai',
      items: ['iPhone', 'Samsung', 'Xiaomi', 'OPPO']
    },
    {
      name: 'Laptop',
      icon: <Laptop size={18} />,
      path: '/category/laptop',
      items: ['MacBook', 'ASUS', 'Acer', 'Dell']
    },
    {
      name: 'Tablet',
      icon: <Tablet size={18} />,
      path: '/category/tablet',
      items: ['iPad', 'Samsung Tab', 'Xiaomi Pad']
    },
    { name: 'Tai nghe', icon: <Headphones size={18} />, path: '/category/tai-nghe', items: ['AirPods', 'Sony', 'JBL'] },
    { name: 'Đồng hồ', icon: <Watch size={18} />, path: '/category/dong-ho', items: ['Apple Watch', 'Samsung Watch'] },
    { name: 'Phụ kiện', icon: <Cable size={18} />, path: '/category/phu-kien', items: ['Sạc', 'Cáp', 'Pin dự phòng'] }
  ]

  return (
    <nav
      className='theme-navbar sticky z-40 border-b shadow-sm backdrop-blur-xl'
      style={{ top: 'var(--header-height, 72px)' }}
    >
      <div className='max-w-7xl mx-auto'>
        {/* LỚP NGOÀI: Tạo vùng cuộn */}
        <div className='overflow-x-auto md:overflow-visible no-scrollbar'>
          {/* LỚP TRONG: Thay đổi chí mạng -> dùng w-max min-w-full */}
          <div className='flex items-center gap-4 md:gap-6 px-4 w-max min-w-full'>
            {menus.map((menu) => (
              <div key={menu.name} className='relative py-4 shrink-0 group'>
                {/* MAIN ITEM */}
                <div
                  onClick={() => navigate(menu.path)}
                  className='theme-navbar-item flex items-center gap-1.5 md:gap-2 cursor-pointer font-semibold transition text-sm md:text-base whitespace-nowrap'
                >
                  {menu.icon}
                  <span>{menu.name}</span>
                  <ChevronDown
                    size={14}
                    className='hidden md:block transition-transform duration-300 group-hover:-rotate-180'
                  />
                </div>

                {/* DROPDOWN */}
                <div className='absolute left-0 top-full z-50 hidden md:group-hover:block animate-fadeIn'>
                  <div className='absolute -top-4 left-0 w-full h-8 bg-transparent'></div>
                  <div className='theme-card shadow-xl rounded-xl p-4 min-w-50 border border-gray-100 dark:border-slate-700 relative mt-1'>
                    {menu.items.map((item, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`${menu.path}?brand=${item.toLowerCase()}`)
                        }}
                        className='theme-navbar-item py-2 px-3 rounded-lg font-medium cursor-pointer text-sm transition-colors whitespace-nowrap'
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* CỤC ĐỆM BẢO VỆ LỀ PHẢI: Ép trình duyệt phải chừa ra một khoảng cách ở cuối */}
            <div className='w-6 h-1 shrink-0 md:hidden'></div>

            {/* EXTRA BADGE */}
            <div className='ml-auto hidden lg:flex items-center gap-4 shrink-0'>
              <span className='theme-navbar-chip px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap'>
                🔥 Deal hot
              </span>
              <span className='theme-navbar-chip theme-navbar-chip-green px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap'>
                🎓 Sinh viên
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  )
}

export default Navbar
