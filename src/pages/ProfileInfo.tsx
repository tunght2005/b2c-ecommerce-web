import { useState, useEffect } from 'react'
import { User, Mail, Phone, ShieldCheck, Lock, Eye, EyeOff, X, CheckCircle } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'
import Seo from '../components/Seo'

interface UserProfile {
  username?: string
  email?: string
  phone?: string
  _id?: string
}

export default function ProfileInfo() {
  const [profile, setProfile] = useState<UserProfile>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // --- State Form chỉnh sửa ---
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')

  // --- State Modal Đổi Mật Khẩu ---
  const [isPwModalOpen, setIsPwModalOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [isChangingPw, setIsChangingPw] = useState(false)

  // --- Load Profile từ BE ---
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const res = await fetchClient<unknown>('/user/profile')
        // Vét cạn mọi format JSON Backend có thể trả về
        let data: UserProfile = {}
        if (res && typeof res === 'object') {
          const r = res as Record<string, unknown>
          // Có thể là: { data: {...} }, { user: {...} }, { profile: {...} } hoặc trực tiếp là object
          if (r.data && typeof r.data === 'object') data = r.data as UserProfile
          else if (r.user && typeof r.user === 'object') data = r.user as UserProfile
          else if (r.profile && typeof r.profile === 'object') data = r.profile as UserProfile
          else if (r.username || r.email || r._id) data = r as unknown as UserProfile
        }
        setProfile(data)
        setUsername((data.username as string) || '')
        setPhone((data.phone as string) || '')
      } catch (e) {
        console.error('Lỗi tải hồ sơ', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  // --- Lưu thông tin Profile ---
  const handleSaveProfile = async () => {
    if (!username.trim()) {
      alert('Họ và tên không được để trống!')
      return
    }
    setIsSaving(true)
    try {
      await fetchClient('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ username, phone })
      })
      setProfile((prev) => ({ ...prev, username, phone }))

      // Cập nhật lại localStorage để Header & Sidebar đồng bộ tên mới
      const raw = localStorage.getItem('userInfo')
      if (raw) {
        try {
          const info = JSON.parse(raw)
          localStorage.setItem('userInfo', JSON.stringify({ ...info, username, phone }))
          window.dispatchEvent(new Event('authChange'))
        } catch {
          /* skip */
        }
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Lỗi Server'
      alert('Lưu thất bại: ' + msg)
    } finally {
      setIsSaving(false)
    }
  }

  // --- Đổi Mật Khẩu ---
  const handleChangePassword = async () => {
    setPwError('')
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('Vui lòng điền đầy đủ tất cả các trường!')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Mật khẩu mới và xác nhận không khớp nhau!')
      return
    }
    if (newPassword.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }
    setIsChangingPw(true)
    try {
      await fetchClient('/user/change-password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
      })
      setPwSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPwSuccess(false)
        setIsPwModalOpen(false)
      }, 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Mật khẩu cũ có thể không đúng'
      setPwError('Đổi mật khẩu thất bại: ' + msg)
    } finally {
      setIsChangingPw(false)
    }
  }

  if (isLoading) {
    return (
      <div className='bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-75'>
        <p className='text-gray-400 animate-pulse font-medium'>Đang tải hồ sơ...</p>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100'>
      <Seo
        title='Hồ sơ cá nhân'
        description='Quản lý thông tin cá nhân và bảo mật tài khoản 7Store.'
        keywords='hồ sơ cá nhân, tài khoản, 7Store'
        canonicalPath='/profile'
      />
      <div className='flex justify-between items-center mb-8 border-b border-gray-100 pb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Hồ sơ của tôi <ShieldCheck className='text-blue-500' size={24} />
          </h1>
          <p className='text-gray-500 mt-2 text-sm'>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>
      </div>

      <form className='max-w-2xl space-y-6' onSubmit={(e) => e.preventDefault()}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Tên */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Họ và Tên</label>
            <div className='relative'>
              <User className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900 font-medium'
              />
            </div>
          </div>

          {/* SĐT */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Số điện thoại</label>
            <div className='relative'>
              <Phone className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-gray-900 font-medium'
              />
            </div>
          </div>
        </div>

        {/* Email (chỉ đọc) */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Email (không thể đổi)</label>
          <div className='relative'>
            <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
            <input
              type='email'
              value={profile.email || ''}
              readOnly
              className='w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 outline-none text-gray-500 font-medium cursor-not-allowed'
            />
          </div>
          <p className='text-xs text-gray-400 pl-1'>Email được dùng để đăng nhập và không thể thay đổi.</p>
        </div>

        {/* Nút hành động */}
        <div className='pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center'>
          <button
            type='button'
            onClick={handleSaveProfile}
            disabled={isSaving}
            className='px-8 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-60 flex items-center gap-2'
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button
            type='button'
            onClick={() => {
              setIsPwModalOpen(true)
              setPwError('')
              setPwSuccess(false)
            }}
            className='px-6 py-3.5 border border-gray-200 font-bold rounded-2xl text-gray-600 hover:bg-gray-50 transition flex items-center gap-2'
          >
            <Lock size={16} /> Đổi mật khẩu
          </button>
          {saveSuccess && (
            <span className='flex items-center gap-1.5 text-green-600 font-semibold text-sm animate-pulse'>
              <CheckCircle size={18} /> Lưu thành công!
            </span>
          )}
        </div>
      </form>

      {/* ========== MODAL ĐỔI MẬT KHẨU ========== */}
      {isPwModalOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-300 flex items-center justify-center p-4'
          onClick={() => setIsPwModalOpen(false)}
        >
          <div
            className='bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPwModalOpen(false)}
              className='absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition'
            >
              <X size={22} />
            </button>

            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-100'>
              <div className='w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center'>
                <Lock size={22} className='text-red-600' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Đổi mật khẩu</h2>
                <p className='text-xs text-gray-400 mt-0.5'>Giữ tài khoản của bạn an toàn</p>
              </div>
            </div>

            {pwSuccess ? (
              <div className='flex flex-col items-center justify-center py-10 gap-3'>
                <CheckCircle className='text-green-500' size={56} />
                <p className='font-bold text-green-600 text-lg'>Đổi mật khẩu thành công!</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Mật khẩu cũ */}
                {[
                  {
                    label: 'Mật khẩu hiện tại',
                    value: oldPassword,
                    setValue: setOldPassword,
                    show: showOld,
                    setShow: setShowOld
                  },
                  {
                    label: 'Mật khẩu mới',
                    value: newPassword,
                    setValue: setNewPassword,
                    show: showNew,
                    setShow: setShowNew
                  },
                  {
                    label: 'Xác nhận mật khẩu mới',
                    value: confirmPassword,
                    setValue: setConfirmPassword,
                    show: showConfirm,
                    setShow: setShowConfirm
                  }
                ].map(({ label, value, setValue, show, setShow }) => (
                  <div key={label} className='space-y-1.5'>
                    <label className='text-sm font-semibold text-gray-700'>{label}</label>
                    <div className='relative'>
                      <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={16} />
                      <input
                        type={show ? 'text' : 'password'}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder='••••••••'
                        className='w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-gray-50 focus:bg-white transition-all text-sm'
                      />
                      <button
                        type='button'
                        onClick={() => setShow(!show)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700'
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwError && (
                  <p className='text-red-500 text-sm font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-2.5'>
                    ⚠️ {pwError}
                  </p>
                )}

                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={() => setIsPwModalOpen(false)}
                    className='flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition'
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPw}
                    className='flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-60'
                  >
                    {isChangingPw ? 'Đang cập nhật...' : 'Xác nhận đổi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
