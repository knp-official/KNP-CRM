import { useState } from 'react';
import { LOAI_KHACH_HANG, TRANG_THAI_KH, NGUON_KH, SAN_PHAM, TINH_THANH } from '../data/sampleData';

const empty = {
  ten: '', loai: 'Nhà thầu M&E', tinh_thanh: 'TP. Hồ Chí Minh',
  dia_chi: '', website: '', ma_so_thue: '',
  trang_thai: 'Tiềm năng', nguon: 'Giới thiệu',
  san_pham_quan_tam: [], ghi_chu: '', ngay_sinh_lien_he: '',
};

export default function CustomerForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || empty);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  function toggleProduct(sp) {
    const cur = form.san_pham_quan_tam;
    set('san_pham_quan_tam', cur.includes(sp) ? cur.filter(x => x !== sp) : [...cur, sp]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.ten.trim()) return;
    onSubmit(form);
  }

  const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Tên công ty <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.ten} onChange={e => set('ten', e.target.value)} placeholder="Nhập tên công ty..." required />
        </div>
        <div>
          <label className={labelCls}>Loại khách hàng</label>
          <select className={inputCls} value={form.loai} onChange={e => set('loai', e.target.value)}>
            {LOAI_KHACH_HANG.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Trạng thái</label>
          <select className={inputCls} value={form.trang_thai} onChange={e => set('trang_thai', e.target.value)}>
            {TRANG_THAI_KH.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Tỉnh / Thành phố</label>
          <select className={inputCls} value={form.tinh_thanh} onChange={e => set('tinh_thanh', e.target.value)}>
            {TINH_THANH.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Nguồn khách hàng</label>
          <select className={inputCls} value={form.nguon} onChange={e => set('nguon', e.target.value)}>
            {NGUON_KH.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Địa chỉ</label>
          <input className={inputCls} value={form.dia_chi} onChange={e => set('dia_chi', e.target.value)} placeholder="Địa chỉ công ty..." />
        </div>
        <div>
          <label className={labelCls}>Mã số thuế</label>
          <input className={inputCls} value={form.ma_so_thue} onChange={e => set('ma_so_thue', e.target.value)} placeholder="0300000000" />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input className={inputCls} value={form.website} onChange={e => set('website', e.target.value)} placeholder="www.example.com" />
        </div>
        <div>
          <label className={labelCls}>Ngày sinh người liên hệ chính</label>
          <input type="date" className={inputCls} value={form.ngay_sinh_lien_he || ''} onChange={e => set('ngay_sinh_lien_he', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Sản phẩm quan tâm</label>
        <div className="flex flex-wrap gap-2">
          {SAN_PHAM.map(sp => (
            <label key={sp} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.san_pham_quan_tam.includes(sp)}
                onChange={() => toggleProduct(sp)}
                className="rounded accent-orange-500"
              />
              <span className="text-sm text-slate-700">{sp}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Ghi chú</label>
        <textarea className={inputCls} rows={3} value={form.ghi_chu} onChange={e => set('ghi_chu', e.target.value)} placeholder="Ghi chú thêm về khách hàng..." />
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
