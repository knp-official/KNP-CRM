import { useState } from 'react';
import { Plus, Search, UserCheck, Phone, Mail, Trash2, X, Calendar, Cake, ChevronDown, Shield, Users, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';
import { PHONG_BAN, TRANG_THAI_NV, VAI_TRO_NV } from '../data/sampleData';

/* ── Design tokens ────────────────────────────────────────────────────── */
const PRIMARY   = '#F15A22';
const TEXT1     = '#111827';
const TEXT2     = '#6B7280';
const BORDER    = '#e5e7eb';
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px #e5e7eb';

const ACCT_STATUS = {
  active:  { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', label: 'Đang hoạt động', icon: '●' },
  pending: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', label: 'Chưa kích hoạt',  icon: '○' },
};

const STATUS_COLORS = {
  'Đang làm việc': { bg: '#EAF3DE', color: '#27500A' },
  'Nghỉ phép':     { bg: '#FFFBEB', color: '#B45309' },
  'Đã nghỉ việc':  { bg: '#F3F4F6', color: '#6B7280' },
};

/* Avatar background theo vai_tro (field string trong Firestore) */
const AVATAR_BG = {
  'Admin':     '#534AB7',
  'Quản lý':   '#1D9E75',
  'Nhân viên': '#F15A22',
};

const ROLE_STYLE = {
  'Admin':     { bg: '#EEEDFE', color: '#3C3489' },
  'Quản lý':   { bg: '#E1F5EE', color: '#085041' },
  'Nhân viên': { bg: '#F1EFE8', color: '#444441' },
};

const SORT_OPTIONS = [
  { value: 'ten_az',        label: 'Tên A → Z' },
  { value: 'ten_za',        label: 'Tên Z → A' },
  { value: 'chucvu_az',     label: 'Chức vụ A → Z' },
  { value: 'chucvu_za',     label: 'Chức vụ Z → A' },
  { value: 'vao_lam_moi',   label: 'Ngày vào làm mới nhất' },
  { value: 'vao_lam_cu',    label: 'Ngày vào làm cũ nhất' },
  { value: 'tuoi_lon',      label: 'Tuổi lớn nhất' },
  { value: 'tuoi_nho',      label: 'Tuổi nhỏ nhất' },
  { value: 'sinh_nhat_gan', label: 'Sinh nhật gần nhất' },
];

function calcAge(ngay_sinh) {
  if (!ngay_sinh) return null;
  const today = new Date(), birth = new Date(ngay_sinh);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function daysUntilBirthday(ngay_sinh) {
  if (!ngay_sinh) return 9999;
  const today = new Date(), birth = new Date(ngay_sinh);
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

/* ── ViewEmployeeModal ──────────────────────────────────────────────── */
function ViewEmployeeModal({ emp, employees, onClose }) {
  const managerName = employees.find(e => e.id === emp.quan_ly_id)?.ho_ten || '';
  const field = (label, value) => (
    <div>
      <p style={{ fontSize: '11px', fontWeight: '600', color: TEXT2, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: '14px', color: TEXT1, padding: '8px 12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: `1px solid ${BORDER}`, minHeight: '36px', margin: 0 }}>{value || '—'}</p>
    </div>
  );
  return (
    <Modal title="Thông tin nhân viên" onClose={onClose} size="md">
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#FFF3EE', border: '1px solid #FDDCCA', borderRadius: '10px', marginBottom: '20px' }}>
          <span style={{ fontSize: '15px' }}>🔒</span>
          <span style={{ fontSize: '13px', color: '#C2440E', fontWeight: '600' }}>Chế độ chỉ xem — bạn không thể chỉnh sửa hồ sơ này</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#E8500A,#C2440E)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '22px' }}>{emp.ho_ten?.charAt(0)}</span>
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '17px', fontWeight: '700', color: TEXT1 }}>{emp.ho_ten}</p>
            <p style={{ margin: 0, fontSize: '13px', color: TEXT2 }}>{emp.chuc_vu} · {emp.phong_ban}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {field('Chức vụ', emp.chuc_vu)}
          {field('Phòng ban', emp.phong_ban)}
          {field('Vai trò', emp.vai_tro)}
          {field('Trạng thái', emp.trang_thai)}
          {field('Điện thoại', emp.dien_thoai)}
          {field('Email', emp.email)}
          {field('Ngày vào làm', emp.ngay_vao_lam)}
          {field('Ngày sinh', emp.ngay_sinh)}
        </div>
        {managerName && <div style={{ marginBottom: '12px' }}>{field('Quản lý trực tiếp', managerName)}</div>}
        {emp.ghi_chu && <div style={{ marginBottom: '12px' }}>{field('Ghi chú', emp.ghi_chu)}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={onClose} style={{ padding: '9px 24px', fontSize: '14px', fontWeight: '600', backgroundColor: PRIMARY, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Đóng</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── EmployeeForm ───────────────────────────────────────────────────── */
const inputS = {
  width: '100%', border: `1px solid ${BORDER}`, borderRadius: '8px',
  padding: '8px 12px', fontSize: '14px', color: TEXT1, outline: 'none',
  fontFamily: "'Inter', system-ui, sans-serif", boxSizing: 'border-box',
  backgroundColor: '#fff',
};
const labelS = { display: 'block', fontSize: '13px', fontWeight: '500', color: TEXT2, marginBottom: '5px' };

function EmployeeForm({ initial, employees, onSubmit, onCancel, readOnly = false }) {
  const empty = { ho_ten: '', chuc_vu: '', phong_ban: 'Phòng Kinh doanh', vai_tro: 'Nhân viên', quan_ly_id: '', dien_thoai: '', email: '', ngay_vao_lam: '', ngay_sinh: '', trang_thai: 'Đang làm việc', ghi_chu: '' };
  const [form, setForm] = useState(initial || empty);
  const set = (f, v) => { if (!readOnly) setForm(p => ({ ...p, [f]: v })); };
  const managerOptions = employees.filter(e => e.id !== initial?.id);
  const dis = readOnly ? { backgroundColor: '#F9FAFB', color: TEXT2, cursor: 'not-allowed', opacity: 0.8 } : {};

  return (
    <form onSubmit={e => { e.preventDefault(); if (readOnly || !form.ho_ten.trim()) return; onSubmit(form); }} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {readOnly && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E', marginBottom: '16px' }}>
          <span>🔒</span><span>Bạn không có quyền chỉnh sửa thông tin này.</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelS}>Họ và tên</label>
          <input style={{ ...inputS, ...dis }} value={form.ho_ten} onChange={e => set('ho_ten', e.target.value)} placeholder="Nguyễn Văn A" disabled={readOnly} />
        </div>
        <div>
          <label style={labelS}>Chức vụ</label>
          <input style={{ ...inputS, ...dis }} value={form.chuc_vu} onChange={e => set('chuc_vu', e.target.value)} placeholder="Nhân viên kinh doanh..." disabled={readOnly} />
        </div>
        <div>
          <label style={labelS}>Phòng ban</label>
          <select style={{ ...inputS, ...dis }} value={form.phong_ban} onChange={e => set('phong_ban', e.target.value)} disabled={readOnly}>
            {PHONG_BAN.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelS}>Vai trò hệ thống</label>
          <select style={{ ...inputS, ...dis }} value={form.vai_tro || 'Nhân viên'} onChange={e => set('vai_tro', e.target.value)} disabled={readOnly}>
            {VAI_TRO_NV.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={labelS}>Người quản lý trực tiếp</label>
          <select style={{ ...inputS, ...dis }} value={form.quan_ly_id || ''} onChange={e => set('quan_ly_id', e.target.value)} disabled={readOnly}>
            <option value="">— Không có —</option>
            {managerOptions.map(e => <option key={e.id} value={e.id}>{e.ho_ten} ({e.chuc_vu || e.phong_ban})</option>)}
          </select>
        </div>
        <div>
          <label style={labelS}>Điện thoại</label>
          <input style={{ ...inputS, ...dis }} value={form.dien_thoai} onChange={e => set('dien_thoai', e.target.value)} placeholder="09xxxxxxxx" disabled={readOnly} />
        </div>
        <div>
          <label style={labelS}>Email</label>
          <input type="email" style={{ ...inputS, ...dis }} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@knp.vn" disabled={readOnly} />
        </div>
        <div>
          <label style={labelS}>Ngày sinh</label>
          <input type="date" style={{ ...inputS, ...dis }} value={form.ngay_sinh} onChange={e => set('ngay_sinh', e.target.value)} disabled={readOnly} />
        </div>
        <div>
          <label style={labelS}>Ngày vào làm</label>
          <input type="date" style={{ ...inputS, ...dis }} value={form.ngay_vao_lam} onChange={e => set('ngay_vao_lam', e.target.value)} disabled={readOnly} />
        </div>
        <div>
          <label style={labelS}>Trạng thái</label>
          <select style={{ ...inputS, ...dis }} value={form.trang_thai} onChange={e => set('trang_thai', e.target.value)} disabled={readOnly}>
            {TRANG_THAI_NV.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelS}>Ghi chú</label>
          <textarea style={{ ...inputS, ...dis, resize: 'vertical', minHeight: '64px' }} rows={2} value={form.ghi_chu} onChange={e => set('ghi_chu', e.target.value)} placeholder="Ghi chú thêm..." disabled={readOnly} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px', paddingTop: '16px', borderTop: `1px solid ${BORDER}` }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 18px', fontSize: '14px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#fff', color: TEXT1, cursor: 'pointer', fontFamily: 'inherit' }}>
          {readOnly ? 'Đóng' : 'Hủy'}
        </button>
        {!readOnly && (
          <button type="submit" style={{ padding: '8px 18px', fontSize: '14px', fontWeight: '600', backgroundColor: PRIMARY, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Lưu</button>
        )}
      </div>
    </form>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function EmployeesPage({ employees, onAdd, onUpdate, onDelete, myEmployeeId, isEmployee, onNavigate }) {
  const [search, setSearch]         = useState('');
  const [filterPB, setFilterPB]     = useState('');
  const [sort, setSort]             = useState('ten_az');
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [viewing, setViewing]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activationModal, setActivationModal] = useState(null);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.ho_ten.toLowerCase().includes(q) || e.chuc_vu?.toLowerCase().includes(q) || e.dien_thoai?.includes(q))
      && (!filterPB || e.phong_ban === filterPB);
  });
  const sorted = applySort(filtered, sort);

  const pbGroups = PHONG_BAN.map(p => ({ label: p, count: employees.filter(e => e.phong_ban === p && e.trang_thai === 'Đang làm việc').length }));

  function getManagerName(quan_ly_id) { return employees.find(e => e.id === quan_ly_id)?.ho_ten || null; }

  function handleCardClick(emp) {
    if (typeof onUpdate === 'function' && !isEmployee) { setEditing(emp); }
    else { setViewing(emp); }
  }

  return (
    <div style={{ padding: '28px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: TEXT1, margin: '0 0 4px' }}>Nhân sự</h1>
          <p style={{ fontSize: '14px', color: TEXT2, margin: 0 }}>{employees.filter(e => e.trang_thai === 'Đang làm việc').length} đang làm việc</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ ...inputS, width: 'auto', paddingRight: '32px', appearance: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: TEXT2, pointerEvents: 'none' }} />
          </div>
          {onAdd && (
            <button
              onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', backgroundColor: PRIMARY, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <Plus size={16} /> Thêm nhân viên
            </button>
          )}
        </div>
      </div>

      {/* Phòng ban chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {[{ label: `Tất cả (${employees.filter(e => e.trang_thai === 'Đang làm việc').length})`, value: '' }, ...pbGroups.map(g => ({ label: `${g.label.replace('Phòng ', '')} (${g.count})`, value: g.label }))].map(chip => {
          const isActive = filterPB === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => setFilterPB(filterPB === chip.value && chip.value !== '' ? '' : chip.value)}
              style={{ padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '500', border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', backgroundColor: isActive ? PRIMARY : '#fff', color: isActive ? '#fff' : TEXT2, borderColor: isActive ? PRIMARY : BORDER }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: TEXT2, pointerEvents: 'none' }} />
        <input
          style={{ ...inputS, paddingLeft: '38px', paddingRight: search ? '36px' : '12px' }}
          placeholder="Tìm tên, chức vụ, số điện thoại..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: TEXT2, display: 'flex', padding: '2px' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {(search || filterPB) && (
        <p style={{ fontSize: '12px', color: TEXT2, marginBottom: '12px' }}>
          Hiển thị {sorted.length} / {employees.length} nhân viên
          {filterPB && <span style={{ marginLeft: '6px', color: PRIMARY, fontWeight: '500' }}>· {filterPB}</span>}
        </p>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {sorted.map(emp => {
          const age          = calcAge(emp.ngay_sinh);
          const daysLeft     = daysUntilBirthday(emp.ngay_sinh);
          const birthdaySoon = daysLeft <= 7;
          const roleSt       = ROLE_STYLE[emp.vai_tro] || ROLE_STYLE['Nhân viên'];
          const statusSt     = STATUS_COLORS[emp.trang_thai] || { bg: '#F3F4F6', color: TEXT2 };
          const managerName  = getManagerName(emp.quan_ly_id);
          const avatarBg     = AVATAR_BG[emp.vai_tro] || '#F15A22';

          return (
            <div
              key={emp.id}
              onClick={() => handleCardClick(emp)}
              style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: CARD_SHADOW, cursor: 'pointer', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10), 0 0 0 0.5px #d1d5db'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = CARD_SHADOW; }}
            >
              {/* Card body */}
              <div style={{ padding: '16px 16px 12px' }}>
                {/* Header: avatar + name + delete */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: avatarBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>{emp.ho_ten.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: TEXT1, margin: '0 0 2px' }}>{emp.ho_ten}</p>
                      <p style={{ fontSize: '11px', color: TEXT2, margin: 0 }}>{emp.chuc_vu}{emp.phong_ban ? ` · ${emp.phong_ban.replace('Phòng ', '')}` : ''}</p>
                    </div>
                  </div>
                  {onDelete && (
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(emp.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: '3px', borderRadius: '5px', display: 'flex', transition: 'all 0.12s', flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#D1D5DB'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Badges — role + dept + status (tối đa 3) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '500', backgroundColor: roleSt.bg, color: roleSt.color }}>
                    {emp.vai_tro || 'Nhân viên'}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '500', backgroundColor: '#E6F1FB', color: '#0C447C' }}>
                    {emp.phong_ban?.replace('Phòng ', '') || '—'}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '500', backgroundColor: statusSt.bg, color: statusSt.color }}>
                    {emp.trang_thai}
                  </span>
                </div>

                {/* Info rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {(managerName || emp.dien_thoai) && (
                    managerName ? (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: TEXT2, margin: 0 }}>
                        <Users size={11} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                        <span style={{ color: TEXT1, fontWeight: '500' }}>{managerName}</span>
                      </p>
                    ) : (
                      <a href={`tel:${emp.dien_thoai}`} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: TEXT2, textDecoration: 'none' }}>
                        <Phone size={11} style={{ color: '#9CA3AF', flexShrink: 0 }} />{emp.dien_thoai}
                      </a>
                    )
                  )}
                  {emp.email && (
                    <a href={`mailto:${emp.email}`} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: TEXT2, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Mail size={11} style={{ color: '#9CA3AF', flexShrink: 0 }} />{emp.email}
                    </a>
                  )}
                  {emp.ngay_vao_lam && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: TEXT2, margin: 0 }}>
                      <Calendar size={11} style={{ color: '#9CA3AF', flexShrink: 0 }} />Vào làm: {emp.ngay_vao_lam}
                    </p>
                  )}
                  {birthdaySoon && emp.ngay_sinh && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: PRIMARY, fontWeight: '500', margin: 0 }}>
                      <Cake size={11} style={{ flexShrink: 0 }} />
                      {daysLeft === 0 ? '🎂 Sinh nhật hôm nay!' : `Sinh nhật sau ${daysLeft} ngày`}
                    </p>
                  )}
                </div>
              </div>

              {/* Card footer — 2 action buttons */}
              <div style={{ display: 'flex', borderTop: `0.5px solid ${BORDER}` }}>
                <button
                  onClick={e => { e.stopPropagation(); handleCardClick(emp); }}
                  style={{ flex: 1, padding: '9px', fontSize: '12px', fontWeight: '500', color: PRIMARY, backgroundColor: '#FEF2EC', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FDE8DC'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FEF2EC'; }}
                >
                  Xem hồ sơ
                </button>
                <div style={{ width: '0.5px', backgroundColor: BORDER }} />
                <button
                  onClick={e => { e.stopPropagation(); onNavigate?.('tasks'); }}
                  style={{ flex: 1, padding: '9px', fontSize: '12px', fontWeight: '500', color: TEXT2, backgroundColor: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                >
                  Giao việc
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: TEXT2 }}>
          <UserCheck size={40} style={{ margin: '0 auto 12px', color: BORDER, display: 'block' }} />
          <p style={{ fontWeight: '500', margin: 0 }}>Không tìm thấy nhân viên</p>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <Modal title="Thêm nhân viên" onClose={() => setShowForm(false)} size="md">
          <EmployeeForm employees={employees} onSubmit={d => { onAdd({ ...d, accountStatus: 'pending', uid: null }); setShowForm(false); }} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
      {editing && (
        <Modal title="Chỉnh sửa nhân viên" onClose={() => setEditing(null)} size="md">
          <EmployeeForm initial={editing} employees={employees} onSubmit={d => { onUpdate(editing.id, d); setEditing(null); }} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {viewing && (
        <ViewEmployeeModal emp={viewing} employees={employees} onClose={() => setViewing(null)} />
      )}

      {onDelete && confirmDelete && (
        <Modal title="Xác nhận xóa" onClose={() => setConfirmDelete(null)} size="sm">
          <p style={{ color: TEXT2, marginBottom: '24px', fontSize: '14px' }}>Bạn có chắc muốn xóa nhân viên này?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 18px', fontSize: '14px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#fff', color: TEXT1, cursor: 'pointer', fontFamily: 'inherit' }}>Hủy</button>
            <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} style={{ padding: '8px 18px', fontSize: '14px', fontWeight: '600', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>Xóa</button>
          </div>
        </Modal>
      )}

      {activationModal && (
        <Modal title="Hướng dẫn kích hoạt tài khoản" onClose={() => setActivationModal(null)} size="sm">
          <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#FFF3EE', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', backgroundColor: PRIMARY, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>{activationModal.ho_ten?.charAt(0)}</span>
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '15px', color: TEXT1 }}>{activationModal.ho_ten}</p>
                <p style={{ margin: 0, fontSize: '13px', color: TEXT2 }}>{activationModal.chuc_vu} · {activationModal.phong_ban}</p>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: TEXT1, marginBottom: '16px', lineHeight: '1.6' }}>
              Yêu cầu nhân viên thực hiện các bước sau để kích hoạt tài khoản:
            </p>
            {[
              { num: '1', text: 'Mở trình duyệt và truy cập hệ thống KNP CRM' },
              { num: '2', text: <>Chọn tab <strong>"Số điện thoại"</strong> trên màn hình đăng nhập</> },
              { num: '3', text: <>Nhập SĐT: <strong style={{ color: PRIMARY }}>{activationModal.dien_thoai}</strong></> },
              { num: '4', text: <>Nhập mã PIN mặc định: <strong style={{ color: PRIMARY, fontSize: '16px', letterSpacing: '2px' }}>{activationModal.dien_thoai ? activationModal.dien_thoai.replace(/\D/g, '').slice(-6) : '______'}</strong> (6 số cuối SĐT)</> },
              { num: '5', text: 'Nhấn "Đăng nhập" — hệ thống tự kích hoạt tài khoản' },
            ].map(step => (
              <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '24px', height: '24px', backgroundColor: PRIMARY, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>{step.num}</span>
                <p style={{ margin: 0, fontSize: '14px', color: TEXT1, lineHeight: '1.6' }}>{step.text}</p>
              </div>
            ))}
            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 12px', marginTop: '16px', fontSize: '12px', color: '#92400E', lineHeight: '1.5' }}>
              🔒 Không cần SMS hay OTP — hệ thống xác thực bằng PIN nội bộ. Nhân viên có thể đổi PIN sau khi đăng nhập.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setActivationModal(null)} style={{ padding: '8px 20px', backgroundColor: PRIMARY, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                Đã hiểu
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
