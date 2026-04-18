import { useState, useEffect } from 'react'
import { fetchClient } from '../api/fetchClient'
import { PackageX, Loader2, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

interface ReturnRequest {
  _id: string
  order_item_id: string
  reason: string
  status: ReturnStatus
  refund_amount: number
  evidence_image?: string
  approved_at?: string
  createdAt?: string
  created_at?: string
  policy_id?: { _id: string; name: string; days_allowed: number } | string
}

export default function ProfileReturns() {
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchClient<any>('/after-sales/returns')
        let list: any[] = []
        if (Array.isArray(res)) list = res
        else if (Array.isArray(res?.data?.items)) list = res.data.items
        else if (Array.isArray(res?.data?.returns)) list = res.data.returns
        else if (Array.isArray(res?.data)) list = res.data
        else if (Array.isArray(res?.items)) list = res.items
        else if (Array.isArray(res?.returns)) list = res.returns
        // Nếu data là 1 object duy nhất (not array)
        else if (res?.data && !Array.isArray(res.data)) {
          // duyệt tất cả key của res.data để tìm array
          const dataVal = Object.values(res.data).find(v => Array.isArray(v))
          if (dataVal) list = dataVal as any[]
        }
        console.log('[ProfileReturns] list:', list.length)
        setReturns(list)
      } catch (e) {
        console.error('Failed to load returns', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
            <Clock size={12} /> Chờ xử lý
          </span>
        )
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <CheckCircle2 size={12} /> Đã duyệt
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            <CheckCircle2 size={12} /> Hoàn thành
          </span>
        )
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            <XCircle size={12} /> Bị từ chối
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            <AlertCircle size={12} /> {status}
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
      <div className="border-b pb-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PackageX className="text-red-500" />
          Lịch sử hoàn trả
        </h1>
        <p className="text-gray-500 text-sm mt-1">Theo dõi trạng thái các yêu cầu hoàn trả của bạn.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-500 mr-3" size={28} />
          <span className="text-gray-500">Đang tải...</span>
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 text-gray-300">
            <PackageX size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có yêu cầu hoàn trả</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Khi bạn gửi yêu cầu hoàn trả sản phẩm, chúng sẽ hiển thị ở đây.
          </p>
          <button
            onClick={() => navigate('/profile/orders')}
            className="text-red-500 font-medium hover:underline"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => {
            const orderId = ret.order_item_id?.split(':')?.[0] ?? ''
            const policyName = typeof ret.policy_id === 'object' ? ret.policy_id?.name : 'Chính sách hoàn trả'
            return (
              <div key={ret._id} className="border rounded-2xl p-5 hover:border-gray-300 transition-colors bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {getStatusBadge(ret.status)}
                  <span className="text-xs text-gray-400 font-medium ml-auto">
                    {new Date(ret.createdAt || ret.created_at || '').toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã đơn hàng</span>
                    <span className="font-semibold text-gray-800 font-mono">
                      #{orderId.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chính sách</span>
                    <span className="font-medium">{policyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lý do</span>
                    <span className="font-medium text-right max-w-[60%]">{ret.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số tiền hoàn</span>
                    <span className="font-bold text-red-600">{formatCurrency(ret.refund_amount)}</span>
                  </div>
                  {ret.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày duyệt</span>
                      <span className="font-medium text-green-600">
                        {new Date(ret.approved_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {ret.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 mb-3 text-sm text-red-700">
                    <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                    Yêu cầu đã bị từ chối. Vui lòng liên hệ CSKH để biết thêm chi tiết.
                  </div>
                )}

                {orderId && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/orders/${orderId}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition"
                    >
                      Xem đơn hàng <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
