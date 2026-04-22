import { Bell, ChevronRight } from 'lucide-react'

interface NotificationItem {
  _id: string
  title?: string
  content?: string
  is_read?: boolean
  createdAt?: string
}

interface NotificationPopoverProps {
  open: boolean
  loading?: boolean
  items: NotificationItem[]
  unreadCount: number
  onOpenAll: () => void
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
}

const formatTime = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}

export default function NotificationPopover({
  open,
  loading = false,
  items,
  unreadCount,
  onOpenAll,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationPopoverProps) {
  if (!open) return null

  const visibleItems = items
    .filter((item) => !item.is_read)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  return (
    <div className='absolute right-0 top-full z-50 mt-3 w-90 overflow-hidden rounded-3xl border border-white/20 bg-white text-gray-900 shadow-2xl shadow-black/20'>
      <div className='flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-red-50 to-white px-4 py-4'>
        <div>
          <p className='text-sm font-black uppercase tracking-[0.22em] text-red-500'>Thông báo</p>
          <p className='text-xs text-gray-500'>{unreadCount} chưa đọc</p>
        </div>
        <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-600'>
          <Bell size={20} />
        </div>
      </div>

      <div className='max-h-90 overflow-auto px-3 py-3'>
        {loading ? (
          <div className='py-10 text-center text-sm text-gray-500'>Đang tải thông báo...</div>
        ) : visibleItems.length > 0 ? (
          <div className='space-y-2'>
            {visibleItems.map((item) => (
              <button
                key={item._id}
                type='button'
                onClick={() => onMarkAsRead?.(item._id)}
                className='w-full rounded-2xl border border-gray-100 px-3 py-3 text-left transition hover:border-red-100 hover:bg-red-50/40'
              >
                <div className='flex items-start justify-between gap-2'>
                  <p className='line-clamp-1 text-sm font-semibold text-gray-900'>{item.title || 'Thông báo mới'}</p>
                  {!item.is_read ? <span className='mt-1 h-2.5 w-2.5 rounded-full bg-red-500' /> : null}
                </div>
                <p className='mt-1 line-clamp-2 text-xs text-gray-500'>
                  {item.content || 'Bạn có một thông báo mới từ hệ thống.'}
                </p>
                <p className='mt-2 text-[11px] text-gray-400'>{formatTime(item.createdAt)}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className='py-10 text-center text-sm text-gray-500'>Hiện chưa có thông báo nào.</div>
        )}
      </div>

      <div className='border-t border-gray-100 bg-gray-50 p-4'>
        {unreadCount > 0 && onMarkAllAsRead ? (
          <button
            onClick={onMarkAllAsRead}
            className='mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50'
          >
            Đánh dấu tất cả đã đọc
          </button>
        ) : null}
        <button
          onClick={onOpenAll}
          className='flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700'
        >
          Xem tất cả <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
