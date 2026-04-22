import { ChevronRight, LogOut, User, Package } from 'lucide-react'

interface UserPopoverProps {
  open: boolean
  user: { username?: string; email?: string; avatar?: string } | null
  onProfile: () => void
  onOrders: () => void
  onLogout: () => void
}

export default function UserPopover({ open, user, onProfile, onOrders, onLogout }: UserPopoverProps) {
  if (!open) return null

  return (
    <div className='absolute right-0 top-full z-50 mt-3 w-75 overflow-hidden rounded-3xl border border-white/20 bg-white text-gray-900 shadow-2xl shadow-black/20'>
      <div className='flex items-center gap-3 border-b border-gray-100 bg-linear-to-r from-red-50 to-white px-4 py-4'>
        <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-500'>
          {user?.avatar ? (
            <img src={user.avatar} alt='Avatar' className='h-full w-full object-cover' />
          ) : (
            <User size={22} />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-bold text-gray-900'>{user?.username || 'Người dùng'}</p>
          <p className='truncate text-xs text-gray-500'>{user?.email || 'Tài khoản khách hàng'}</p>
        </div>
      </div>

      <div className='p-3'>
        <button
          onClick={onProfile}
          className='flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-gray-50'
        >
          <span className='flex items-center gap-3 font-semibold text-gray-700'>
            <User size={18} /> Hồ sơ của tôi
          </span>
          <ChevronRight size={16} className='text-gray-400' />
        </button>

        <button
          onClick={onOrders}
          className='mt-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-gray-50'
        >
          <span className='flex items-center gap-3 font-semibold text-gray-700'>
            <Package size={18} /> Đơn mua của tôi
          </span>
          <ChevronRight size={16} className='text-gray-400' />
        </button>

        <div className='my-3 border-t border-gray-100' />

        <button
          onClick={onLogout}
          className='flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-red-50'
        >
          <span className='flex items-center gap-3 font-semibold text-red-600'>
            <LogOut size={18} /> Đăng xuất
          </span>
          <ChevronRight size={16} className='text-red-300' />
        </button>
      </div>
    </div>
  )
}
