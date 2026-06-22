import { useState } from 'react';
import { Plus, Search, ClipboardList, Calendar, User, Building2, Edit2, Trash2, X, AlertCircle, CheckCircle2, Clock, Circle } from 'lucide-react';
import Modal from '../components/Modal';
import { TRANG_THAI_TASK, UU_TIEN, PHONG_BAN } from '../data/sampleData';

const inputCls = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1';

const taskStatusStyle = {
  'Chưa làm': { cls: 'bg-slate-100 text-slate-600', icon: Circle },
  'Đang làm': { cls: 'bg-blue-100 text-blue-700', icon: Clock },
  'Hoàn thành': { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'Quá hạn': { cls: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const priorityStyle = {
  'Cao': 'bg-red-50 text-red-600 border border-red-200',
  'Trung bình': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Thấp': 'bg-slate-50 text-slate-500 border border-slate-200',
};

function TaskForm({ initial, customers, employees, onSubmit, onCancel }) {
  const empty = { tieu_de: '', mo_ta: '', khach_hang_id: '', nhan_vien_id: '', deadline: '', trang_thai: 'Chưa làm', uu_tien: 'Trung bình' };
  const [form, setForm] = useState(initial || empty);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.tieu_de.trim()) return; onSubmit(form); }} className="space-y-4">
      <div>
        <label className={labelCls}>Tiêu đề công việc <span className="text-red-500">*</span></label>
        <input className={inputCls} value={form.tieu_de} onChange={e => set('tieu_de', e.target.value)} placeholder="Mô tả ngắn công việc..." required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Giao cho</label>
          <select className={inputCls} value={form.nhan_vien_id} onChange={e => set('nhan_vien_id', e.target.value)}>
            <option value="">-- Chọn nhân viên --</option>
            {employees.filter(e => e.trang_thai === 'Đang làm việc').map(e => <option key={e.id} value={e.id}>{e.ho_ten}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Khách hàng liên quan</label>
          <select className={inputCls} value={form.khach_hang_id} onChange={e => set('khach_hang_id', e.target.value)}>
            <option value="">-- Không có --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Deadline</label>
          <input type="date" className={inputCls} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Ưu tiên</label>
          <select className={inputCls} value={form.uu_tien} onChange={e => set('uu_tien', e.target.value)}>
            {UU_TIEN.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Trạng thái</label>
          <select className={inputCls} value={form.trang_thai} onChange={e => set('trang_thai', e.target.value)}>
            {TRANG_THAI_TASK.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Mô tả chi tiết</label>
          <textarea className={inputCls} rows={3} value={form.mo_ta} onChange={e => set('mo_ta', e.target.value)} placeholder="Chi tiết công việc cần làm..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
        <button type="submit" className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">Lưu</button>
      </div>
    </form>
  );
}

export default function TasksPage({ tasks, customers, employees, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmp, setFilterEmp] = useState('');
  const [filterPB, setFilterPB] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const emp = employees.find(e => e.id === t.nhan_vien_id);
    return (!q || t.tieu_de.toLowerCase().includes(q))
      && (!filterStatus || t.trang_thai === filterStatus)
      && (!filterEmp || t.nhan_vien_id === filterEmp)
      && (!filterPB || emp?.phong_ban === filterPB);
  });

  const stats = TRANG_THAI_TASK.map(s => ({ label: s, count: tasks.filter(t => t.trang_thai === s).length }));

  function getEmployee(id) { return employees.find(e => e.id === id); }
  function getCustomer(id) { return customers.find(c => c.id === id); }

  function quickStatus(task, status) {
    onUpdate(task.id, { ...task, trang_thai: status });
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Giao việc</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tasks.length} công việc tổng cộng</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600">
          <Plus size={16} /> Tạo công việc
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map(({ label, count }) => {
          const { cls, icon: Icon } = taskStatusStyle[label];
          return (
            <button key={label} onClick={() => setFilterStatus(filterStatus === label ? '' : label)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${filterStatus === label ? 'border-orange-400 bg-orange-50' : 'bg-white border-slate-200 hover:border-orange-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={cls.split(' ')[1]} />
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterPB('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!filterPB ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-300'}`}>
          Tất cả phòng ban
        </button>
        {PHONG_BAN.map(pb => (
          <button key={pb} onClick={() => setFilterPB(filterPB === pb ? '' : pb)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterPB === pb ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-300'}`}>
            {pb}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Tìm công việc..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
        </div>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
          <option value="">Tất cả nhân viên</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.ho_ten}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <ClipboardList size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Không có công việc nào</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const { cls, icon: Icon } = taskStatusStyle[task.trang_thai] || taskStatusStyle['Chưa làm'];
            const emp = getEmployee(task.nhan_vien_id);
            const cust = getCustomer(task.khach_hang_id);
            const isOverdue = task.deadline && task.deadline < today && task.trang_thai !== 'Hoàn thành';
            return (
              <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-orange-200 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Icon size={18} className={`${cls.split(' ')[1]} flex-shrink-0`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium text-sm ${task.trang_thai === 'Hoàn thành' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.tieu_de}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                        <button onClick={() => setEditing(task)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                        <button onClick={() => setConfirmDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    {task.mo_ta && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.mo_ta}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{task.trang_thai}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyle[task.uu_tien]}`}>{task.uu_tien}</span>
                      {emp && <span className="flex items-center gap-1 text-xs text-slate-500"><User size={11} />{emp.ho_ten}</span>}
                      {cust && <span className="flex items-center gap-1 text-xs text-slate-500"><Building2 size={11} />{cust.ten}</span>}
                      {task.deadline && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          <Calendar size={11} />{task.deadline}{isOverdue && ' (Quá hạn)'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <select
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                      value={task.trang_thai}
                      onChange={e => quickStatus(task, e.target.value)}
                    >
                      {TRANG_THAI_TASK.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <Modal title="Tạo công việc mới" onClose={() => setShowForm(false)} size="md">
        <TaskForm customers={customers} employees={employees} onSubmit={d => { onAdd(d); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      </Modal>}
      {editing && <Modal title="Chỉnh sửa công việc" onClose={() => setEditing(null)} size="md">
        <TaskForm initial={editing} customers={customers} employees={employees} onSubmit={d => { onUpdate(editing.id, d); setEditing(null); }} onCancel={() => setEditing(null)} />
      </Modal>}
      {confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-slate-600 mb-6">Bạn có chắc muốn xóa công việc này?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
