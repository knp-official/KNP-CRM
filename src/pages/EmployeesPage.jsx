import { useState } from 'react';
import { Plus, Search, UserCheck, Phone, Mail, Edit2, Trash2, X, Calendar, Cake, ChevronDown, Shield, Users } from 'lucide-react';
import Modal from '../components/Modal';
import { PHONG_BAN, TRANG_THAI_NV, VAI_TRO_NV } from '../data/sampleData';

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

const statusColors = {
  'Đang làm việc': 'bg-emerald-100 text-emerald-700',
  'Nghỉ phép': 'bg-yellow-100 text-yellow-700',
  'Đã nghỉ việc': 'bg-slate-100 text-slate-500',
};

const roleStyle = {
  'Admin':    { cls: 'bg-red-100 text-red-700',    label: 'Admin' },
  'Quản lý':  { cls: 'bg-orange-100 text-orange-700', label: 'Quản lý' },
  'Nhân viên':{ cls: 'bg-slate-100 text-slate-500',  label: 'Nhân viên' },
};

const SORT_OPTIONS = [
  { value: 'ten_az',      label: 'Tên A → Z' },
  { value: 'ten_za',      label: 'Tên Z → A' },
  { value: 'chucvu_az',   label: 'Chức vụ A → Z' },
  { value: 'chucvu_za',   label: 'Chức vụ Z → A' },
  { value: 'vao_lam_moi', label: 'Ngày vào làm mới nhất' },
  { value: 'vao_lam_cu',  label: 'Ngày vào làm cũ nhất' },
  { value: 'tuoi_lon',    label: 'Tuổi lớn nhất' },
  { value: 'tuoi_nho',    label: 'Tuổi nhỏ nhất' },
  { value: 'sinh_nhat_gan', label: 'Sinh nhật gần nhất' },
];

function calcAge(ngay_sinh) {
  if (!ngay_sinh) return null;
  const today = new Date();
  const birth = new Date(ngay_sinh);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function daysUntilBirthday(ngay_sinh) {
  if (!ngay_sinh) return 9999;
  const today = new Date();
  const birth = new Date(ngay_sinh);
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / 86400000);
}

function applySort(list, sort) {
  const cmp = (a, b, key) => (a[key] || '').localeCompare(b[key] || '', 'vi');
  switch (sort) {
    case 'ten_az':        return [...list].sort((a, b) => cmp(a, b, 'ho_ten'));
    case 'ten_za':        return [...list].sort((a, b) => cmp(b, a, 'ho_ten'));
    case 'chucvu_az':     return [...list].sort((a, b) => cmp(a, b, 'chuc_vu'));
    case 'chucvu_za':     return [...list].sort((a, b) => cmp(b, a, 'chuc_vu'));
    case 'vao_lam_moi':   return [...list].sort((a, b) => (b.ngay_vao_lam || '').localeCompare(a.ngay_vao_lam || ''));
    case 'vao_lam_cu':    return [...list].sort((a, b) => (a.ngay_vao_lam || '').localeCompare(b.ngay_vao_lam || ''));
    case 'tuoi_lon':      return [...list].sort((a, b) => (a.ngay_sinh || '9999').localeCompare(b.ngay_sinh || '9999'));
    case 'tuoi_nho':      return [...list].sort((a, b) => (b.ngay_sinh || '0000').localeCompare(a.ngay_sinh || '0000'));
    case 'sinh_nhat_gan': return [...list].sort((a, b) => daysUntilBirthday(a.ngay_sinh) - daysUntilBirthday(b.ngay_sinh));
    default:              return list;
  }
}

function EmployeeForm({ initial, employees, onSubmit, onCancel }) {
  const empty = {
    ho_ten: '', chuc_vu: '', phong_ban: 'Phòng Kinh doanh', vai_tro: 'Nhân viên',
    quan_ly_id: '', dien_thoai: '', email: '', ngay_vao_lam: '', ngay_sinh: '',
    trang_thai: 'Đang làm việc', ghi_chu: '',
  };
  const [form, setForm] = useState(initial || empty);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  // Exclude self from manager list
  const managerOptions = employees.filter(e => e.id !== initial?.id);

  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.ho_ten.trim()) return; onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Họ và tên <span className="text-red-500">*</span></label>
          <input className={inputCls} value={form.ho_ten} onChange={e => set('ho_ten', e.target.value)} placeholder="Nguyễn Văn A" required />
        </div>
        <div>
          <label className={labelCls}>Chức vụ</label>
          <input className={inputCls} value={form.chuc_vu} onChange={e => set('chuc_vu', e.target.value)} placeholder="Nhân viên kinh doanh..." />
        </div>
        <div>
          <label className={labelCls}>Phòng ban</label>
          <select className={inputCls} value={form.phong_ban} onChange={e => set('phong_ban', e.target.value)}>
            {PHONG_BAN.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Vai trò hệ thống</label>
          <select className={inputCls} value={form.vai_tro || 'Nhân viên'} onChange={e => set('vai_tro', e.target.value)}>
            {VAI_TRO_NV.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Người quản lý trực tiếp</label>
          <select className={inputCls} value={form.quan_ly_id || ''} onChange={e => set('quan_ly_id', e.target.value)}>
            <option value="">— Không có —</option>
            {managerOptions.map(e => <option key={e.id} value={e.id}>{e.ho_ten} ({e.chuc_vu || e.phong_ban})</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Điện thoại</label>
          <input className={inputCls} value={form.dien_thoai} onChange={e => set('dien_thoai', e.target.value)} placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@knp.vn" />
        </div>
        <div>
          <label className={labelCls}>Ngày sinh</label>
          <input type="date" className={inputCls} value={form.ngay_sinh} onChange={e => set('ngay_sinh', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Ngày vào làm</label>
          <input type="date" className={inputCls} value={form.ngay_vao_lam} onChange={e => set('ngay_vao_lam', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Trạng thái</label>
          <select className={inputCls} value={form.trang_thai} onChange={e => set('trang_thai', e.target.value)}>
            {TRANG_THAI_NV.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Ghi chú</label>
          <textarea className={inputCls} rows={2} value={form.ghi_chu} onChange={e => set('ghi_chu', e.target.value)} placeholder="Ghi chú thêm..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
        <button type="submit" className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">Lưu</button>
      </div>
    </form>
  );
}

export default function EmployeesPage({ employees, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterPB, setFilterPB] = useState('');
  const [sort, setSort] = useState('ten_az');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.ho_ten.toLowerCase().includes(q) || e.chuc_vu?.toLowerCase().includes(q) || e.dien_thoai?.includes(q))
      && (!filterPB || e.phong_ban === filterPB);
  });

  const sorted = applySort(filtered, sort);

  const pbGroups = PHONG_BAN.map(p => ({
    label: p,
    count: employees.filter(e => e.phong_ban === p && e.trang_thai === 'Đang làm việc').length,
  }));

  function getManagerName(quan_ly_id) {
    const mgr = employees.find(e => e.id === quan_ly_id);
    return mgr ? mgr.ho_ten : null;
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhân viên</h1>
          <p className="text-slate-500 text-sm mt-0.5">{employees.filter(e => e.trang_thai === 'Đang làm việc').length} đang làm việc</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer text-slate-700"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600">
            <Plus size={16} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Phòng ban chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPB('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!filterPB ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-300'}`}
        >
          Tất cả ({employees.filter(e => e.trang_thai === 'Đang làm việc').length})
        </button>
        {pbGroups.map(g => (
          <button
            key={g.label}
            onClick={() => setFilterPB(filterPB === g.label ? '' : g.label)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterPB === g.label ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-300'}`}
          >
            {g.label.replace('Phòng ', '')} ({g.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="Tìm tên, chức vụ, số điện thoại..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
      </div>

      {(search || filterPB) && (
        <p className="text-xs text-slate-500">
          Hiển thị {sorted.length} / {employees.length} nhân viên
          {filterPB && <span className="ml-1 text-orange-500 font-medium">· {filterPB}</span>}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {sorted.map(emp => {
          const age = calcAge(emp.ngay_sinh);
          const daysLeft = daysUntilBirthday(emp.ngay_sinh);
          const birthdaySoon = daysLeft <= 7;
          const role = roleStyle[emp.vai_tro] || roleStyle['Nhân viên'];
          const managerName = getManagerName(emp.quan_ly_id);

          return (
            <div key={emp.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-orange-200 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{emp.ho_ten.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{emp.ho_ten}</p>
                    <p className="text-xs text-slate-500">{emp.chuc_vu}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setEditing(emp)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                  {onDelete && <button onClick={() => setConfirmDelete(emp.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${role.cls}`}>
                  <Shield size={9} className="inline mr-0.5 -mt-0.5" />{role.label}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                  {emp.phong_ban?.replace('Phòng ', '')}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[emp.trang_thai] || 'bg-slate-100 text-slate-600'}`}>
                  {emp.trang_thai}
                </span>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                {managerName && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users size={12} className="text-slate-400" />Quản lý: <span className="font-medium text-slate-700">{managerName}</span>
                  </p>
                )}
                {emp.dien_thoai && (
                  <a href={`tel:${emp.dien_thoai}`} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-orange-600">
                    <Phone size={12} className="text-slate-400" />{emp.dien_thoai}
                  </a>
                )}
                {emp.email && (
                  <a href={`mailto:${emp.email}`} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-orange-600 truncate">
                    <Mail size={12} className="text-slate-400" />{emp.email}
                  </a>
                )}
                {emp.ngay_sinh && (
                  <p className={`flex items-center gap-1.5 text-xs ${birthdaySoon ? 'text-orange-600 font-medium' : 'text-slate-500'}`}>
                    <Cake size={12} className={birthdaySoon ? 'text-orange-500' : 'text-orange-400'} />
                    {age !== null ? `${age} tuổi` : ''}
                    <span className="text-slate-400">· {emp.ngay_sinh.slice(5).replace('-', '/')}</span>
                    {birthdaySoon && daysLeft === 0 && <span className="ml-1 text-orange-500">🎂 Hôm nay!</span>}
                    {birthdaySoon && daysLeft > 0 && <span className="ml-1 text-orange-400">({daysLeft} ngày nữa)</span>}
                  </p>
                )}
                {emp.ngay_vao_lam && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={12} className="text-slate-400" />Vào làm: {emp.ngay_vao_lam}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <UserCheck size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Không tìm thấy nhân viên</p>
        </div>
      )}

      {showForm && (
        <Modal title="Thêm nhân viên" onClose={() => setShowForm(false)} size="md">
          <EmployeeForm employees={employees} onSubmit={d => { onAdd(d); setShowForm(false); }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Chỉnh sửa nhân viên" onClose={() => setEditing(null)} size="md">
          <EmployeeForm initial={editing} employees={employees} onSubmit={d => { onUpdate(editing.id, d); setEditing(null); }} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {onDelete && confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-slate-600 mb-6">Bạn có chắc muốn xóa nhân viên này?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
