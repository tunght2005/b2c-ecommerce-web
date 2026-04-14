import { User, Mail, Phone, Calendar, ShieldCheck, MapPin } from 'lucide-react';

export default function ProfileInfo() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Hồ sơ của tôi <ShieldCheck className="text-blue-500" size={24} />
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>
      </div>

      <form className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Họ và Tên</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                defaultValue="Huong Tran" 
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* SĐT */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="tel" 
                defaultValue="0912345678" 
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900 font-medium"
              />
            </div>
            <p className="text-xs text-green-600 mt-1 pl-1">Đã xác minh</p>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email liên hệ</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" 
              defaultValue="huong.tran@antigravity.vn" 
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Ngày sinh */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="date" 
              defaultValue="2000-01-01" 
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900 font-medium"
            />
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <MapPin className="text-red-500" size={22} /> Địa chỉ giao hàng mặc định
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Người nhận hàng</label>
              <input 
                type="text" 
                defaultValue="Huong Tran" 
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900 font-medium"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                <input type="text" defaultValue="Hà Nội" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none text-gray-900 font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quận/Huyện</label>
                <input type="text" defaultValue="Quận Đống Đa" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none text-gray-900 font-medium" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Địa chỉ cụ thể (Số nhà, Tên đường)</label>
              <input type="text" defaultValue="Tòa nhà Antigravity, Ngõ 123" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none text-gray-900 font-medium" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4">
          <button type="button" className="px-8 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-200">
            Lưu thay đổi
          </button>
          <button type="button" className="px-6 py-3.5 border border-gray-200 font-bold rounded-2xl text-gray-600 hover:bg-gray-50 transition">
            Đổi mật khẩu
          </button>
        </div>
      </form>
    </div>
  );
}
