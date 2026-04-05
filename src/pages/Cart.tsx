import { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  ArrowRight,
  X,
  Edit2,
  PlusCircle,
  CreditCard,
  Banknote,
  Wallet,
  Truck,
  Ticket
} from 'lucide-react'

// --- TYPES & MOCK DATA ---
interface Address {
  id: number
  receiver_name: string
  phone: string
  detail: string
  ward: string
  district: string
  province: string
  is_default: boolean
}

const mockAddresses: Address[] = [
  {
    id: 1,
    receiver_name: 'Tùng HT',
    phone: '0987 654 321',
    detail: 'Số 1, đường Linh Đông',
    ward: 'P. Linh Đông',
    district: 'Thủ Đức',
    province: 'TP. Hồ Chí Minh',
    is_default: true
  },
  {
    id: 2,
    receiver_name: 'Tùng HT (Văn phòng)',
    phone: '0123 456 789',
    detail: 'Số 123, đường Lê Duẩn',
    ward: 'P. Bến Nghé',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
    is_default: false
  }
]

interface CartItem {
  id: number
  variant_id: number
  name: string
  variant: string
  price: number
  oldPrice: number
  quantity: number
  image: string
  selected: boolean
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    variant_id: 101,
    name: 'iPhone 15 Pro Max',
    variant: 'Titan Tự nhiên | 256GB',
    price: 29990000,
    oldPrice: 34990000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80',
    selected: true
  },
  {
    id: 2,
    variant_id: 105,
    name: 'MacBook Air M3 2024',
    variant: 'Space Gray | 16GB RAM | 512GB SSD',
    price: 32990000,
    oldPrice: 34990000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
    selected: false
  }
]

// --- MAIN COMPONENT ---
const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [addresses] = useState<Address[]>(mockAddresses);
  
  const [selectedAddress, setSelectedAddress] = useState<Address>(
    addresses.find((addr) => addr.is_default) || addresses[0]
  );
  
  // States quản lý Popup
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  // State quản lý Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'credit' | 'momo' | 'vnpay'>('cod');

  // --- LOGIC HÀM ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSelectItem = (id: number) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  };

  const handleSelectAll = (checked: boolean) => {
    setCartItems(cartItems.map((item) => ({ ...item, selected: checked })))
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }
        }
        return item
      })
    )
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  };

  const handleOpenCheckout = () => {
    if (selectedCount === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!')
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const selectedItems = cartItems.filter((item) => item.selected)
  const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
  const selectedCount = selectedItems.length

  const totalPrice = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalOldPrice = selectedItems.reduce((total, item) => total + item.oldPrice * item.quantity, 0);
  const discountAmount = totalOldPrice - totalPrice
  const shippingFee = 0; // Giả sử đang miễn phí vận chuyển

  // --- GIAO DIỆN ---
  if (cartItems.length === 0) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center bg-gray-50'>
        <div className='bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100'>
          <div className='w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6'>
            <ShoppingBag className='w-12 h-12 text-[#E7000B]' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Giỏ hàng trống</h2>
          <p className='text-gray-500 mb-8'>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <a
            href='/'
            className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#E7000B] hover:bg-[#C10008] transition-colors w-full'
          >
            Tiếp tục mua sắm
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          GIỎ HÀNG <span className="text-gray-500 text-lg font-normal">({cartItems.length} sản phẩm)</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* --- CỘT TRÁI: DANH SÁCH GIỎ HÀNG --- */}
          <div className="lg:w-2/3 w-full space-y-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 sticky top-[80px] z-10">
              <input type="checkbox" checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-5 h-5 accent-[#E7000B] rounded cursor-pointer" />
              <span className="text-sm font-medium text-gray-700">Tất cả ({cartItems.length} sản phẩm)</span>
              <span className="text-sm text-gray-500 ml-auto hidden sm:block">Đơn giá</span>
              <span className="text-sm text-gray-500 mx-16 hidden sm:block">Số lượng</span>
              <span className="text-sm text-gray-500 mr-12 hidden sm:block">Thành tiền</span>
              <button className="text-gray-400 hover:text-red-500 transition sm:ml-0 ml-auto"><Trash2 size={18} /></button>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row items-center gap-4 relative group transition ${item.selected ? 'border-red-200' : 'border-gray-100'}`}>
                <input type="checkbox" checked={item.selected} onChange={() => handleSelectItem(item.id)} className="w-5 h-5 accent-[#E7000B] rounded cursor-pointer sm:self-center self-start mt-1 sm:mt-0" />
                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 sm:pr-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 pr-6">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">{item.variant}</p>
                  <div className="mt-2 sm:hidden flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#E7000B]">{formatCurrency(item.price)}</span>
                    <span className="text-xs text-gray-400 line-through">{formatCurrency(item.oldPrice)}</span>
                  </div>
                </div>
                <div className="hidden sm:block text-right w-28 flex-shrink-0">
                  <span className="text-base font-semibold text-gray-900 block">{formatCurrency(item.price)}</span>
                  <span className="text-xs text-gray-400 line-through">{formatCurrency(item.oldPrice)}</span>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg bg-white w-28 flex-shrink-0 justify-between">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-gray-600 hover:bg-gray-50 hover:text-[#E7000B] transition rounded-l-lg"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-gray-600 hover:bg-gray-50 hover:text-[#E7000B] transition rounded-r-lg"><Plus size={14} /></button>
                </div>
                <div className="hidden sm:block text-right w-32 flex-shrink-0 pr-2">
                  <span className="text-base font-bold text-[#E7000B] block">{formatCurrency(item.price * item.quantity)}</span>
                </div>
                <button onClick={() => removeItem(item.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50" title="Xóa"><X size={18} /></button>
              </div>
            ))}
          </div>

          {/* --- CỘT PHẢI: TÓM TẮT & NÚT ĐẶT HÀNG --- */}
          <div className="lg:w-1/3 w-full space-y-4 sticky top-[145px]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-gray-600 flex items-center gap-2 text-sm"><MapPin size={16} className="text-gray-400" /> Giao tới</h3>
                <button onClick={() => setIsAddressModalOpen(true)} className="text-sm text-blue-600 font-medium hover:text-blue-700 transition">Thay đổi</button>
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900">{selectedAddress.receiver_name} | {selectedAddress.phone}</p>
                <p className="text-gray-600 mt-1">{`${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Đơn hàng</h3>
              <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({selectedCount} sản phẩm)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalOldPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Giảm giá</span>
                  <span className="font-medium text-green-600">-{formatCurrency(discountAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="font-semibold text-gray-900">Tổng tiền</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#E7000B] block">{formatCurrency(totalPrice)}</span>
                  <span className="text-xs text-gray-500">(Đã bao gồm VAT)</span>
                </div>
              </div>
              {/* Nút Mở Popup Thanh Toán */}
              <button 
                onClick={handleOpenCheckout}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-colors text-base shadow-lg ${
                  selectedCount > 0 
                    ? 'bg-[#E7000B] text-white hover:bg-[#C10008] shadow-red-100 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                }`}
              >
                Mua hàng ({selectedCount}) <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 1. POPUP THAY ĐỔI ĐỊA CHỈ (GIỮ NGUYÊN) --- */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Địa chỉ nhận hàng</h2>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 min-h-0 scroller">
              {addresses.map((addr) => {
                const isSelected = selectedAddress.id === addr.id;
                return (
                  <div key={addr.id} onClick={() => { setSelectedAddress(addr); setIsAddressModalOpen(false); }} className={`p-4 border rounded-xl cursor-pointer transition flex items-start gap-4 hover:border-red-300 ${isSelected ? 'border-[#E7000B] bg-red-50/50' : 'border-gray-200'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#E7000B]' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-[#E7000B] rounded-full"></div>}
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{addr.receiver_name} | {addr.phone}</p>
                        {addr.is_default && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded font-medium">Mặc định</span>}
                      </div>
                      <p className="text-gray-600">{`${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded sm:opacity-0 group-hover:opacity-100 transition"><Edit2 size={16} /></button>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-4 mt-5">
              <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E7000B] text-[#E7000B] py-3 rounded-xl font-semibold hover:bg-red-50 transition text-sm">
                <PlusCircle size={18} /> Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. POPUP THANH TOÁN (CHECKOUT MODAL) --- */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsCheckoutModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Checkout Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Thanh toán an toàn</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>

            {/* Checkout Content - Chia 2 cột */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50">
              
              {/* CỘT TRÁI: Thông tin vận chuyển & Thanh toán */}
              <div className="lg:w-[60%] p-5 sm:p-8 overflow-y-auto scroller space-y-8 bg-white">
                
                {/* 1. Thông tin nhận hàng */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">1. Thông tin nhận hàng</h3>
                  <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-base">{selectedAddress.receiver_name} <span className="text-gray-400 font-normal mx-2">|</span> {selectedAddress.phone}</p>
                      <p className="text-gray-600 mt-1.5 text-sm leading-relaxed">{`${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}</p>
                    </div>
                    <button onClick={() => {setIsCheckoutModalOpen(false); setIsAddressModalOpen(true);}} className="text-[#E7000B] text-sm font-medium hover:underline flex-shrink-0">
                      Thay đổi
                    </button>
                  </div>
                </section>

                {/* 2. Phương thức giao hàng */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">2. Phương thức giao hàng</h3>
                  <div className="border border-[#E7000B] bg-red-50/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer">
                    <div className="w-5 h-5 rounded-full border-2 border-[#E7000B] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-[#E7000B] rounded-full"></div>
                    </div>
                    <Truck className="text-[#E7000B]" size={24} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Giao hàng tiêu chuẩn</p>
                      <p className="text-sm text-gray-500 mt-0.5">Dự kiến giao vào ngày mai</p>
                    </div>
                    <span className="font-medium text-gray-900">Miễn phí</span>
                  </div>
                </section>

                {/* 3. Phương thức thanh toán */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">3. Phương thức thanh toán</h3>
                  <div className="space-y-3">
                    {/* COD */}
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition hover:border-red-300 ${paymentMethod === 'cod' ? 'border-[#E7000B] bg-red-50/20' : 'border-gray-200'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-[#E7000B]" />
                      <Banknote className="text-green-600" size={28} />
                      <span className="font-medium text-gray-900">Thanh toán tiền mặt khi nhận hàng (COD)</span>
                    </label>
                    
                    {/* Thẻ tín dụng */}
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition hover:border-red-300 ${paymentMethod === 'credit' ? 'border-[#E7000B] bg-red-50/20' : 'border-gray-200'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="w-5 h-5 accent-[#E7000B]" />
                      <CreditCard className="text-blue-600" size={28} />
                      <span className="font-medium text-gray-900">Thẻ Tín dụng / Ghi nợ</span>
                    </label>

                    {/* Ví điện tử (Mô phỏng) */}
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition hover:border-red-300 ${paymentMethod === 'momo' ? 'border-[#E7000B] bg-red-50/20' : 'border-gray-200'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="w-5 h-5 accent-[#E7000B]" />
                      <Wallet className="text-pink-500" size={28} />
                      <span className="font-medium text-gray-900">Thanh toán bằng Ví MoMo</span>
                    </label>
                  </div>
                </section>
              </div>

              {/* CỘT PHẢI: Tóm tắt đơn hàng */}
              <div className="lg:w-[40%] bg-gray-50 border-l border-gray-200 flex flex-col h-full">
                <div className="p-5 sm:p-6 overflow-y-auto scroller flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Đơn hàng của bạn ({selectedCount})</h3>
                  
                  {/* List sản phẩm được chọn */}
                  <div className="space-y-4 mb-6">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{item.quantity}</span>
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                          <p className="text-gray-500 text-xs mt-1">{item.variant}</p>
                          <p className="font-bold text-gray-900 mt-1">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mã giảm giá */}
                  <div className="border-t border-b border-gray-200 py-5 my-5 flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" placeholder="Nhập mã giảm giá" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#E7000B]" />
                    </div>
                    <button className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition">Áp dụng</button>
                  </div>

                  {/* Tính toán chi phí */}
                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span className="font-medium text-gray-900">{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="font-medium text-gray-900">{formatCurrency(shippingFee)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                    <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-[#E7000B]">{formatCurrency(totalPrice + shippingFee)}</span>
                  </div>
                </div>

                {/* Nút Đặt Hàng Cố định ở đáy cột phải */}
                <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <button onClick={() => alert("Chức năng đặt hàng đang được xử lý API...")} className="w-full bg-[#E7000B] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#C10008] transition shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                    Xác nhận đặt hàng
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của SevenStore
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CSS CSS ẩn thanh cuộn cho Popup nhưng vẫn cuộn được */}
      <style>{`
        .scroller::-webkit-scrollbar { width: 6px; }
        .scroller::-webkit-scrollbar-track { background: transparent; }
        .scroller::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
        .scroller::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
};

export default Cart;