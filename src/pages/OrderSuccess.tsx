import { CheckCircle2, ChevronRight, Home } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-[85vh] bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-xl w-full text-center relative overflow-hidden">
        
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-white"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="text-green-500" size={56} />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-2 mt-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-8 text-base">Cảm ơn bạn đã mua sắm tại SevenStore. Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng.</p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <span className="text-gray-500 font-medium">Mã đơn hàng</span>
              <span className="font-bold text-gray-900 text-lg">#{id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <span className="text-gray-500 font-medium">Phương thức</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">VNPay</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Tổng thanh toán</span>
              <span className="font-bold text-[#E7000B] text-xl">30.020.000 ₫</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')} 
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
            >
              <Home size={18} /> Về trang chủ
            </button>
            <button 
              onClick={() => navigate('/profile/orders')} 
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#E7000B] text-white font-bold rounded-xl hover:bg-[#C10008] transition shadow-lg shadow-red-200"
            >
              Xem đơn hàng <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
