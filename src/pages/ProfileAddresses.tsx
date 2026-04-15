import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Star } from 'lucide-react';
import { fetchClient } from '../api/fetchClient';
import { USER_INFO_KEY } from '../api/config';

interface Address {
  _id?: string;
  id?: string | number;
  receiver_name: string;
  phone: string;
  detail: string;
  ward: string;
  district: string;
  province: string;
  is_default?: boolean;
}

export default function ProfileAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');
  const [provinces, setProvinces] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [wards, setWards] = useState<Record<string, unknown>[]>([]);
  const [selectedProv, setSelectedProv] = useState('');
  const [selectedDist, setSelectedDist] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hàm vét cạn mọi format mà backend có thể trả về
  const parseAddresses = (res: unknown): Address[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res as Address[];
    const r = res as Record<string, unknown>;
    if (r.data && Array.isArray(r.data)) return r.data as Address[];
    if (r.addresses && Array.isArray(r.addresses)) return r.addresses as Address[];
    if (r.results && Array.isArray(r.results)) return r.results as Address[];
    if (r.items && Array.isArray(r.items)) return r.items as Address[];
    return [];
  };

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await fetchClient<unknown>('/address').catch(() => null);
      setAddresses(parseAddresses(res));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAddresses(); }, []);

  // Tự động gán tên + sĐT từ Profile khi mở form
  useEffect(() => {
    if (isFormOpen) {
      const raw = localStorage.getItem(USER_INFO_KEY);
      if (raw) {
        try {
          const info = JSON.parse(raw);
          setName(prev => prev || (info.username as string) || '');
          setPhone(prev => prev || (info.phone as string) || '');
        } catch { /* skip */ }
      }
    }
  }, [isFormOpen]);

  useEffect(() => {
    if (isFormOpen && provinces.length === 0) {
      fetch('https://provinces.open-api.vn/api/?depth=3')
        .then(r => r.json())
        .then(data => setProvinces(data))
        .catch(console.error);
    }
  }, [isFormOpen, provinces.length]);

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProv(code);
    setSelectedDist(''); setSelectedWard('');
    const prov = provinces.find(p => p.code == code);
    setDistricts(prov ? (prov.districts as Record<string, unknown>[]) : []);
    setWards([]);
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedDist(code);
    setSelectedWard('');
    const dist = districts.find(d => d.code == code);
    setWards(dist ? (dist.wards as Record<string, unknown>[]) : []);
  };

  const handleSave = async () => {
    if (!name || !phone || !selectedProv || !selectedDist || !selectedWard || !detail) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    const provName = (provinces.find(p => p.code == selectedProv)?.name as string) || '';
    const distName = (districts.find(d => d.code == selectedDist)?.name as string) || '';
    const wardName = (wards.find(w => w.code == selectedWard)?.name as string) || '';
    setIsSaving(true);
    try {
      await fetchClient('/address', {
        method: 'POST',
        body: JSON.stringify({ receiver_name: name, phone, province: provName, district: distName, ward: wardName, detail })
      });
      setName(''); setPhone(''); setDetail('');
      setSelectedProv(''); setSelectedDist(''); setSelectedWard('');
      setIsFormOpen(false);
      await loadAddresses();
    } catch (e: unknown) {
      alert('Tạo thất bại: ' + (e instanceof Error ? e.message : 'Lỗi Server'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string | number | undefined) => {
    if (!id || !window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await fetchClient(`/address/${id}`, { method: 'DELETE' });
      await loadAddresses();
    } catch (e: unknown) {
      alert('Xóa thất bại: ' + (e instanceof Error ? e.message : 'Lỗi Server'));
    }
  };

  const handleSetDefault = async (id: string | number | undefined) => {
    if (!id) return;
    try {
      await fetchClient(`/address/${id}/default`, { method: 'PATCH' });
      await loadAddresses();
    } catch (e: unknown) {
      alert('Lỗi: ' + (e instanceof Error ? e.message : 'Lỗi Server'));
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-red-500" size={24} /> Địa chỉ của tôi
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Quản lý danh sách địa chỉ nhận hàng</p>
        </div>
        <button
          onClick={() => {
            // Reset form trước khi mở (trừ name/phone được xử lý bởi useEffect)
            setName('');
            setPhone('');
            setDetail('');
            setSelectedProv(''); setSelectedDist(''); setSelectedWard('');
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-200 text-sm"
        >
          <Plus size={16} /> Thêm địa chỉ
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-10 animate-pulse">Đang tải địa chỉ...</p>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Bạn chưa có địa chỉ nào.</p>
          <p className="text-sm mt-1">Nhấn "Thêm địa chỉ" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const id = addr._id || addr.id;
            return (
              <div key={String(id)} className={`p-5 border rounded-2xl flex items-start justify-between gap-4 ${addr.is_default ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
                <div className="flex-1 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">{addr.receiver_name}</p>
                    <span className="text-gray-400">|</span>
                    <p className="text-gray-600">{addr.phone}</p>
                    {addr.is_default && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">{`${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(id)}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-xl text-gray-600 hover:border-red-400 hover:text-red-600 transition font-medium"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm Địa Chỉ */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-7 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Thêm địa chỉ mới</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Họ và tên</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên người nhận" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Số điện thoại</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tỉnh/Thành</label>
                  <select value={selectedProv} onChange={handleProvChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 outline-none bg-white text-sm">
                    <option value="">Chọn</option>
                    {provinces.map(p => <option key={String(p.code)} value={String(p.code)}>{String(p.name)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Quận/Huyện</label>
                  <select value={selectedDist} onChange={handleDistChange} disabled={!selectedProv} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 outline-none bg-white text-sm disabled:bg-gray-100">
                    <option value="">Chọn</option>
                    {districts.map(d => <option key={String(d.code)} value={String(d.code)}>{String(d.name)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phường/Xã</label>
                  <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} disabled={!selectedDist} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 outline-none bg-white text-sm disabled:bg-gray-100">
                    <option value="">Chọn</option>
                    {wards.map(w => <option key={String(w.code)} value={String(w.code)}>{String(w.name)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Địa chỉ cụ thể</label>
                <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="Số nhà, tên đường..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setIsFormOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Hủy bỏ</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-60">
                {isSaving ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
