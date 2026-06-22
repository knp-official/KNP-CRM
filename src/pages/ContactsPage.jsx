import { useState } from 'react';
import { Plus, Search, Users, Phone, Mail, MessageCircle, Star, Edit2, Trash2, X } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ContactForm from '../components/ContactForm';

export default function ContactsPage({ contacts, customers, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const getCompany = (id) => customers.find(c => c.id === id);

  const filtered = contacts.filter(ct => {
    const q = search.toLowerCase();
    const company = getCompany(ct.khach_hang_id);
    const matchQ = !q || ct.ho_ten.toLowerCase().includes(q) || ct.dien_thoai?.includes(q) || ct.email?.toLowerCase().includes(q);
    const matchCompany = !filterCompany || ct.khach_hang_id === filterCompany;
    return matchQ && matchCompany;
  });

  function handleAdd(data) {
    onAdd(data);
    setShowForm(false);
  }

  function handleEdit(data) {
    onUpdate(editing.id, data);
    setEditing(null);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Liên hệ</h1>
          <p className="text-slate-500 text-sm mt-0.5">{contacts.length} liên hệ trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
        >
          <Plus size={16} /> Thêm liên hệ
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Tìm tên, điện thoại, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          value={filterCompany}
          onChange={e => setFilterCompany(e.target.value)}
        >
          <option value="">Tất cả công ty</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Users size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium">Không tìm thấy liên hệ</p>
          <p className="text-sm mt-1">Thêm liên hệ mới để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(ct => {
            const company = getCompany(ct.khach_hang_id);
            return (
              <div key={ct.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-orange-200 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold">{ct.ho_ten.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 text-sm">{ct.ho_ten}</span>
                        {ct.la_nguoi_quyet_dinh && <Star size={12} className="text-yellow-500 fill-yellow-400" />}
                      </div>
                      <p className="text-xs text-slate-500">{ct.chuc_vu}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                    <button onClick={() => setEditing(ct)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded">
                      <Edit2 size={13} />
                    </button>
                    {onDelete && (
                      <button onClick={() => setConfirmDelete(ct.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {company && (
                  <div className="mb-3">
                    <Badge label={company.loai} />
                    <p className="text-xs text-slate-600 mt-1 font-medium truncate">{company.ten}</p>
                  </div>
                )}

                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  {ct.dien_thoai && (
                    <a href={`tel:${ct.dien_thoai}`} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-orange-600">
                      <Phone size={12} className="text-slate-400" /> {ct.dien_thoai}
                    </a>
                  )}
                  {ct.email && (
                    <a href={`mailto:${ct.email}`} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-orange-600 truncate">
                      <Mail size={12} className="text-slate-400" /> {ct.email}
                    </a>
                  )}
                  {ct.zalo && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MessageCircle size={12} className="text-slate-400" /> Zalo: {ct.zalo}
                    </span>
                  )}
                </div>

                {ct.ghi_chu && (
                  <p className="text-xs text-slate-400 italic mt-2 border-t border-slate-100 pt-2 line-clamp-2">{ct.ghi_chu}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal title="Thêm liên hệ mới" onClose={() => setShowForm(false)}>
          <ContactForm customers={customers} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Chỉnh sửa liên hệ" onClose={() => setEditing(null)}>
          <ContactForm initial={editing} customers={customers} onSubmit={handleEdit} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {onDelete && confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-slate-600 mb-6">Bạn có chắc muốn xóa liên hệ này?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
