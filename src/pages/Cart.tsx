import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClient } from '../api/fetchClient';
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
  Truck,
  Ticket,
  Tag // Thêm icon Tag cho Voucher
} from 'lucide-react'

// --- TYPES & MOCK DATA ---
interface Address {
  _id?: string
  id?: number | string
  receiver_name: string
  phone: string
  detail: string
  ward: string
  district: string
  province: string
  is_default?: boolean
}

// Giữ lại mock để render tạm nếu BE chưa có data
const mockAddresses: Address[] = []

interface CartItem {
  _id?: string
  id?: number | string
  variant_id?: string | Record<string, unknown>
  product_id?: string | Record<string, unknown>
  name?: string
  variant?: string
  price?: number
  oldPrice?: number
  quantity: number
  image?: string
  selected?: boolean
}

const initialCartItems: CartItem[] = []

// --- MAIN COMPONENT ---
const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    const loadCheckoutData = async () => {
      setIsLoading(true);
      try {
        // Gọi cả 2 API song song
        const [cartRes, addrRes] = await Promise.all([
           fetchClient<Record<string, unknown>>('/cart').catch(() => null),
           fetchClient<Record<string, unknown>>('/address').catch(() => null)
        ]);

        // Cập nhật Address (Vét cạn mọi cấu trúc JSON)
        let loadedAddresses: Address[] = [];
        if (addrRes) {
           if (Array.isArray(addrRes)) loadedAddresses = addrRes as Address[];
           else if (addrRes.data && Array.isArray(addrRes.data)) loadedAddresses = addrRes.data as Address[];
           else if (addrRes.addresses && Array.isArray(addrRes.addresses)) loadedAddresses = addrRes.addresses as Address[];
           else if (addrRes.results && Array.isArray(addrRes.results)) loadedAddresses = addrRes.results as Address[];
        }
        
        setAddresses(loadedAddresses);
        if (loadedAddresses.length > 0) {
           setSelectedAddress(loadedAddresses.find(a => a.is_default) || loadedAddresses[0]);
        }

        // Cập nhật Cart
        let loadedCartItems: CartItem[] = [];
        if (cartRes?.data?.items) {
           loadedCartItems = cartRes.data.items;
        } else if (Array.isArray(cartRes?.data)) {
           loadedCartItems = cartRes.data;
        } else if (Array.isArray(cartRes)) {
           loadedCartItems = cartRes;
        }
        
        // Setup thông số ảo mặc định cho render
        const processedItems = loadedCartItems.map((item) => {
           // Ép kiểu an toàn để trích xuất name/image từ product_id và variant_id
           const pId = item.product_id as Record<string, unknown> | undefined;
           const vId = item.variant_id as Record<string, unknown> | undefined;

           return {
             ...item,
             id: item._id || item.id || Math.random().toString(),
             selected: true,
             name: item.name || (pId?.name as string) || (vId?.name as string) || 'Sản phẩm từ Server',
             price: item.price || 15000000,
             oldPrice: item.oldPrice || 17000000,
             image: item.image || (pId?.image as string) || 'https://via.placeholder.com/150',
             variant: item.variant || (vId?.sku as string) || 'Tiêu chuẩn'
           };
        });
        setCartItems(processedItems);

      } catch (error) {
        console.error('Lỗi khi load Checkout Data', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCheckoutData();
  }, []);
  
  // States quản lý Popup
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  // Popup tạo địa chỉ
  const [isAddNewAddressOpen, setIsAddNewAddressOpen] = useState(false);
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrDetail, setNewAddrDetail] = useState("");
  const [isNewAddrDefault, setIsNewAddrDefault] = useState(false);

  // Tỉnh/Thành API States
  const [provinces, setProvinces] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [wards, setWards] = useState<Record<string, unknown>[]>([]);
  
  const [selectedProvCode, setSelectedProvCode] = useState("");
  const [selectedDistCode, setSelectedDistCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  useEffect(() => {
    if (isAddNewAddressOpen && provinces.length === 0) {
      fetch('https://provinces.open-api.vn/api/?depth=3')
        .then(r => r.json())
        .then(data => setProvinces(data))
        .catch(console.error);
    }
  }, [isAddNewAddressOpen, provinces.length]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvCode(code);
    setSelectedDistCode("");
    setSelectedWardCode("");
    const prov = provinces.find((p: Record<string, unknown>) => p.code == code);
    setDistricts(prov ? (prov.districts as Record<string, unknown>[]) : []);
    setWards([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedDistCode(code);
    setSelectedWardCode("");
    const dist = districts.find((d: Record<string, unknown>) => d.code == code);
    setWards(dist ? (dist.wards as Record<string, unknown>[]) : []);
  };

  const handleCreateAddress = async () => {
    if (!newAddrName || !newAddrPhone || !selectedProvCode || !selectedDistCode || !selectedWardCode || !newAddrDetail) {
      alert("Vui lòng nhập đầy đủ thông tin (Tên, SĐT, Tỉnh, Quận, Phường, Địa chỉ cụ thể)!");
      return;
    }
    const prov = provinces.find(p => p.code == selectedProvCode)?.name;
    const dist = districts.find(d => d.code == selectedDistCode)?.name;
    const ward = wards.find(w => w.code == selectedWardCode)?.name;

    try {
      await fetchClient('/address', {
        method: 'POST',
        body: JSON.stringify({
          receiver_name: newAddrName,
          phone: newAddrPhone,
          province: prov,
          district: dist,
          ward: ward,
          detail: newAddrDetail,
          is_default: isNewAddrDefault
        })
      });
      // Reload danh bạ địa chỉ (vét cạn format)
      const addrRes = await fetchClient<Record<string, unknown>>('/address').catch(() => null);
      let loadedAddresses: Address[] = [];
      if (addrRes) {
         if (Array.isArray(addrRes)) loadedAddresses = addrRes as Address[];
         else if (addrRes.data && Array.isArray(addrRes.data)) loadedAddresses = addrRes.data as Address[];
         else if (addrRes.addresses && Array.isArray(addrRes.addresses)) loadedAddresses = addrRes.addresses as Address[];
         else if (addrRes.results && Array.isArray(addrRes.results)) loadedAddresses = addrRes.results as Address[];
      }
      
      setAddresses(loadedAddresses);
      if (loadedAddresses.length > 0) {
        // Tự động chọn địa chỉ vừa tạo (thường nằm cuối danh sách)
        setSelectedAddress(loadedAddresses[loadedAddresses.length - 1]);
      }
      setIsAddNewAddressOpen(false);
      
      // Clear form
      setNewAddrName(""); setNewAddrPhone(""); setNewAddrDetail(""); 
      setSelectedProvCode(""); setSelectedDistCode(""); setSelectedWardCode("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi Server";
      alert("Tạo địa chỉ thất bại: " + msg);
    }
  };

  // --- STATE QUẢN LÝ VOUCHER ---
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string, discount: number, type: 'percent' | 'fixed' } | null>(null);
  const [voucherError, setVoucherError] = useState('');

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

  const removeItem = async (id: string | number) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (!itemToRemove) return;

    // Lấy variant_id thật: có thể là object {_id} hoặc string trực tiếp
    const vId = (itemToRemove.variant_id as Record<string, unknown>)?._id || itemToRemove.variant_id;

    try {
      // 1. Gọi API xóa trên Server
      await fetchClient('/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ variant_id: vId })
      });

      // 2. Cập nhật UI cục bộ
      setCartItems(cartItems.filter((item) => item.id !== id));

      // 3. Bắn event để Header load lại con số badge thực tế
      window.dispatchEvent(new Event('cartChanged'));

    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      alert('Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại!');
    }
  };

  const handleOpenCheckout = () => {
    if (selectedCount === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!')
      return;
    }
    if (!selectedAddress) {
      alert('Vui lòng tạo một địa chỉ nhận hàng trước khi thanh toán!');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  // --- LOGIC ÁP DỤNG VOUCHER ---
  const handleApplyVoucher = () => {
    setVoucherError('');
    const code = voucherCode.toUpperCase().trim();

    if (code === 'SEVEN10') {
      setAppliedVoucher({ code, discount: 10, type: 'percent' });
      setVoucherCode('');
    } else if (code === 'FREESHIP') {
      setAppliedVoucher({ code, discount: 50000, type: 'fixed' });
      setVoucherCode('');
    } else {
      setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      setAppliedVoucher(null);
    }
  };

  // --- LOGIC XÁC NHẬN MUA HÀNG ---
  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      alert("Bạn chưa chọn Địa chỉ giao hàng!");
      return;
    }
    
    try {
      const orderRes = await fetchClient<{paymentUrl?: string, _id?: string}>('/order/create', {
        method: 'POST',
        body: JSON.stringify({
          address_id: selectedAddress._id || selectedAddress.id,
          voucher_id: appliedVoucher ? appliedVoucher.code : undefined
        })
      });
      
      // Chuyển hướng thanh toán VNPAY nếu Server trả về paymentUrl
      if (orderRes?.paymentUrl) {
         window.location.href = orderRes.paymentUrl;
      } else {
         navigate('/order-success/' + (orderRes?._id || 'SUCCESS'));
      }
    } catch (error) {
      console.error("Checkout Failed", error);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Server phản hồi lỗi từ VNPAY hoặc thiếu dữ liệu.');
    }
  }

  // Các biến tính toán tiền
  const selectedItems = cartItems.filter((item) => item.selected)
  const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
  const selectedCount = selectedItems.length

  const totalPrice = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalOldPrice = selectedItems.reduce((total, item) => total + item.oldPrice * item.quantity, 0);
  const productDiscountAmount = totalOldPrice - totalPrice; // Giảm giá trực tiếp trên sản phẩm
  const shippingFee = 30000; // Giả sử phí ship 30k để test FREESHIP

  // Tính số tiền được giảm từ Voucher
  let voucherDiscountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      voucherDiscountAmount = totalPrice * (appliedVoucher.discount / 100);
      if (voucherDiscountAmount > 500000) voucherDiscountAmount = 500000; // Giảm tối đa 500k
    } else {
      voucherDiscountAmount = appliedVoucher.discount;
    }
  }

  const finalCheckoutPrice = totalPrice + shippingFee - voucherDiscountAmount > 0 ? totalPrice + shippingFee - voucherDiscountAmount : 0;

  // --- GIAO DIỆN ---
  if (isLoading) {
    return (
      <div className='min-h-[70vh] flex flex-col items-center justify-center bg-gray-50'>
        <p className="text-gray-500 font-medium animate-pulse">Đang tải giỏ hàng từ máy chủ...</p>
      </div>
    )
  }

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
              <button onClick={() => {
                  const selectedIds = cartItems.filter(i => i.selected).map(i => i.id);
                  setCartItems(cartItems.filter(i => !selectedIds.includes(i.id)));
              }} className="text-gray-400 hover:text-red-500 transition sm:ml-0 ml-auto"><Trash2 size={18} /></button>
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
                {selectedAddress ? (
                   <>
                     <p className="font-bold text-gray-900">{selectedAddress.receiver_name} | {selectedAddress.phone}</p>
                     <p className="text-gray-600 mt-1">{`${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}</p>
                   </>
                ) : (
                   <p className="text-red-500 font-bold italic">Chưa có địa chỉ. Vui lòng thêm mới!</p>
                )}
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
                  <span className="font-medium text-green-600">-{formatCurrency(productDiscountAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="font-semibold text-gray-900">Tổng tiền</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#E7000B] block">{formatCurrency(totalPrice)}</span>
                  <span className="text-xs text-gray-500">(Chưa tính Voucher/Phí ship)</span>
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
        <div className="fixed inset-0 bg-black/50 z-[220] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)}>
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
              <button onClick={() => setIsAddNewAddressOpen(true)} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#E7000B] text-[#E7000B] py-3 rounded-xl font-semibold hover:bg-red-50 transition text-sm">
                <PlusCircle size={18} /> Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORM THÊM ĐỊA CHỈ MỚI --- */}
      {isAddNewAddressOpen && (
        <div className="fixed inset-0 bg-black/60 z-[210] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsAddNewAddressOpen(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-6 md:p-8 relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Thêm Địa Chỉ Mới</h2>
              <button onClick={() => setIsAddNewAddressOpen(false)} className="text-gray-400 hover:text-gray-700 transition p-1 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20} /></button>
            </div>
            
            <div className="space-y-5 overflow-y-auto scroller pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Họ và tên</label>
                  <input type="text" value={newAddrName} onChange={e => setNewAddrName(e.target.value)} placeholder="Tên người nhận" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#E7000B] focus:ring-1 focus:ring-[#E7000B]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                  <input type="text" value={newAddrPhone} onChange={e => setNewAddrPhone(e.target.value)} placeholder="Số điện thoại" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#E7000B] focus:ring-1 focus:ring-[#E7000B]" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Tỉnh/Thành</label>
                  <select value={selectedProvCode} onChange={handleProvinceChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#E7000B] bg-white text-sm">
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Quận/Huyện</label>
                  <select value={selectedDistCode} onChange={handleDistrictChange} disabled={!selectedProvCode} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#E7000B] bg-white text-sm disabled:bg-gray-100 cursor-pointer disabled:cursor-not-allowed">
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phường/Xã</label>
                  <select value={selectedWardCode} onChange={(e) => setSelectedWardCode(e.target.value)} disabled={!selectedDistCode} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#E7000B] bg-white text-sm disabled:bg-gray-100 cursor-pointer disabled:cursor-not-allowed">
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Địa chỉ cụ thể</label>
                <input type="text" value={newAddrDetail} onChange={e => setNewAddrDetail(e.target.value)} placeholder="Số nhà, Tên đường, Tòa nhà..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#E7000B] focus:ring-1 focus:ring-[#E7000B]" />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" checked={isNewAddrDefault} onChange={e => setIsNewAddrDefault(e.target.checked)} id="defaultAddr" className="w-4 h-4 accent-[#E7000B] cursor-pointer rounded" />
                <label htmlFor="defaultAddr" className="text-sm text-gray-700 cursor-pointer">Đặt làm địa chỉ mặc định</label>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 mt-6 flex gap-3">
              <button onClick={() => setIsAddNewAddressOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Hủy bỏ</button>
              <button onClick={handleCreateAddress} className="flex-1 py-3 bg-[#E7000B] text-white font-bold rounded-xl hover:bg-[#C10008] transition shadow-lg shadow-red-100">Lưu địa chỉ</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. POPUP THANH TOÁN (CHECKOUT MODAL) TÍCH HỢP VOUCHER --- */}
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
                      {selectedAddress ? (
                         <>
                           <p className="font-semibold text-gray-900 text-base">{selectedAddress.receiver_name} <span className="text-gray-400 font-normal mx-2">|</span> {selectedAddress.phone}</p>
                           <p className="text-gray-600 mt-1.5 text-sm leading-relaxed">{`${selectedAddress.detail}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`}</p>
                         </>
                      ) : (
                         <p className="text-red-500 font-bold italic">Chưa có địa chỉ. Vui lòng thêm mới!</p>
                      )}
                    </div>
                    <button onClick={() => setIsAddressModalOpen(true)} className="text-[#E7000B] text-sm font-medium hover:underline flex-shrink-0">
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
                    <span className="font-medium text-gray-900">{formatCurrency(shippingFee)}</span>
                  </div>
                </section>

                {/* 3. Phương thức thanh toán */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">3. Phương thức thanh toán</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition border-blue-600 bg-blue-50/20`}>
                      <input type="radio" name="payment" checked={true} readOnly className="w-5 h-5 accent-blue-600" />
                      <div className="bg-blue-600 text-white rounded-lg flex items-center justify-center overflow-hidden border border-blue-700 w-16 h-10 shadow-sm">
                         <span className="font-black italic text-base -tracking-wide">VNPAY</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 block">Thanh toán an toàn qua cổng VNPay</span>
                        <span className="text-xs text-gray-500 block mt-0.5">Quét mã QR qua ứng dụng ngân hàng hoặc thẻ ATM nội địa/quốc tế</span>
                      </div>
                    </label>
                  </div>
                </section>
              </div>

              {/* CỘT PHẢI: Tóm tắt đơn hàng & VOUCHER */}
              <div className="lg:w-[40%] bg-gray-50 border-l border-gray-200 flex flex-col h-full">
                <div className="p-5 sm:p-6 overflow-y-auto scroller flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Đơn hàng của bạn ({selectedCount})</h3>
                  
                  {/* List sản phẩm */}
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

                  {/* KHU VỰC NHẬP MÃ GIẢM GIÁ (ĐÃ FIX) */}
                  <div className="border-t border-b border-gray-200 py-5 my-5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Nhập SEVEN10 / FREESHIP" 
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#E7000B] uppercase text-sm" 
                        />
                      </div>
                      <button 
                        onClick={handleApplyVoucher}
                        className="bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-black transition text-sm"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {voucherError && <p className='text-red-500 text-xs italic mt-2'>{voucherError}</p>}
                    
                    {/* Hiển thị thẻ Voucher khi áp dụng thành công */}
                    {appliedVoucher && (
                      <div className='mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start justify-between gap-2'>
                        <div className='flex gap-2 items-center'>
                          <div className='bg-[#E7000B] text-white p-1.5 rounded-lg'><Tag size={14} /></div>
                          <div>
                            <p className='text-sm font-bold text-red-700'>{appliedVoucher.code}</p>
                            <p className='text-xs text-red-600'>
                              Đã giảm {appliedVoucher.type === 'percent' ? `${appliedVoucher.discount}%` : formatCurrency(appliedVoucher.discount)}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setAppliedVoucher(null)} className='text-red-400 hover:text-[#E7000B] font-medium text-xs'>Hủy</button>
                      </div>
                    )}
                  </div>

                  {/* Tính toán chi phí cuối cùng */}
                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span className="font-medium text-gray-900">{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="font-medium text-gray-900">{formatCurrency(shippingFee)}</span>
                    </div>
                    {voucherDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Giảm giá Voucher</span>
                        <span>- {formatCurrency(voucherDiscountAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                    <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-[#E7000B]">{formatCurrency(finalCheckoutPrice)}</span>
                  </div>
                </div>

                {/* Nút Đặt Hàng */}
                <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <button onClick={handleConfirmOrder} className="w-full bg-[#E7000B] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#C10008] transition shadow-lg shadow-red-200 flex items-center justify-center gap-2">
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