import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, Loader2 } from 'lucide-react';
import { fetchClient } from '../api/fetchClient';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '../api/config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: Record<string, unknown>;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setView(initialView);
    setErrorMsg('');
  }, [initialView, isOpen]);

  // Handle Login Flow
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await fetchClient<LoginResponse>('/auth/login', {
        method: 'POST',
        data: { email, password } 
      });
      // Save tokens
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      if(res.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(res.user));
      
      // Update global layout (e.g Header avatar)
      window.dispatchEvent(new Event('authChange'));
      
      onClose(); // auto close modal
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Flow
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await fetchClient<unknown>('/auth/register', {
        method: 'POST',
        data: { username, email, password, phone, role: 'customer' }
      });
      // Switch back to login page if success
      setView('login');
      setErrorMsg('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Đăng ký thất bại. Email hoặc tài khoản đã tồn tại.');
    } finally {
      setIsLoading(false);
    }
  };

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
          {errorMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${errorMsg.includes('thành công') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-[#E7000B] border border-red-200'}`}>
              {errorMsg}
            </div>
          )}
          
          {view === 'login' ? (
            <form key="login-form" className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng nhập</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email của bạn" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-[#E7000B] hover:underline">Quên mật khẩu?</a>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-[#E7000B] text-white py-2.5 rounded-lg font-medium hover:bg-[#C10008] transition disabled:opacity-70">
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                Đăng nhập
              </button>
            </form>
          ) : (
            <form key="register-form" className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản (Username)</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nhập username" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email của bạn" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại (ví dụ: 0912 345 678)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E7000B] outline-none text-gray-900 placeholder-gray-400 bg-white" required />
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
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-[#E7000B] text-white py-2.5 rounded-lg font-medium hover:bg-[#C10008] transition disabled:opacity-70">
                {isLoading && <Loader2 size={18} className="animate-spin" />}
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