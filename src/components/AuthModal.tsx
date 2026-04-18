import React, { useState, useEffect } from 'react'
import { X, Mail, Lock, User as UserIcon, Phone, Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '../api/config'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: 'login' | 'register'
}

interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: Record<string, unknown>
}

// ——— Validation helpers ———
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})$/

function validateLogin(email: string, password: string) {
  const errors: Record<string, string> = {}
  if (!email) errors.email = 'Email không được để trống.'
  else if (!emailRegex.test(email)) errors.email = 'Email không hợp lệ (VD: ten@gmail.com).'
  if (!password) errors.password = 'Mật khẩu không được để trống.'
  else if (password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự.'
  return errors
}

function validateRegister(username: string, email: string, phone: string, password: string, confirmPassword: string) {
  const errors: Record<string, string> = {}
  if (!username) errors.username = 'Tên tài khoản không được để trống.'
  else if (username.length < 3) errors.username = 'Tên tài khoản tối thiểu 3 ký tự.'
  else if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.username = 'Chỉ dùng chữ, số và dấu gạch dưới.'
  if (!email) errors.email = 'Email không được để trống.'
  else if (!emailRegex.test(email)) errors.email = 'Email không hợp lệ (VD: ten@gmail.com).'
  if (!phone) errors.phone = 'Số điện thoại không được để trống.'
  else if (!phoneRegex.test(phone.replace(/\s/g, ''))) errors.phone = 'SĐT không hợp lệ (VD: 0912 345 678).'
  if (!password) errors.password = 'Mật khẩu không được để trống.'
  else if (password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự.'
  if (!confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
  else if (confirmPassword !== password) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  return errors
}

// Password strength
function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { level: 1, label: 'Rất yếu', color: 'bg-red-500' }
  if (score <= 2) return { level: 2, label: 'Yếu', color: 'bg-orange-400' }
  if (score <= 3) return { level: 3, label: 'Trung bình', color: 'bg-yellow-400' }
  if (score <= 4) return { level: 4, label: 'Mạnh', color: 'bg-green-400' }
  return { level: 5, label: 'Rất mạnh', color: 'bg-green-600' }
}

// ——— Sub-component: Input field with inline error ———
function Field({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  rightSlot
}: {
  label: string
  icon: React.ReactNode
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  rightSlot?: React.ReactNode
}) {
  const hasError = !!error
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>
      <div className='relative'>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none'>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-${rightSlot ? '10' : '4'} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
            ${
              hasError
                ? 'border-red-400 focus:ring-red-200 bg-red-50 text-gray-900'
                : 'border-gray-300 focus:ring-red-200 focus:border-red-400 bg-white text-gray-900'
            }
          `}
        />
        {rightSlot && <span className='absolute right-3 top-1/2 -translate-y-1/2'>{rightSlot}</span>}
      </div>
      {hasError && (
        <p className='mt-1 text-xs text-red-500 flex items-center gap-1'>
          <AlertCircle size={11} className='flex-shrink-0' />
          {error}
        </p>
      )}
    </div>
  )
}

// ——— Main Component ———
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'register'>(initialView)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [serverError, setServerError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset khi đổi tab hoặc mở lại modal
  useEffect(() => {
    setView(initialView)
    setServerError('')
    setSuccessMsg('')
    setFieldErrors({})
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setUsername('')
    setPhone('')
  }, [initialView, isOpen])

  const passwordStrength = getPasswordStrength(password)

  // ——— Handle Login ———
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    setSuccessMsg('')
    const errors = validateLogin(email, password)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setIsLoading(true)
    try {
      const res = await fetchClient<LoginResponse>('/auth/login', {
        method: 'POST',
        data: { email, password }
      })
      localStorage.setItem(TOKEN_KEY, res.accessToken)
      if (res.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken)
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(res.user))
      window.dispatchEvent(new Event('authChange'))
      onClose()
    } catch (err: unknown) {
      const error = err as Error
      setServerError(error.message || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  // ——— Handle Register ———
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    setSuccessMsg('')
    const errors = validateRegister(username, email, phone, password, confirmPassword)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setIsLoading(true)
    try {
      await fetchClient<unknown>('/auth/register', {
        method: 'POST',
        data: { username, email, password, phone, role: 'customer' }
      })
      setView('login')
      setSuccessMsg('🎉 Đăng ký thành công! Vui lòng đăng nhập.')
    } catch (err: unknown) {
      const error = err as Error
      setServerError(error.message || 'Email hoặc tài khoản đã tồn tại.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-[800px] flex overflow-hidden relative'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 md:right-6 text-gray-400 hover:text-gray-700 transition z-50 bg-white rounded-full p-1.5 md:p-1 border md:border-none opacity-80 hover:opacity-100 hover:bg-gray-100'
        >
          <X size={24} />
        </button>

        {/* LEFT COLUMN: FORM */}
        <div className='w-full md:w-[500px] p-6 sm:p-10 flex flex-col justify-center min-h-[500px] relative overflow-y-auto max-h-[90vh]'>
          <h2 className='text-3xl font-medium mb-1'>{view === 'login' ? 'Xin chào,' : 'Tạo tài khoản,'}</h2>
          <p className='text-sm text-gray-600 mb-8'>
            {view === 'login' ? 'Đăng nhập hoặc Tạo tài khoản' : 'Nhập thông tin bên dưới để đăng ký'}
          </p>

          {/* Server messages */}
          {successMsg && (
            <div className='mb-4 p-3 rounded-xl text-sm font-medium bg-green-50 text-green-700 border border-green-200 flex items-center gap-2'>
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}
          {serverError && (
            <div className='mb-4 p-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200 flex items-center gap-2'>
              <AlertCircle size={16} /> {serverError}
            </div>
          )}

          {/* ——— LOGIN FORM ——— */}
          {view === 'login' ? (
            <form key='login-form' className='space-y-4' onSubmit={handleLogin} noValidate>
              <Field
                label='Email đăng nhập'
                icon={<Mail size={16} />}
                type='email'
                value={email}
                onChange={setEmail}
                placeholder='ten@gmail.com'
                error={fieldErrors.email}
              />
              <Field
                label='Mật khẩu'
                icon={<Lock size={16} />}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder='Tối thiểu 6 ký tự'
                error={fieldErrors.password}
                rightSlot={
                  <button
                    type='button'
                    onClick={() => setShowPassword((v) => !v)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center items-center gap-2 bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 transition disabled:opacity-60 shadow-md shadow-red-100'
              >
                {isLoading && <Loader2 size={18} className='animate-spin' />}
                {isLoading ? 'Đang đăng nhập...' : 'Tiếp Tục'}
              </button>

              <div className='text-center mt-3'>
                <button
                  type='button'
                  onClick={() => setView('register')}
                  className='text-sm text-blue-600 hover:underline'
                >
                  Chưa có tài khoản? Tạo tài khoản ngay
                </button>
              </div>
            </form>
          ) : (
            /* ——— REGISTER FORM ——— */
            <form key='register-form' className='space-y-3.5' onSubmit={handleRegister} noValidate>
              <Field
                label='Tên tài khoản'
                icon={<UserIcon size={16} />}
                value={username}
                onChange={setUsername}
                placeholder='Tối thiểu 3 ký tự, không dấu'
                error={fieldErrors.username}
              />
              <Field
                label='Email'
                icon={<Mail size={16} />}
                type='email'
                value={email}
                onChange={setEmail}
                placeholder='ten@gmail.com'
                error={fieldErrors.email}
              />
              <Field
                label='Số điện thoại'
                icon={<Phone size={16} />}
                type='tel'
                value={phone}
                onChange={setPhone}
                placeholder='0912 345 678'
                error={fieldErrors.phone}
              />
              {/* Password + strength */}
              <div>
                <Field
                  label='Mật khẩu'
                  icon={<Lock size={16} />}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder='Tối thiểu 6 ký tự'
                  error={fieldErrors.password}
                  rightSlot={
                    <button
                      type='button'
                      onClick={() => setShowPassword((v) => !v)}
                      className='text-gray-400 hover:text-gray-600'
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                {password && (
                  <div className='mt-1.5'>
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className='text-[11px] text-gray-500 mt-0.5'>
                      Độ mạnh: <span className='font-medium'>{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>
              <Field
                label='Xác nhận mật khẩu'
                icon={<Lock size={16} />}
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder='Nhập lại mật khẩu'
                error={fieldErrors.confirmPassword}
                rightSlot={
                  <button
                    type='button'
                    onClick={() => setShowConfirm((v) => !v)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <div className='flex items-start gap-2 pt-1'>
                <input
                  id='terms'
                  type='checkbox'
                  required
                  className='mt-0.5 h-4 w-4 text-[#E7000B] focus:ring-[#E7000B] border-gray-300 rounded cursor-pointer flex-shrink-0'
                />
                <label htmlFor='terms' className='text-sm text-gray-600 cursor-pointer leading-snug'>
                  Tôi đồng ý với{' '}
                  <a href='#' className='text-[#E7000B] hover:underline'>
                    điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a href='#' className='text-[#E7000B] hover:underline'>
                    chính sách bảo mật
                  </a>
                </label>
              </div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 transition disabled:opacity-60 shadow-md shadow-red-100'
              >
                {isLoading && <Loader2 size={18} className='animate-spin' />}
                Đăng ký
              </button>

              <div className='text-center mt-3'>
                <button
                  type='button'
                  onClick={() => setView('login')}
                  className='text-sm text-blue-600 hover:underline'
                >
                  Đã có tài khoản? Đăng nhập ngay
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: BRANDING (TIKI STYLE) */}
        <div className='hidden md:flex md:w-[300px] flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-red-50 to-red-100/30'>
          <div className='w-48 h-48 mb-6 relative'>
            {/* Vòng sáng quanh logo */}
            <div className='absolute inset-0 bg-red-100 rounded-full mix-blend-multiply filter blur-2xl animate-pulse opacity-60'></div>
            <img src='/logo.svg' alt='SevenStore' className='w-full h-full object-contain relative z-10' />
          </div>
          <h3 className='text-red-600 font-medium text-xl mb-2 mt-4'>Mua sắm tại SevenStore</h3>
          <p className='text-red-500 text-sm'>Siêu ưu đãi mỗi ngày</p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
