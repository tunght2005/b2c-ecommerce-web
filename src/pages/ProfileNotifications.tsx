import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Clock, Trash2, CheckCheck, Loader2, Info, Package, Tag, AlertCircle } from 'lucide-react'
import { fetchClient } from '../api/fetchClient'

interface Notification {
  _id: string
  title: string
  content: string
  is_read: boolean
  type?: 'order' | 'promotion' | 'system'
  createdAt: string
}

export default function ProfileNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const res = await fetchClient<any>('/notification')
      // Vét cạn dữ liệu
      const data = res?.data || (Array.isArray(res) ? res : [])
      setNotifications(data)
    } catch (err) {
      console.error('Lỗi lấy thông báo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetchClient(`/notification/${id}/read`, { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)))
      // Bắn event để Header cập nhật badge nếu cần
      window.dispatchEvent(new Event('notificationChanged'))
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err)
    }
  }

  const markAllAsRead = async () => {
    if (notifications.every((n) => n.is_read)) return

    try {
      setIsMarkingAll(true)
      await fetchClient('/notification/read-all', { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      window.dispatchEvent(new Event('notificationChanged'))
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getIcon = (type?: string) => {
    switch (type) {
      case 'order':
        return <Package className='text-blue-500' size={20} />
      case 'promotion':
        return <Tag className='text-pink-500' size={20} />
      default:
        return <Info className='text-gray-500' size={20} />
    }
  }

  return (
    <div className='bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-full'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Thông báo của tôi</h1>
          <p className='text-sm text-gray-500 mt-1'>Cập nhật những tin tức mới nhất về đơn hàng và ưu đãi</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={isMarkingAll || notifications.every((n) => n.is_read)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
              notifications.every((n) => n.is_read)
                ? 'bg-gray-100 text-gray-400 border border-transparent'
                : 'bg-white text-red-600 border justify-center border-red-500 shadow-sm hover:bg-red-50 hover:shadow-md'
            }`}
          >
            {isMarkingAll ? <Loader2 size={16} className='animate-spin' /> : <CheckCheck size={18} />}
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className='space-y-4'>
        {isLoading ? (
          <div className='text-center py-20'>
            <Loader2 className='animate-spin text-red-600 mx-auto mb-4' size={40} />
            <p className='text-gray-500 font-medium'>Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className='text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200'>
            <Bell className='mx-auto text-gray-300 mb-4' size={48} />
            <p className='text-gray-500'>Bạn hiện không có thông báo nào.</p>
          </div>
        ) : (
          notifications.map((noti) => (
            <div
              key={noti._id}
              onClick={() => !noti.is_read && markAsRead(noti._id)}
              className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                noti.is_read
                  ? 'bg-white border-gray-100 grayscale-[0.5] opacity-80'
                  : 'bg-red-50/30 border-red-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className='flex gap-4'>
                <div
                  className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    noti.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'
                  }`}
                >
                  {getIcon(noti.type)}
                </div>

                <div className='flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className={`font-bold transition-colors ${noti.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {noti.title}
                    </h3>
                    <div className='flex items-center gap-1.5 text-[11px] text-gray-400 font-medium whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full'>
                      <Clock size={12} />
                      {formatDate(noti.createdAt)}
                    </div>
                  </div>

                  <p className={`text-sm mt-1 leading-relaxed ${noti.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                    {noti.content}
                  </p>

                  {!noti.is_read && (
                    <div className='mt-3 flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-wider'>
                      <div className='w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse' />
                      Mới
                    </div>
                  )}
                </div>
              </div>

              {/* Dấu chấm xanh báo hiệu chưa đọc */}
              {!noti.is_read && <div className='absolute top-5 right-5 w-2 h-2 bg-red-600 rounded-full' />}
            </div>
          ))
        )}
      </div>

      <div className='mt-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl text-white overflow-hidden relative'>
        <div className='relative z-10'>
          <h4 className='font-bold text-lg mb-1'>Mẹo nhỏ!</h4>
          <p className='text-gray-300 text-sm opacity-90'>
            Bật thông báo trên trình duyệt để không bỏ lỡ các đợt Flash Sale cực sốc từ SevenStore.
          </p>
        </div>
        <Bell className='absolute -bottom-4 -right-4 text-white/5' size={120} />
      </div>
    </div>
  )
}
