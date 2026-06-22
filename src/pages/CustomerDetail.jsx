import { ArrowLeft, Edit2, Trash2, Plus, Building2, MapPin, Globe, FileText, Phone, Mail, MessageCircle, Star, Edit3 } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ContactForm from '../components/ContactForm';
import { useState } from 'react';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerDetail({ customer, contacts, allCustomers, onBack, onEdit, onDelete, onAddContact, onUpdateContact, onDeleteContact }) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [confirmDeleteContact, setConfirmDeleteContact] = useState(null);

  function handleAddContact(data) {
    onAddContact(data);
    setShowContactForm(false);
  }

  function handleEditContact(data) {
    onUpdateContact(editingContact.id, data);
    setEditingContact(null);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 flex-1">{customer.ten}</h1>
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
          <Edit2 size={14} /> Chỉnh sửa
        </button>
        {onDelete && (
          <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
            <Trash2 size={14} /> Xóa
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Building2 size={22} className="text-orange-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{customer.ten}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge label={customer.loai} />
                    <Badge label={customer.trang_thai} />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 border-t border-slate-100 pt-3">
              <InfoRow icon={MapPin} label="Địa chỉ" value={customer.dia_chi || customer.tinh_thanh} />
              <InfoRow icon={FileText} label="Mã số thuế" value={customer.ma_so_thue} />
              <InfoRow icon={Globe} label="Website" value={customer.website} />
              <InfoRow icon={MapPin} label="Tỉnh/Thành" value={customer.tinh_thanh} />
            </div>
            {customer.san_pham_quan_tam?.length > 0 && (
              <div className="border-t border-slate-100 pt-3 mt-1">
                <p className="text-xs text-slate-500 mb-2">Sản phẩm quan tâm</p>
                <div className="flex flex-wrap gap-2">
                  {customer.san_pham_quan_tam.map(sp => (
                    <span key={sp} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200">{sp}</span>
                  ))}
                </div>
              </div>
            )}
            {customer.ghi_chu && (
              <div className="border-t border-slate-100 pt-3 mt-1">
                <p className="text-xs text-slate-500 mb-1">Ghi chú</p>
                <p className="text-sm text-slate-700">{customer.ghi_chu}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Liên hệ ({contacts.length})</h3>
              <button
                onClick={() => setShowContactForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Plus size={14} /> Thêm liên hệ
              </button>
            </div>
            {contacts.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Chưa có liên hệ nào</p>
            ) : (
              <div className="space-y-3">
                {contacts.map(ct => (
                  <div key={ct.id} className="border border-slate-200 rounded-lg p-4 hover:border-orange-200 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-semibold text-sm">{ct.ho_ten.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 text-sm">{ct.ho_ten}</span>
                            {ct.la_nguoi_quyet_dinh && (
                              <Star size={12} className="text-yellow-500 fill-yellow-400" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{ct.chuc_vu}{ct.phong_ban ? ` · ${ct.phong_ban}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setEditingContact(ct)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded">
                          <Edit3 size={13} />
                        </button>
                        {onDeleteContact && (
                          <button onClick={() => setConfirmDeleteContact(ct.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {ct.dien_thoai && (
                        <a href={`tel:${ct.dien_thoai}`} className="flex items-center gap-1 text-xs text-slate-600 hover:text-orange-600">
                          <Phone size={11} /> {ct.dien_thoai}
                        </a>
                      )}
                      {ct.email && (
                        <a href={`mailto:${ct.email}`} className="flex items-center gap-1 text-xs text-slate-600 hover:text-orange-600">
                          <Mail size={11} /> {ct.email}
                        </a>
                      )}
                      {ct.zalo && (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <MessageCircle size={11} /> Zalo: {ct.zalo}
                        </span>
                      )}
                    </div>
                    {ct.ghi_chu && <p className="text-xs text-slate-400 mt-1.5 italic">{ct.ghi_chu}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-sm space-y-2">
            <h4 className="font-semibold text-slate-700 mb-3">Thông tin nhanh</h4>
            <div className="flex justify-between"><span className="text-slate-500">Nguồn</span><span className="font-medium">{customer.nguon}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Ngày tạo</span><span className="font-medium">{customer.ngay_tao}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Số liên hệ</span><span className="font-medium">{contacts.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Người QĐ</span><span className="font-medium">{contacts.filter(c => c.la_nguoi_quyet_dinh).length}</span></div>
          </div>
        </div>
      </div>

      {showContactForm && (
        <Modal title="Thêm liên hệ" onClose={() => setShowContactForm(false)} size="md">
          <ContactForm
            customers={allCustomers}
            preselectedCustomerId={customer.id}
            onSubmit={handleAddContact}
            onCancel={() => setShowContactForm(false)}
          />
        </Modal>
      )}

      {editingContact && (
        <Modal title="Chỉnh sửa liên hệ" onClose={() => setEditingContact(null)} size="md">
          <ContactForm
            initial={editingContact}
            customers={allCustomers}
            onSubmit={handleEditContact}
            onCancel={() => setEditingContact(null)}
          />
        </Modal>
      )}

      {onDeleteContact && confirmDeleteContact && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDeleteContact(null)} size="sm">
          <p className="text-slate-600 mb-6">Bạn có chắc muốn xóa liên hệ này?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDeleteContact(null)} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">Hủy</button>
            <button onClick={() => { onDeleteContact(confirmDeleteContact); setConfirmDeleteContact(null); }} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
