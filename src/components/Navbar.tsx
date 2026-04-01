import { Smartphone, Laptop, Tablet, Headphones, Watch, Cable, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
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
    {
      name: 'Tai nghe',
      icon: <Headphones size={18} />,
      path: '/category/tai-nghe',
      items: ['AirPods', 'Sony', 'JBL']
    },
    {
      name: 'Đồng hồ',
      icon: <Watch size={18} />,
      path: '/category/dong-ho',
      items: ['Apple Watch', 'Samsung Watch']
    },
    {
      name: 'Phụ kiện',
      icon: <Cable size={18} />,
      path: '/category/phu-kien',
      items: ['Sạc', 'Cáp', 'Pin dự phòng']
    }
  ]

  return (
    <nav className='bg-white border-b shadow-sm sticky top-[72px] z-40'>
      <div className='max-w-7xl mx-auto px-4 flex gap-6 items-center'>
        {menus.map((menu) => (
          <div
            key={menu.name}
            className='relative py-3'
            onMouseEnter={() => setActiveMenu(menu.name)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            {/* MAIN ITEM */}
            <div
              onClick={() => navigate(menu.path)}
              className='flex items-center gap-2 cursor-pointer text-gray-700 hover:text-red-600 font-semibold transition'
            >
              {menu.icon}
              <span>{menu.name}</span>
              <ChevronDown size={14} />
            </div>

            {/* DROPDOWN */}
            {activeMenu === menu.name && (
              <div className='absolute left-0 top-full mt-2 bg-white shadow-xl rounded-xl p-4 min-w-[200px] border z-50 animate-fadeIn'>
                {menu.items.map((item, index) => (
                  <div key={index} className='py-2 px-3 rounded-lg hover:bg-gray-100 cursor-pointer text-sm'>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* EXTRA BADGE */}
        <div className='ml-auto flex items-center gap-4'>
          <span className='bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold'>🔥 Deal hot</span>

          <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold'>🎓 Sinh viên</span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
