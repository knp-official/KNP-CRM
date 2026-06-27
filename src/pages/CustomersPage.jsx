import { useState } from 'react';
import {
  Plus, Search, Building2, MapPin, Edit2, Trash2,
  ChevronRight, X, Users, Phone, Mail, MessageCircle, Star,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import CustomerForm from '../components/CustomerForm';
import ContactForm from '../components/ContactForm';
import CustomerDetail from './CustomerDetail';
import { LOAI_KHACH_HANG, TRANG_THAI_KH } from '../data/sampleData';

const selectStyle = {
  border: '1px solid #D1D5DB', borderRadius: '8px',
  padding: '8px 12px', fontSize: '13px',
  backgroundColor: '#fff', outline: 'none', cursor: 'pointer',
};

const inputStyle = {
  width: '100%', border: '1px solid #D1D5DB', borderRadius: '8px',
  padding: '8px 12px 8px 36px', fontSize: '13px',
  outline: 'none', boxSizing: 'border-box',
};

function EmptyState({ icon: Icon, msg, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8' }}>
      <Icon size={40} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
      <p style={{ fontWeight: '600', color: '#64748B', margin: '0 0 4px' }}>{msg}</p>
      {sub && <p style={{ fontSize: '13px', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default function CustomersPage({
  customers, contacts,
  onAdd, onUpdate, onDelete,
  onAddContact, onUpdateContact, onDeleteContact,
  currentUserUid, isEmployee,
}) {
  // ── Tab ───────────────────────────────────────────────────────────────
  const [innerTab, setInnerTab] = useState('companies');

  // ── Companies state ───────────────────────────────────────────────────
  const [search,        setSearch]        = useState('');
  const [filterLoai,    setFilterLoai]    = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [showForm,      setShowForm]      = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [viewing,       setViewing]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── Contacts state ────────────────────────────────────────────────────
  const [ctSearch,         setCtSearch]         = useState('');
  const [ctFilterCompany,  setCtFilterCompany]  = useState('');
  const [ctShowForm,       setCtShowForm]       = useState(false);
  const [ctEditing,        setCtEditing]        = useState(null);
  const [ctConfirmDelete,  setCtConfirmDelete]  = useState(null);

  // ── Companies logic ───────────────────────────────────────────────────
  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.ten.toLowerCase().includes(q) || c.tinh_thanh?.toLowerCase().includes(q) || c.ma_so_thue?.includes(q))
      && (!filterLoai   || c.loai === filterLoai)
      && (!filterStatus || c.trang_thai === filterStatus);
  });

  const canEditCustomer = (c) => !!onUpdate && (!isEmployee || c.managedBy === currentUserUid);

  function handleAdd(data)   { onAdd(data); setShowForm(false); }
  function handleEdit(data)  { onUpdate(editing.id, data); setEditing(null); }
  function handleDelete(id)  { onDelete(id); setConfirmDelete(null); }

  // ── Contacts logic ────────────────────────────────────────────────────
  const getCompany = (id) => customers.find(c => c.id === id);

  const ctFiltered = contacts.filter(ct => {
    const q = ctSearch.toLowerCase();
    return (!q || ct.ho_ten.toLowerCase().includes(q) || ct.dien_thoai?.includes(q) || ct.email?.toLowerCase().includes(q))
      && (!ctFilterCompany || ct.khach_hang_id === ctFilterCompany);
  });

  function handleCtAdd(data)  { onAddContact(data); setCtShowForm(false); }
  function handleCtEdit(data) { onUpdateContact(ctEditing.id, data); setCtEditing(null); }

  // ── CustomerDetail (full-page, hides everything else) ─────────────────
  if (viewing) {
    const customer         = customers.find(c => c.id === viewing);
    const customerContacts = contacts.filter(ct => ct.khach_hang_id === viewing);
    return (
      <CustomerDetail
        customer={customer}
        contacts={customerContacts}
        allCustomers={customers}
        onBack={() => setViewing(null)}
        onEdit={canEditCustomer(customer) ? () => { setEditing(customer); setViewing(null); } : null}
        onDelete={onDelete ? () => { setConfirmDelete(customer.id); setViewing(null); } : null}
        onAddContact={onAddContact}
        onUpdateContact={onUpdateContact}
        onDeleteContact={onDeleteContact}
      />
    );
  }

  // ── Tab styles ─────────────────────────────────────────────────────────
  const tabActive = {
    padding: '9px 22px', fontSize: '14px', fontWeight: '600',
    color: '#F15A22', backgroundColor: '#fff',
    border: '1px solid #E8E8E8', borderBottom: '2px solid #F15A22',
    borderRadius: '8px 8px 0 0', cursor: 'pointer', fontFamily: 'inherit',
  };
  const tabInactive = {
    padding: '9px 22px', fontSize: '14px', fontWeight: '500',
    color: '#888', backgroundColor: '#F8F8F8',
    border: '1px solid transparent',
    borderRadius: '8px 8px 0 0', cursor: 'pointer', fontFamily: 'inherit',
  };
  const btnPrimary = {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '9px 16px', fontSize: '13px', fontWeight: '600',
    backgroundColor: '#F15A22', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>Khách hàng</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: '3px 0 0' }}>
            {customers.length} công ty · {contacts.length} liên hệ
          </p>
        </div>
        {innerTab === 'companies' && onAdd && (
          <button onClick={() => setShowForm(true)} style={btnPrimary}>
            <Plus size={15} /> Thêm công ty
          </button>
        )}
        {innerTab === 'contacts' && onAddContact && (
          <button onClick={() => setCtShowForm(true)} style={btnPrimary}>
            <Plus size={15} /> Thêm liên hệ
          </button>
        )}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E8E8E8', gap: '4px' }}>
        <button onClick={() => setInnerTab('companies')} style={innerTab === 'companies' ? tabActive : tabInactive}>
          🏢 Công ty
          <span style={{ marginLeft: '6px', fontSize: '12px', color: innerTab === 'companies' ? '#F15A22' : '#CBD5E1' }}>
            ({customers.length})
          </span>
        </button>
        <button onClick={() => setInnerTab('contacts')} style={innerTab === 'contacts' ? tabActive : tabInactive}>
          👤 Liên hệ
          <span style={{ marginLeft: '6px', fontSize: '12px', color: innerTab === 'contacts' ? '#F15A22' : '#CBD5E1' }}>
            ({contacts.length})
          </span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAB: CÔNG TY
      ════════════════════════════════════════════════════════════════ */}
      {innerTab === 'companies' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                style={inputStyle}
                placeholder="Tìm tên công ty, tỉnh thành, mã số thuế..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <select style={selectStyle} value={filterLoai} onChange={e => setFilterLoai(e.target.value)}>
              <option value="">Tất cả loại</option>
              {LOAI_KHACH_HANG.map(l => <option key={l}>{l}</option>)}
            </select>
            <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {TRANG_THAI_KH.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <EmptyState icon={Building2} msg="Không tìm thấy khách hàng" sub="Thử thay đổi bộ lọc hoặc thêm khách hàng mới" />
          ) : (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {['Công ty', 'Loại', 'Tỉnh/Thành', 'Trạng thái', 'Ngày tạo', ''].map(h => (
                      <th key={h} style={{ textAlign: h === '' ? 'right' : 'left', padding: '10px 16px', fontWeight: '600', color: '#64748B', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const contactCount = contacts.filter(ct => ct.khach_hang_id === c.id).length;
                    return (
                      <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none' }}
                        className="group hover:bg-slate-50 transition-colors">
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: '#FFF7ED', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Building2 size={14} style={{ color: '#EA580C' }} />
                            </div>
                            <div>
                              <button onClick={() => setViewing(c.id)} style={{ fontWeight: '600', color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', fontFamily: 'inherit' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#F15A22'}
                                onMouseLeave={e => e.currentTarget.style.color = '#1A1A1A'}>
                                {c.ten}
                              </button>
                              {contactCount > 0 && <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{contactCount} liên hệ</p>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}><Badge label={c.loai} /></td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} style={{ color: '#9CA3AF' }} />{c.tinh_thanh}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}><Badge label={c.trang_thai} /></td>
                        <td style={{ padding: '12px 16px', color: '#94A3B8' }}>{c.ngay_tao}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div className="opacity-0 group-hover:opacity-100" style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setViewing(c.id)} style={iconBtn} title="Xem chi tiết"><ChevronRight size={15} /></button>
                            {canEditCustomer(c) && (
                              <button onClick={() => setEditing(c)} style={iconBtn} title="Chỉnh sửa"><Edit2 size={15} /></button>
                            )}
                            {onDelete && (
                              <button onClick={() => setConfirmDelete(c.id)} style={{ ...iconBtn, color: '#EF4444' }} title="Xóa"><Trash2 size={15} /></button>
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
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TAB: LIÊN HỆ
      ════════════════════════════════════════════════════════════════ */}
      {innerTab === 'contacts' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                style={inputStyle}
                placeholder="Tìm tên, điện thoại, email..."
                value={ctSearch}
                onChange={e => setCtSearch(e.target.value)}
              />
              {ctSearch && (
                <button onClick={() => setCtSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <select style={selectStyle} value={ctFilterCompany} onChange={e => setCtFilterCompany(e.target.value)}>
              <option value="">Tất cả công ty</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
            </select>
          </div>

          {/* Grid */}
          {ctFiltered.length === 0 ? (
            <EmptyState icon={Users} msg="Không tìm thấy liên hệ" sub="Thêm liên hệ mới để bắt đầu" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {ctFiltered.map(ct => {
                const company = getCompany(ct.khach_hang_id);
                return (
                  <div key={ct.id} className="group" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E8E8E8', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#FDDCCA'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E8E8'}>

                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: '#1D4ED8', fontWeight: '700', fontSize: '16px' }}>{ct.ho_ten.charAt(0)}</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: '#1A1A1A' }}>{ct.ho_ten}</span>
                            {ct.la_nguoi_quyet_dinh && <Star size={12} style={{ color: '#F59E0B', fill: '#FBBF24' }} />}
                          </div>
                          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{ct.chuc_vu}</p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100" style={{ display: 'flex', gap: '2px' }}>
                        {onUpdateContact && (
                          <button onClick={() => setCtEditing(ct)} style={iconBtnSm}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.color = '#1D4ED8'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#aaa'; }}>
                            <Edit2 size={13} />
                          </button>
                        )}
                        {onDeleteContact && (
                          <button onClick={() => setCtConfirmDelete(ct.id)} style={iconBtnSm}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#aaa'; }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Company badge */}
                    {company && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', padding: '5px 8px', backgroundColor: '#FFF7ED', borderRadius: '6px' }}>
                        <Building2 size={11} style={{ color: '#F15A22', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#C2440E', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.ten}</span>
                      </div>
                    )}

                    {/* Contact info */}
                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {ct.dien_thoai && (
                        <a href={`tel:${ct.dien_thoai}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#414042', textDecoration: 'none' }}>
                          <Phone size={12} style={{ color: '#9CA3AF' }} /> {ct.dien_thoai}
                        </a>
                      )}
                      {ct.email && (
                        <a href={`mailto:${ct.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#414042', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <Mail size={12} style={{ color: '#9CA3AF' }} /> {ct.email}
                        </a>
                      )}
                      {ct.zalo && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#414042' }}>
                          <MessageCircle size={12} style={{ color: '#9CA3AF' }} /> Zalo: {ct.zalo}
                        </span>
                      )}
                    </div>

                    {ct.ghi_chu && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', marginTop: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {ct.ghi_chu}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════ MODALS: COMPANIES ════ */}
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
          <p style={{ color: '#64748B', marginBottom: '24px', fontSize: '14px' }}>Bạn có chắc muốn xóa khách hàng này? Hành động này không thể hoàn tác.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 16px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
            <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Xóa</button>
          </div>
        </Modal>
      )}

      {/* ════ MODALS: CONTACTS ════ */}
      {ctShowForm && (
        <Modal title="Thêm liên hệ mới" onClose={() => setCtShowForm(false)}>
          <ContactForm customers={customers} onSubmit={handleCtAdd} onCancel={() => setCtShowForm(false)} />
        </Modal>
      )}
      {ctEditing && (
        <Modal title="Chỉnh sửa liên hệ" onClose={() => setCtEditing(null)}>
          <ContactForm initial={ctEditing} customers={customers} onSubmit={handleCtEdit} onCancel={() => setCtEditing(null)} />
        </Modal>
      )}
      {onDeleteContact && ctConfirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setCtConfirmDelete(null)} size="sm">
          <p style={{ color: '#64748B', marginBottom: '24px', fontSize: '14px' }}>Bạn có chắc muốn xóa liên hệ này?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setCtConfirmDelete(null)} style={{ padding: '8px 16px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
            <button onClick={() => { onDeleteContact(ctConfirmDelete); setCtConfirmDelete(null); }} style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Xóa</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Shared icon button styles ──────────────────────────────────────────────
const iconBtn = {
  padding: '5px', color: '#9CA3AF', background: 'none', border: 'none',
  borderRadius: '6px', cursor: 'pointer', display: 'inline-flex',
};
const iconBtnSm = {
  padding: '5px', color: '#aaa', background: 'transparent', border: 'none',
  borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', transition: 'all 0.15s',
};
