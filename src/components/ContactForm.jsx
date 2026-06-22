import { useState } from 'react';

const empty = {
  ho_ten: '', chuc_vu: '', phong_ban: '',
  dien_thoai: '', email: '', zalo: '',
  la_nguoi_quyet_dinh: false, ghi_chu: '',
};

export default function ContactForm({ initial, customers, preselectedCustomerId, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { ...empty, khach_hang_id: preselectedCustomerId || '' });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.ho_ten.trim() || !form.khach_hang_id) return;
    onSubmit(form);
  }

  const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Thuộc công ty <span className="text-red-500">*</span></label>
        <select className={inputCls} value={form.khach_hang_id} onChange={e => set('khach_hang_id', e.target.value)} required>
          <option value="">-- Chọn công ty --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Họ và tên <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.ho_ten} onChange={e => set('ho_ten', e.target.value)} placeholder="Nhập họ và tên..." required />
        </div>
        <div>
          <label className={labelCls}>Chức vụ</label>
          <input className={inputCls} value={form.chuc_vu} onChange={e => set('chuc_vu', e.target.value)} placeholder="Giám đốc, Kỹ sư..." />
        </div>
        <div>
          <label className={labelCls}>Phòng ban</label>
          <input className={inputCls} value={form.phong_ban} onChange={e => set('phong_ban', e.target.value)} placeholder="Kỹ thuật, Kinh doanh..." />
        </div>
        <div>
          <label className={labelCls}>Điện thoại</label>
          <input className={inputCls} value={form.dien_thoai} onChange={e => set('dien_thoai', e.target.value)} placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label className={labelCls}>Zalo</label>
          <input className={inputCls} value={form.zalo} onChange={e => set('zalo', e.target.value)} placeholder="Số Zalo..." />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Email</label>
          <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.com" />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.la_nguoi_quyet_dinh}
          onChange={e => set('la_nguoi_quyet_dinh', e.target.checked)}
          className="rounded accent-orange-500 w-4 h-4"
        />
        <span className="text-sm font-medium text-slate-700">Là người quyết định / ký hợp đồng</span>
      </label>

      <div>
        <label className={labelCls}>Ghi chú</label>
        <textarea className={inputCls} rows={2} value={form.ghi_chu} onChange={e => set('ghi_chu', e.target.value)} placeholder="Ghi chú thêm..." />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
          Hủy
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600">
          Lưu
        </button>
      </div>
    </form>
  );
}
