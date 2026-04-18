import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClient } from '../api/fetchClient';
import { Ticket, Clock, Percent, Zap, CheckCircle2 } from 'lucide-react';

interface Promotion {
  _id: string;
  name: string;
  description?: string;
  promotion_type: string;
  discount_value: number;
  discount_type: 'percent' | 'fixed';
  start_date: string;
  end_date: string;
  is_active: boolean;
  min_order_value?: number;
  max_discount_value?: number;
  code?: string;
}

export default function ProfilePromotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetchClient('/promotions');
      
      // Fallback đa dạng như rule số 1 để parse dữ liệu
      let dataItems: any[] = [];
      if (Array.isArray(res)) dataItems = res;
      else if (res?.data && Array.isArray(res.data)) dataItems = res.data;
      else if (res?.data?.records && Array.isArray(res.data.records)) dataItems = res.data.records;
      else if (res?.data?.items && Array.isArray(res.data.items)) dataItems = res.data.items;
      else if (res?.data?.data && Array.isArray(res.data.data)) dataItems = res.data.data;
      
      setPromotions(dataItems);
    } catch (error) {
      console.error('Lỗi khi tải danh sách ưu đãi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const calculateRemainingTime = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return 'Đã hết hạn';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Còn ${days} ngày`;
    return `Còn ${hours} giờ`;
  };

  const handleUseNow = (voucher: Promotion) => {
    const code = voucher.code || voucher.name;
    try {
      navigator.clipboard.writeText(code);
      alert(`Đã sao chép mã giảm giá: ${code}\nChuyển bạn đến trang chủ để mua sắm!`);
      navigate('/');
    } catch {
      alert(`Mã giảm giá của bạn là: ${code}\nChuyển bạn đến trang chủ để mua sắm!`);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Đang tải ví ưu đãi...</p>
        </div>
      </div>
    );
  }

  // Tách nhóm Flash Sale và Mã giảm giá
  const flashSales = promotions.filter(p => (p.promotion_type === 'flash_sale' || (p as any).type === 'flash_sale'));
  const vouchers = promotions.filter(p => (p.promotion_type !== 'flash_sale' && (p as any).type !== 'flash_sale'));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
          <Ticket size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ví Voucher / Ưu Đãi</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý mã giảm giá và các chương trình Flash Sale bạn có thể tham gia.</p>
        </div>
      </div>

      {promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <Ticket size={64} className="opacity-50" />
          <p className="font-medium text-gray-500">Hiện tại chưa có chương trình khuyến mãi nào.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* VOUCHERS & DISCOUNTS */}
          {vouchers.length > 0 && (
            <div>
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-4">
                <Percent size={20} className="text-red-500" />
                Mã Giảm Giá & Ưu Đãi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vouchers.map(v => {
                  const isExpired = new Date(v.end_date).getTime() < new Date().getTime();
                  return (
                    <div key={v._id} className={`relative flex rounded-2xl border ${isExpired ? 'border-gray-200 bg-gray-50' : 'border-red-100 bg-red-50/30'} overflow-hidden`}>
                      {/* Left Ticket Stub */}
                      <div className={`w-28 flex flex-col justify-center items-center p-4 border-r border-dashed ${isExpired ? 'bg-gray-200 border-gray-300 text-gray-500' : 'bg-red-500 border-red-200 text-white'}`}>
                        <span className="text-2xl font-black">
                          {v.discount_type === 'percent' ? `${v.discount_value}%` : formatCurrency(v.discount_value)}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wider mt-1 opacity-80">Giảm</span>
                      </div>
                      
                      {/* Right Content */}
                      <div className="flex-1 p-4">
                        <h3 className={`font-bold text-base mb-1 line-clamp-1 ${isExpired ? 'text-gray-500' : 'text-gray-900'}`}>{v.name}</h3>
                        {v.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{v.description}</p>}
                        
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                           <CheckCircle2 size={12} className={isExpired ? "text-gray-400" : "text-green-500"} />
                           Đơn tối thiểu {v.min_order_value ? formatCurrency(v.min_order_value) : '0 ₫'}
                        </div>
                        {v.max_discount_value && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                            <CheckCircle2 size={12} className={isExpired ? "text-gray-400" : "text-green-500"} />
                            Giảm tối đa {formatCurrency(v.max_discount_value)}
                          </div>
                        )}
                        
                        <div className="mt-auto flex items-center justify-between">
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isExpired ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-600'}`}>
                            <Clock size={12} /> {calculateRemainingTime(v.end_date)}
                          </span>
                          {!isExpired && (
                             <button onClick={() => handleUseNow(v)} className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors active:scale-95">Dùng ngay</button>
                          )}
                        </div>
                      </div>
                      
                      {/* Cutout circles */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FLASH SALES */}
          {flashSales.length > 0 && (
            <div>
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-4 mt-8">
                <Zap size={20} className="text-yellow-500" fill="currentColor" />
                Flash Sale Sắp Tới / Đang Diễn Ra
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashSales.map(fs => {
                  const now = new Date().getTime();
                  const startTime = new Date(fs.start_date).getTime();
                  const endTime = new Date(fs.end_date).getTime();
                  const isUpcoming = startTime > now;
                  const isExpired = endTime < now;
                  const isActive = !isUpcoming && !isExpired;

                  return (
                    <div key={fs._id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-yellow-400 transition-colors shadow-sm relative overflow-hidden group">
                      
                      {/* Badge status */}
                      <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-xs ${
                        isActive ? 'bg-red-500 text-white' : 
                        isUpcoming ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isActive ? 'ĐANG DIỄN RA' : isUpcoming ? 'SẮP DIỄN RA' : 'ĐÃ KẾT THÚC'}
                      </div>

                      <div className="flex items-start gap-4 mt-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                          <Zap size={28} fill="currentColor" />
                        </div>
                        <div className="flex-1">
                           <h3 className="font-bold text-gray-900 text-base">{fs.name}</h3>
                           <p className="text-xs text-gray-500 mt-1 line-clamp-2">{fs.description || 'Chương trình Flash Sale đặc biệt với giá giảm sâu nhất.'}</p>
                           
                           <div className="mt-4 flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                 Bắt đầu: {new Date(fs.start_date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} {new Date(fs.start_date).toLocaleDateString('vi-VN')}
                              </span>
                           </div>
                           
                           {!isExpired && (
                              <button onClick={() => {
                                if (isActive) navigate('/');
                                else alert('Đã bật thông báo khi Flash Sale bắt đầu!');
                              }} className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                isActive ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-red-200 hover:shadow-md hover:-translate-y-0.5' 
                                : 'bg-gray-900 text-white hover:bg-black'
                              }`}>
                                {isActive ? 'Mua ngay kẻo lỡ' : 'Nhắc nhở tôi'}
                              </button>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
