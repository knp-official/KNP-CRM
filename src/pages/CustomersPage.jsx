import { useState } from 'react';
import { Plus, Search, Building2, MapPin, Phone, Edit2, Trash2, ChevronRight, X } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import CustomerForm from '../components/CustomerForm';
import CustomerDetail from './CustomerDetail';
import { LOAI_KHACH_HANG, TRANG_THAI_KH } from '../data/sampleData';

export default function CustomersPage({ customers, contacts, onAdd, onUpdate, onDelete, onAddContact, onUpdateContact, onDeleteContact }) {
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.ten.toLowerCase().includes(q) || c.tinh_thanh?.toLowerCase().includes(q) || c.ma_so_thue?.includes(q);
    const matchLoai = !filterLoai || c.loai === filterLoai;
    const matchStatus = !filterStatus || c.trang_thai === filterStatus;
    return matchQ && matchLoai && matchStatus;
  });

  function handleAdd(data) {
    onAdd(data);
    setShowForm(false);
  }

  function handleEdit(data) {
    onUpdate(editing.id, data);
    setEditing(null);
  }

  function handleDelete(id) {
    onDelete(id);
    setConfirmDelete(null);
  }

  const selectCls = 'border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white';

  if (viewing) {
    const customer = customers.find(c => c.id === viewing);
    const customerContacts = contacts.filter(ct => ct.khach_hang_id === viewing);
    return (
      <CustomerDetail
        customer={customer}
        contacts={customerContacts}
        allCustomers={customers}
        onBack={() => setViewing(null)}
        onEdit={() => { setEditing(customer); setViewing(null); }}
        onDelete={() => { setConfirmDelete(customer.id); setViewing(null); }}
        onAddContact={onAddContact}
        onUpdateContact={onUpdateContact}
        onDeleteContact={onDeleteContact}
      />
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khách hàng</h1>
          <p className="text-slate-500 text-sm mt-0.5">{customers.length} công ty trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={16} /> Thêm khách hàng
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Tìm tên công ty, tỉnh thành, mã số thuế..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <select className={selectCls} value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
          <option value="">Tất cả loại</option>
          {LOAI_KHACH_HANG.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className={selectCls} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {TRANG_THAI_KH.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Không tìm thấy khách hàng</p>
          <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc thêm khách hàng mới</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Công ty</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Loại</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Tỉnh/Thành</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Ngày tạo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const contactCount = contacts.filter(ct => ct.khach_hang_id === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-orange-600" />
                        </div>
                        <div>
                          <button
                            onClick={() => setViewing(c.id)}
                            className="font-medium text-slate-900 hover:text-orange-600 text-left"
                          >
                            {c.ten}
                          </button>
                          {contactCount > 0 && (
                            <p className="text-xs text-slate-400">{contactCount} liên hệ</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge label={c.loai} /></td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />{c.tinh_thanh}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge label={c.trang_thai} /></td>
                    <td className="px-4 py-3 text-slate-500">{c.ngay_tao}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewing(c.id)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded">
                          <ChevronRight size={15} />
                        </button>
                        <button onClick={() => setEditing(c)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded">
                          <Edit2 size={15} />
                        </button>
                        {onDelete && (
                          <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Thêm khách hàng mới" onClose={() => setShowForm(false)} size="lg">
          <CustomerForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Chỉnh sửa khách hàng" onClose={() => setEditing(null)} size="lg">
          <CustomerForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {onDelete && confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
