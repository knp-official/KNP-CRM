import { useState, useEffect } from 'react';
import { Plus, Search, Wallet, Edit2, Trash2, X, AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal';
import { TRANG_THAI_CN } from '../data/sampleData';

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';
const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0);

const debtStatusStyle = {
  'Chưa thanh toán': { cls: 'bg-slate-100 text-slate-600', icon: Clock },
  'Thanh toán một phần': { cls: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  'Đã thanh toán': { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'Quá hạn': { cls: 'bg-red-100 text-red-700', icon: AlertCircle },
};

function DebtForm({ initial, customers, onSubmit, onCancel }) {
  const empty = { khach_hang_id: '', so_hoa_don: '', mo_ta: '', so_tien: '', da_thanh_toan: 0, ngay_hoa_don: new Date().toISOString().split('T')[0], ngay_den_han: '', trang_thai: 'Chưa thanh toán', ghi_chu: '' };
  const [form, setForm] = useState(initial ? { ...initial } : empty);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const con_lai = Math.max(0, (+form.so_tien || 0) - (+form.da_thanh_toan || 0));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, so_tien: +form.so_tien, da_thanh_toan: +form.da_thanh_toan }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Khách hàng <span className="text-red-500">*</span></label>
          <select className={inputCls} value={form.khach_hang_id} onChange={e => set('khach_hang_id', e.target.value)} required>
            <option value="">-- Chọn khách hàng --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Số hóa đơn</label>
          <input className={inputCls} value={form.so_hoa_don} onChange={e => set('so_hoa_don', e.target.value)} placeholder="HD-2024-001" />
        </div>
        <div>
          <label className={labelCls}>Ngày hóa đơn</label>
          <input type="date" className={inputCls} value={form.ngay_hoa_don} onChange={e => set('ngay_hoa_don', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Ngày đến hạn</label>
          <input type="date" className={inputCls} value={form.ngay_den_han} onChange={e => set('ngay_den_han', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Trạng thái</label>
          <select className={inputCls} value={form.trang_thai} onChange={e => set('trang_thai', e.target.value)}>
            {TRANG_THAI_CN.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Mô tả / Hạng mục</label>
          <input className={inputCls} value={form.mo_ta} onChange={e => set('mo_ta', e.target.value)} placeholder="Ống gió chống cháy đợt 1..." />
        </div>
        <div>
          <label className={labelCls}>Tổng tiền (đ) <span className="text-red-500">*</span></label>
          <input type="number" min="0" className={inputCls} value={form.so_tien} onChange={e => set('so_tien', e.target.value)} placeholder="0" required />
        </div>
        <div>
          <label className={labelCls}>Đã thanh toán (đ)</label>
          <input type="number" min="0" className={inputCls} value={form.da_thanh_toan} onChange={e => set('da_thanh_toan', e.target.value)} placeholder="0" />
        </div>
      </div>
      {form.so_tien > 0 && (
        <div className="bg-orange-50 rounded-lg px-4 py-3 text-sm flex justify-between items-center">
          <span className="text-slate-600">Còn lại phải thu:</span>
          <span className="font-bold text-orange-600 text-base">{fmt(con_lai)} đ</span>
        </div>
      )}
      <div>
        <label className={labelCls}>Ghi chú</label>
        <textarea className={inputCls} rows={2} value={form.ghi_chu} onChange={e => set('ghi_chu', e.target.value)} placeholder="Ghi chú thêm..." />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
        <button type="submit" className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">Lưu</button>
      </div>
    </form>
  );
}

export default function DebtsPage({ debts, customers, onAdd, onUpdate, onDelete }) {
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const isMobile = winWidth < 768;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const filtered = debts.filter(d => {
    const q = search.toLowerCase();
    const cust = customers.find(c => c.id === d.khach_hang_id);
    return (!q || d.so_hoa_don?.toLowerCase().includes(q) || d.mo_ta?.toLowerCase().includes(q) || cust?.ten.toLowerCase().includes(q))
      && (!filterStatus || d.trang_thai === filterStatus)
      && (!filterCustomer || d.khach_hang_id === filterCustomer);
  });

  const totalDebt = debts.reduce((s, d) => s + (+d.so_tien || 0), 0);
  const totalPaid = debts.reduce((s, d) => s + (+d.da_thanh_toan || 0), 0);
  const totalOwed = totalDebt - totalPaid;
  const overdueTotal = debts.filter(d => d.ngay_den_han < today && d.trang_thai !== 'Đã thanh toán').reduce((s, d) => s + (+d.so_tien - +d.da_thanh_toan), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Công nợ</h1>
          <p className="text-slate-500 text-sm mt-0.5">Theo dõi thanh toán từ khách hàng</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600">
          <Plus size={16} /> Thêm công nợ
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Tổng phải thu', value: fmt(totalDebt) + ' đ', cls: 'text-slate-900' },
          { label: 'Đã thu', value: fmt(totalPaid) + ' đ', cls: 'text-emerald-600' },
          { label: 'Còn lại', value: fmt(totalOwed) + ' đ', cls: 'text-orange-600' },
          { label: 'Quá hạn', value: fmt(overdueTotal) + ' đ', cls: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Tìm hóa đơn, khách hàng..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
        </div>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {TRANG_THAI_CN.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)}>
          <option value="">Tất cả KH</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Wallet size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Không có dữ liệu công nợ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-sm" style={{ minWidth: '600px' }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Hóa đơn</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Khách hàng</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Hạng mục</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Tổng tiền</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Đã TT</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Còn lại</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Đến hạn</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(d => {
                const cust = customers.find(c => c.id === d.khach_hang_id);
                const conLai = (+d.so_tien || 0) - (+d.da_thanh_toan || 0);
                const isOverdue = d.ngay_den_han && d.ngay_den_han < today && d.trang_thai !== 'Đã thanh toán';
                const { cls, icon: Icon } = debtStatusStyle[d.trang_thai] || debtStatusStyle['Chưa thanh toán'];
                return (
                  <tr key={d.id} className="hover:bg-slate-50 group">
                    <td className="px-4 py-3 font-medium text-slate-700">{d.so_hoa_don}</td>
                    <td className="px-4 py-3 text-slate-700">{cust?.ten || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-40 truncate">{d.mo_ta}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(d.so_tien)} đ</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{fmt(d.da_thanh_toan)} đ</td>
                    <td className={`px-4 py-3 text-right font-bold ${conLai > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{fmt(conLai)} đ</td>
                    <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{d.ngay_den_han || '—'}{isOverdue && ' ⚠'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${cls}`}>
                        <Icon size={10} />{d.trang_thai}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setEditing(d)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                        {onDelete && <button onClick={() => setConfirmDelete(d.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <Modal title="Thêm công nợ" onClose={() => setShowForm(false)} size="md">
        <DebtForm customers={customers} onSubmit={d => { onAdd(d); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      </Modal>}
      {editing && <Modal title="Chỉnh sửa công nợ" onClose={() => setEditing(null)} size="md">
        <DebtForm initial={editing} customers={customers} onSubmit={d => { onUpdate(editing.id, d); setEditing(null); }} onCancel={() => setEditing(null)} />
      </Modal>}
      {onDelete && confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-slate-600 mb-6">Xóa bản ghi công nợ này?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
