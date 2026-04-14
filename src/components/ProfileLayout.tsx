import { NavLink, Outlet } from 'react-router-dom';
import { User, Package, Bell, LogOut, Camera } from 'lucide-react';

export default function ProfileLayout() {
  const menuItems = [
    { name: 'Quản lý tài khoản', path: '/profile', icon: User, exact: true },
    { name: 'Đơn mua của tôi', path: '/profile/orders', icon: Package, exact: false },
    { name: 'Thông báo', path: '/profile/notifications', icon: Bell, exact: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <h2 className="font-bold text-lg text-gray-900">Huong Tran</h2>
            <p className="text-sm text-gray-500 mt-1">Khách hàng thành viên</p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
                    isActive 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                {item.name}
              </NavLink>
            ))}

            <div className="my-2 border-t border-gray-50"></div>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0">
          <div className="bg-white md:bg-transparent rounded-3xl md:rounded-none p-4 md:p-0 shadow-sm md:shadow-none border border-gray-100 md:border-none h-full">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}
