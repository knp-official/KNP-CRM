import { useState } from 'react';
import { Plus, Search, FileText, Printer, Edit2, Trash2, X } from 'lucide-react';
import Modal from '../components/Modal';
import { TRANG_THAI_BG, SAN_PHAM_BG } from '../data/sampleData';

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

const NEW_KH = '__new__';

const bgStatusColor = {
  'Nháp': 'bg-slate-100 text-slate-600',
  'Chờ duyệt': 'bg-yellow-100 text-yellow-700',
  'Đã duyệt': 'bg-blue-100 text-blue-700',
  'Đã gửi KH': 'bg-purple-100 text-purple-700',
  'Thắng': 'bg-emerald-100 text-emerald-700',
  'Thua': 'bg-red-100 text-red-600',
};

// ─── Combobox sản phẩm: gõ tự do hoặc chọn từ danh mục ───────────────────────
function ProductCombo({ value, onChange }) {
  const listId = 'sp-datalist';
  function handleChange(e) {
    const val = e.target.value;
    const preset = SAN_PHAM_BG.find(s => s.ten === val);
    onChange(val, preset || null);
  }
  return (
    <>
      <input
        list={listId}
        className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
        value={value}
        onChange={handleChange}
        placeholder="Chọn hoặc nhập sản phẩm..."
      />
      <datalist id={listId}>
        {SAN_PHAM_BG.map(s => <option key={s.ten} value={s.ten} />)}
      </datalist>
    </>
  );
}

// ─── Form tạo / chỉnh sửa báo giá ────────────────────────────────────────────
function QuoteForm({ initial, customers, employees, onSubmit, onAddCustomer, onCancel }) {
  const emptyItem = { san_pham: '', don_vi: '', so_luong: 1, don_gia: 0, thanh_tien: 0 };
  const emptyNew = { ten: '', lien_he: '', dien_thoai: '', email: '' };

  const [form, setForm] = useState(() => initial
    ? { ...initial }
    : { khach_hang_id: '', nguoi_lam: '', ngay_het_han: '', trang_thai: 'Nháp', ghi_chu: '', items: [{ ...emptyItem }], tong_chua_vat: 0, vat: 0, tong_sau_vat: 0 }
  );
  const [newKH, setNewKH] = useState(emptyNew);
  const setNewKHField = (f, v) => setNewKH(p => ({ ...p, [f]: v }));

  const isNewKH = form.khach_hang_id === NEW_KH;

  // ── Tính lại tổng ──
  function recalc(items) {
    const tong = items.reduce((s, i) => s + (Number(i.thanh_tien) || 0), 0);
    const vat = Math.round(tong * 0.1);
    setForm(f => ({ ...f, items, tong_chua_vat: tong, vat, tong_sau_vat: tong + vat }));
  }

  // ── Cập nhật 1 ô trong bảng sản phẩm ──
  function setItemField(idx, field, val, preset) {
    const items = form.items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: val };
      // Khi chọn sản phẩm từ danh mục → tự điền ĐVT và đơn giá
      if (field === 'san_pham' && preset) {
        updated.don_vi = preset.don_vi;
        updated.don_gia = preset.don_gia;
      }
      // Tính thành tiền
      const sl = field === 'so_luong' ? +val : +updated.so_luong;
      const dg = field === 'don_gia' ? +val : +updated.don_gia;
      updated.thanh_tien = sl * dg;
      return updated;
    });
    recalc(items);
  }

  function addItem() { recalc([...form.items, { ...emptyItem }]); }
  function removeItem(idx) { recalc(form.items.filter((_, i) => i !== idx)); }

  async function handleSubmit(e) {
    e.preventDefault();
    let finalId = form.khach_hang_id;

    // Nếu chọn "Tạo khách hàng mới" → lưu KH vào localStorage trước
    if (isNewKH) {
      if (!newKH.ten.trim()) return;
      const created = onAddCustomer({
        ten: newKH.ten.trim(),
        loai: 'Khác',
        tinh_thanh: 'TP. Hồ Chí Minh',
        dia_chi: '',
        website: '',
        ma_so_thue: '',
        trang_thai: 'Tiềm năng',
        nguon: 'Báo giá',
        san_pham_quan_tam: [],
        ghi_chu: `Liên hệ: ${newKH.lien_he} | ${newKH.dien_thoai} | ${newKH.email}`,
      });
      finalId = created.id;
    }

    onSubmit({ ...form, khach_hang_id: finalId });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Thông tin chung ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Dropdown khách hàng */}
        <div className="col-span-2">
          <label className={labelCls}>Khách hàng <span className="text-red-500">*</span></label>
          <select
            className={inputCls}
            value={form.khach_hang_id}
            onChange={e => setForm(f => ({ ...f, khach_hang_id: e.target.value }))}
            required={!isNewKH}
          >
            <option value="">-- Chọn khách hàng --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
            <option value={NEW_KH}>➕ Tạo khách hàng mới</option>
          </select>
        </div>

        {/* Panel tạo KH mới (chỉ hiện khi chọn NEW_KH) */}
        {isNewKH && (
          <div className="col-span-2 border border-orange-200 bg-orange-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Thông tin khách hàng mới</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Tên công ty <span className="text-red-500">*</span></label>
                <input className={inputCls} value={newKH.ten} onChange={e => setNewKHField('ten', e.target.value)}
                  placeholder="Công ty TNHH..." required={isNewKH} />
              </div>
              <div>
                <label className={labelCls}>Người liên hệ</label>
                <input className={inputCls} value={newKH.lien_he} onChange={e => setNewKHField('lien_he', e.target.value)}
                  placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className={labelCls}>Số điện thoại</label>
                <input className={inputCls} value={newKH.dien_thoai} onChange={e => setNewKHField('dien_thoai', e.target.value)}
                  placeholder="09xxxxxxxx" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Email</label>
                <input type="email" className={inputCls} value={newKH.email} onChange={e => setNewKHField('email', e.target.value)}
                  placeholder="email@company.com" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Người lập báo giá</label>
          <select className={inputCls} value={form.nguoi_lam} onChange={e => setForm(f => ({ ...f, nguoi_lam: e.target.value }))}>
            <option value="">-- Chọn --</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.ho_ten}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Hiệu lực đến ngày</label>
          <input type="date" className={inputCls} value={form.ngay_het_han}
            onChange={e => setForm(f => ({ ...f, ngay_het_han: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Trạng thái</label>
          <select className={inputCls} value={form.trang_thai} onChange={e => setForm(f => ({ ...f, trang_thai: e.target.value }))}>
            {TRANG_THAI_BG.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* ── Bảng sản phẩm ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Danh sách sản phẩm</label>
          <button type="button" onClick={addItem}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
            <Plus size={12} /> Thêm dòng
          </button>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Sản phẩm / Dịch vụ</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600 w-16">ĐVT</th>
                <th className="text-right px-2 py-2 font-medium text-slate-600 w-14">SL</th>
                <th className="text-right px-2 py-2 font-medium text-slate-600 w-28">Đơn giá (đ)</th>
                <th className="text-right px-2 py-2 font-medium text-slate-600 w-28">Thành tiền</th>
                <th className="w-7"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {form.items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-2 py-1.5">
                    <ProductCombo
                      value={item.san_pham}
                      onChange={(val, preset) => setItemField(i, 'san_pham', val, preset)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                      value={item.don_vi}
                      onChange={e => setItemField(i, 'don_vi', e.target.value, null)}
                      placeholder="m²"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min="0"
                      className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-orange-400"
                      value={item.so_luong}
                      onChange={e => setItemField(i, 'so_luong', e.target.value, null)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" min="0"
                      className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-orange-400"
                      value={item.don_gia}
                      onChange={e => setItemField(i, 'don_gia', e.target.value, null)}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-slate-700 whitespace-nowrap">
                    {fmt(item.thanh_tien)}
                  </td>
                  <td className="px-1 py-1.5">
                    <button type="button" onClick={() => removeItem(i)}
                      className="p-0.5 text-slate-300 hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {form.items.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-3">
            Chưa có sản phẩm nào — nhấn <strong>Thêm dòng</strong> để bắt đầu
          </p>
        )}

        {/* Tổng tiền */}
        <div className="bg-slate-50 rounded-lg p-3 mt-2 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Tổng chưa VAT</span>
            <span className="font-medium">{fmt(form.tong_chua_vat)} đ</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>VAT (10%)</span>
            <span>{fmt(form.vat)} đ</span>
          </div>
          <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
            <span>Tổng sau VAT</span>
            <span className="text-orange-600">{fmt(form.tong_sau_vat)} đ</span>
          </div>
        </div>
      </div>

      {/* Ghi chú */}
      <div>
        <label className={labelCls}>Ghi chú</label>
        <textarea className={inputCls} rows={2} value={form.ghi_chu}
          onChange={e => setForm(f => ({ ...f, ghi_chu: e.target.value }))}
          placeholder="Ghi chú thêm cho báo giá..." />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
        <button type="submit" className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">Lưu báo giá</button>
      </div>
    </form>
  );
}

// ─── Preview / In báo giá ─────────────────────────────────────────────────────
function PrintQuote({ quote, customer, employee }) {
  return (
    <div>
      <div className="space-y-4 text-sm">
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold text-slate-900">CÔNG TY TNHH KIM NGÂN PHÁT</h2>
          <p className="text-slate-500 text-xs mt-1">Chuyên sản xuất ống gió chống cháy, phụ kiện HVAC, thạch cao</p>
          <h3 className="text-lg font-bold mt-3 text-orange-600">BÁO GIÁ — {quote.so_bao_gia}</h3>
          <p className="text-xs text-slate-500">Ngày lập: {quote.ngay_tao} | Hiệu lực: {quote.ngay_het_han || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">KÍNH GỬI:</p>
            <p className="font-semibold">{customer?.ten}</p>
            {customer?.dia_chi && <p className="text-xs text-slate-600">{customer.dia_chi}</p>}
            {customer?.ma_so_thue && <p className="text-xs text-slate-600">MST: {customer.ma_so_thue}</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">NGƯỜI LẬP:</p>
            <p className="font-semibold">{employee?.ho_ten || '—'}</p>
            {employee?.dien_thoai && <p className="text-xs text-slate-600">{employee.dien_thoai}</p>}
          </div>
        </div>
        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">STT</th>
              <th className="text-left px-3 py-2 font-semibold">Sản phẩm / Dịch vụ</th>
              <th className="text-center px-3 py-2 font-semibold">ĐVT</th>
              <th className="text-right px-3 py-2 font-semibold">SL</th>
              <th className="text-right px-3 py-2 font-semibold">Đơn giá</th>
              <th className="text-right px-3 py-2 font-semibold">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quote.items?.map((item, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{item.san_pham}</td>
                <td className="px-3 py-2 text-center">{item.don_vi}</td>
                <td className="px-3 py-2 text-right">{fmt(item.so_luong)}</td>
                <td className="px-3 py-2 text-right">{fmt(item.don_gia)}</td>
                <td className="px-3 py-2 text-right font-semibold">{fmt(item.thanh_tien)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Tổng chưa VAT:</span><span className="font-medium">{fmt(quote.tong_chua_vat)} đ</span></div>
            <div className="flex justify-between"><span className="text-slate-600">VAT (10%):</span><span>{fmt(quote.vat)} đ</span></div>
            <div className="flex justify-between border-t pt-1 font-bold text-base"><span>TỔNG CỘNG:</span><span className="text-orange-600">{fmt(quote.tong_sau_vat)} đ</span></div>
          </div>
        </div>
        {quote.ghi_chu && <p className="text-xs text-slate-600 border-t pt-3"><strong>Ghi chú:</strong> {quote.ghi_chu}</p>}
      </div>
      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">
          <Printer size={15} /> In / Xuất PDF
        </button>
      </div>
    </div>
  );
}

// ─── Trang chính ──────────────────────────────────────────────────────────────
export default function QuotesPage({ quotes, customers, employees, onAdd, onUpdate, onDelete, onAddCustomer }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = quotes.filter(q => {
    const q2 = search.toLowerCase();
    const cust = customers.find(c => c.id === q.khach_hang_id);
    return (!q2 || q.so_bao_gia.toLowerCase().includes(q2) || cust?.ten.toLowerCase().includes(q2))
      && (!filterStatus || q.trang_thai === filterStatus);
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo giá</h1>
          <p className="text-slate-500 text-sm mt-0.5">{quotes.length} báo giá trong hệ thống</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600">
          <Plus size={16} /> Tạo báo giá
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Tìm số BG, tên khách hàng..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
        </div>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {TRANG_THAI_BG.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Chưa có báo giá nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Số BG</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Khách hàng</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Ngày tạo</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Hiệu lực</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Tổng tiền</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Trạng thái</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(q => {
                const cust = customers.find(c => c.id === q.khach_hang_id);
                return (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-orange-600">
                      <button onClick={() => setViewing(q)} className="hover:underline">{q.so_bao_gia}</button>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{cust?.ten || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{q.ngay_tao}</td>
                    <td className="px-4 py-3 text-slate-500">{q.ngay_het_han || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(q.tong_sau_vat)} đ</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bgStatusColor[q.trang_thai] || 'bg-slate-100 text-slate-600'}`}>
                        {q.trang_thai}
                      </span>
                    </td>
                    {/* Nút thao tác — luôn hiển thị */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewing(q)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded" title="Xem / In">
                          <Printer size={14} />
                        </button>
                        <button onClick={() => setEditing(q)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          <Edit2 size={12} /> Chỉnh sửa
                        </button>
                        <button onClick={() => setConfirmDelete(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="Xóa">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo mới */}
      {showForm && (
        <Modal title="Tạo báo giá mới" onClose={() => setShowForm(false)} size="lg">
          <QuoteForm
            customers={customers}
            employees={employees}
            onAddCustomer={onAddCustomer}
            onSubmit={d => { onAdd(d); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      {/* Modal chỉnh sửa — load đầy đủ dữ liệu cũ qua initial */}
      {editing && (
        <Modal title={`Chỉnh sửa — ${editing.so_bao_gia}`} onClose={() => setEditing(null)} size="lg">
          <QuoteForm
            initial={editing}
            customers={customers}
            employees={employees}
            onAddCustomer={onAddCustomer}
            onSubmit={d => { onUpdate(editing.id, d); setEditing(null); }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {/* Modal xem / in */}
      {viewing && (
        <Modal title={`Xem báo giá — ${viewing.so_bao_gia}`} onClose={() => setViewing(null)} size="lg">
          <PrintQuote
            quote={viewing}
            customer={customers.find(c => c.id === viewing.khach_hang_id)}
            employee={employees.find(e => e.id === viewing.nguoi_lam)}
          />
        </Modal>
      )}

      {/* Confirm xóa */}
      {confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-slate-600 mb-6">Xóa báo giá này khỏi hệ thống?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
