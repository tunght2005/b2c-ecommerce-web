import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition z-10"
        >
          <X size={24} />
        </button>

        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-semibold transition ${
              view === 'login' ? 'text-[#E7000B] border-b-2 border-[#E7000B]' : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setView('login')}
          >
            Đăng nhập
          </button>
          <button
            className={`flex-1 py-4 text-center font-semibold transition ${
              view === 'register' ? 'text-[#E7000B] border-b-2 border-[#E7000B]' : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setView('register')}
          >
            Đăng ký
          </button>
        </div>

        <div className="p-6">
          {view === 'login' ? (
            <form key="login-form" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="email" placeholder="Email/Tên đăng nhập/SĐT" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="password" placeholder="Nhập mật khẩu" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-[#E7000B] hover:underline">Quên mật khẩu?</a>
              </div>
              <button type="submit" className="w-full bg-[#E7000B] text-white py-2.5 rounded-lg font-medium hover:bg-[#C10008] transition">
                Đăng nhập
              </button>
            </form>
          ) : (
            <form key="register-form" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="text" placeholder="Nhập họ và tên đầy đủ" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="email" placeholder="Nhập email của bạn" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="tel" placeholder="Nhập số điện thoại (ví dụ: 0912 345 678)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="password" placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-[#E7000B] focus:ring-[#E7000B] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-gray-900 cursor-pointer">
                  Tôi đồng ý với các <a href="#" className="text-[#E7000B] hover:underline">điều khoản dịch vụ</a>
                </label>
              </div>
              <button type="submit" className="w-full bg-[#E7000B] text-white py-2.5 rounded-lg font-medium hover:bg-[#C10008] transition">
                Tạo tài khoản
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;