import { useState, useMemo } from 'react';
import { CalendarOff, Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import useLeaveRequests from '../hooks/useLeaveRequests';
import { sortEmployeesByRole } from '../utils/sortEmployees';

const PRIMARY = '#F15A22';
const TEXT1   = '#1F2937';
const TEXT2   = '#6B7280';
const BORDER  = '#E5E7EB';

const LOAI_NGHI = [
  { value: 'ngay', label: 'Nghỉ theo ngày' },
  { value: 'buoi', label: 'Nghỉ theo buổi' },
  { value: 'gio',  label: 'Nghỉ theo giờ'  },
];

const STATUS_CONFIG = {
  cho_duyet: { label: 'Chờ duyệt', bg: '#FEF3C7', color: '#D97706' },
  da_duyet:  { label: 'Đã duyệt',  bg: '#D1FAE5', color: '#065F46' },
  tu_choi:   { label: 'Từ chối',   bg: '#FEE2E2', color: '#991B1B' },
};

/* ── Helpers ──────────────────────────────────────────────────────────── */
function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.cho_duyet;
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600', background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function formatThoiGian(req) {
  if (req.loai_nghi === 'ngay') {
    if (req.tu_ngay === req.den_ngay) return req.tu_ngay || '';
    return `${req.tu_ngay} → ${req.den_ngay}`;
  }
  if (req.loai_nghi === 'buoi') {
    const buoi = req.buoi === 'sang' ? 'Sáng' : req.buoi === 'chieu' ? 'Chiều' : 'Cả ngày';
    return `${req.ngay} (${buoi})`;
  }
  if (req.loai_nghi === 'gio') return `${req.ngay} ${req.gio_bat_dau} – ${req.gio_ket_thuc}`;
  return '';
}

function tinhThoiGianNghi(don) {
  if (don.trang_thai !== 'da_duyet') return { ngay: 0, buoi: 0, gio: 0 };
  if (don.loai_nghi === 'ngay') {
    const s = new Date((don.tu_ngay || '') + 'T00:00:00');
    const e = new Date((don.den_ngay || don.tu_ngay || '') + 'T00:00:00');
    return { ngay: Math.max(1, Math.ceil((e - s) / 86400000) + 1), buoi: 0, gio: 0 };
  }
  if (don.loai_nghi === 'buoi') {
    return don.buoi === 'ca_ngay' ? { ngay: 1, buoi: 0, gio: 0 } : { ngay: 0, buoi: 1, gio: 0 };
  }
  if (don.loai_nghi === 'gio') {
    const [h1, m1] = (don.gio_bat_dau || '00:00').split(':').map(Number);
    const [h2, m2] = (don.gio_ket_thuc || '00:00').split(':').map(Number);
    return { ngay: 0, buoi: 0, gio: Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60) };
  }
  return { ngay: 0, buoi: 0, gio: 0 };
}

function buildThongKe(donList, thangF, namF) {
  const filtered = thangF
    ? donList.filter(d => {
        const ngay = d.tu_ngay || d.ngay || d.ngay_bat_dau || '';
        if (!ngay) return false;
        const dt = new Date(ngay + 'T00:00:00');
        return dt.getMonth() + 1 === thangF && dt.getFullYear() === namF;
      })
    : donList.filter(d => {
        const ngay = d.tu_ngay || d.ngay || d.ngay_bat_dau || '';
        if (!ngay) return false;
        return new Date(ngay + 'T00:00:00').getFullYear() === namF;
      });

  const map = {};
  filtered.forEach(d => {
    const id = d.nguoi_xin_id;
    if (!map[id]) map[id] = { ten: d.nguoi_xin_ten || '?', tongNgay: 0, tongBuoi: 0, tongGio: 0, donDuyet: 0, donTuChoi: 0, tongDon: 0 };
    const tg = tinhThoiGianNghi(d);
    map[id].tongNgay  += tg.ngay;
    map[id].tongBuoi  += tg.buoi;
    map[id].tongGio   += tg.gio;
    map[id].tongDon   += 1;
    if (d.trang_thai === 'da_duyet') map[id].donDuyet  += 1;
    if (d.trang_thai === 'tu_choi')  map[id].donTuChoi += 1;
  });
  return Object.entries(map)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => (b.tongNgay + b.tongBuoi / 2 + b.tongGio / 8) - (a.tongNgay + a.tongBuoi / 2 + a.tongGio / 8));
}

/* ── ThongKeTable ─────────────────────────────────────────────────────── */
function ThongKeTable({ rows, label = 'Tổng cộng' }) {
  const COLS = ['Nhân viên', 'Nghỉ ngày', 'Nghỉ buổi', 'Nghỉ giờ', 'Quy đổi', 'Được duyệt', 'Từ chối', 'Tổng đơn'];
  if (rows.length === 0) {
    return <div style={{ padding: '24px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Không có dữ liệu</div>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {COLS.map(h => (
              <th key={h} style={{ padding: '9px 12px', textAlign: h === 'Nhân viên' ? 'left' : 'center', fontWeight: '600', color: TEXT2, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((nv, idx) => {
            const q = nv.tongNgay + nv.tongBuoi / 2 + nv.tongGio / 8;
            return (
              <tr key={nv.id} style={{ borderBottom: `1px solid #F3F4F6`, background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '9px 12px', fontWeight: '500', color: TEXT1 }}>{nv.ten}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: nv.tongNgay > 0 ? '#DC2626' : TEXT2 }}>{nv.tongNgay > 0 ? `${nv.tongNgay}` : '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: nv.tongBuoi > 0 ? '#D97706' : TEXT2 }}>{nv.tongBuoi > 0 ? `${nv.tongBuoi}` : '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: nv.tongGio > 0 ? '#2563EB' : TEXT2 }}>{nv.tongGio > 0 ? `${nv.tongGio.toFixed(1)}` : '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                  <span style={{ background: q >= 3 ? '#FEE2E2' : q >= 1 ? '#FEF3C7' : '#F0FDF4', color: q >= 3 ? '#DC2626' : q >= 1 ? '#D97706' : '#16A34A', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', fontSize: '12px' }}>
                    {q % 1 === 0 ? q : q.toFixed(1)} ngày
                  </span>
                </td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: '#065F46', fontWeight: '600' }}>{nv.donDuyet}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: nv.donTuChoi > 0 ? '#991B1B' : TEXT2 }}>{nv.donTuChoi}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: TEXT1, fontWeight: '600' }}>{nv.tongDon}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#F9FAFB', borderTop: `1px solid ${BORDER}` }}>
            <td style={{ padding: '9px 12px', fontWeight: '700', color: TEXT1 }}>{label}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongNgay, 0)}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongBuoi, 0)}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongGio, 0).toFixed(1)}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongNgay + r.tongBuoi / 2 + r.tongGio / 8, 0).toFixed(1)} ngày</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: '#065F46' }}>{rows.reduce((s, r) => s + r.donDuyet, 0)}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: '#991B1B' }}>{rows.reduce((s, r) => s + r.donTuChoi, 0)}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongDon, 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── DonCard ──────────────────────────────────────────────────────────── */
function DonCard({ req, actions }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Avatar name={req.nguoi_xin_ten} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: TEXT1 }}>{req.nguoi_xin_ten || '—'}</span>
            <Badge status={req.trang_thai} />
            <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '6px', background: '#F3F4F6', color: TEXT2 }}>
              {LOAI_NGHI.find(l => l.value === req.loai_nghi)?.label || req.loai_nghi}
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: TEXT2 }}>{formatThoiGian(req)}</p>
          {req.ly_do && (
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: TEXT1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '480px' }}>
              {req.ly_do.length > 80 ? req.ly_do.slice(0, 80) + '…' : req.ly_do}
            </p>
          )}
          {req.trang_thai === 'tu_choi' && req.ly_do_tu_choi && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#991B1B', background: '#FEE2E2', borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>
              Từ chối: {req.ly_do_tu_choi}
            </p>
          )}
          {req.nguoi_duyet_ten && req.trang_thai !== 'cho_duyet' && (
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: TEXT2 }}>
              {req.trang_thai === 'da_duyet' ? 'Duyệt bởi' : 'Từ chối bởi'}: {req.nguoi_duyet_ten}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Modal tạo / sửa đơn ─────────────────────────────────────────────── */
function DonModal({ onClose, onSubmit, currentUser, employees, dangGui = false, editingDon = null }) {
  const myEmp = employees.find(e => e.uid === currentUser?.uid);
  const nguoiDuyetList = sortEmployeesByRole((employees || []).filter(emp => {
    const vt = (emp.vaiTro || emp.vai_tro || emp.role || '').toLowerCase().trim();
    return vt === 'admin';
  }));

  const initLoai = editingDon?.loai_nghi || 'ngay';
  const [loai, setLoai] = useState(initLoai);
  const [form, setForm] = useState({
    tu_ngay:       editingDon?.tu_ngay       || '',
    den_ngay:      editingDon?.den_ngay      || '',
    ngay:          editingDon?.ngay          || '',
    buoi:          editingDon?.buoi          || 'ca_ngay',
    gio_bat_dau:   editingDon?.gio_bat_dau   || '08:00',
    gio_ket_thuc:  editingDon?.gio_ket_thuc  || '09:00',
    ly_do:         editingDon?.ly_do         || '',
    nguoi_duyet_id:  editingDon?.nguoi_duyet_id  || '',
    nguoi_duyet_ten: editingDon?.nguoi_duyet_ten || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.ly_do.trim()) { setErr('Vui lòng nhập lý do'); return; }
    if (loai === 'ngay' && (!form.tu_ngay || !form.den_ngay)) { setErr('Vui lòng chọn ngày'); return; }
    if ((loai === 'buoi' || loai === 'gio') && !form.ngay) { setErr('Vui lòng chọn ngày'); return; }
    setSaving(true);
    try {
      await onSubmit({
        loai_nghi:      loai,
        nguoi_xin_ten:  myEmp?.ho_ten || currentUser?.email || '',
        phong_ban:      myEmp?.phong_ban || '',
        ...form,
      });
      onClose();
    } catch (e) {
      setErr(e.message || 'Lỗi khi gửi đơn');
    } finally {
      setSaving(false);
    }
  };

  const inp = { width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '14px', color: TEXT1, background: '#fff', boxSizing: 'border-box', outline: 'none' };
  const lbl = { fontSize: '12px', fontWeight: '600', color: TEXT2, marginBottom: '4px', display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarOff size={20} color={PRIMARY} />
            <span style={{ fontWeight: '700', fontSize: '16px', color: TEXT1 }}>
              {editingDon ? 'Sửa đơn xin nghỉ' : 'Tạo đơn xin nghỉ'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color={TEXT2} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Loại nghỉ */}
          <div>
            <label style={lbl}>Loại nghỉ</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {LOAI_NGHI.map(o => (
                <button key={o.value} onClick={() => setLoai(o.value)} style={{
                  padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                  border: loai === o.value ? `2px solid ${PRIMARY}` : `2px solid ${BORDER}`,
                  background: loai === o.value ? '#FFF7F4' : '#fff',
                  color: loai === o.value ? PRIMARY : TEXT1,
                }}>{o.label}</button>
              ))}
            </div>
          </div>

          {loai === 'ngay' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={lbl}>Từ ngày</label><input type="date" style={inp} value={form.tu_ngay} onChange={e => set('tu_ngay', e.target.value)} /></div>
              <div><label style={lbl}>Đến ngày</label><input type="date" style={inp} value={form.den_ngay} min={form.tu_ngay} onChange={e => set('den_ngay', e.target.value)} /></div>
            </div>
          )}
          {loai === 'buoi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={lbl}>Ngày</label><input type="date" style={inp} value={form.ngay} onChange={e => set('ngay', e.target.value)} /></div>
              <div>
                <label style={lbl}>Buổi</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ v: 'sang', l: 'Sáng' }, { v: 'chieu', l: 'Chiều' }, { v: 'ca_ngay', l: 'Cả ngày' }].map(o => (
                    <button key={o.v} onClick={() => set('buoi', o.v)} style={{
                      padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                      border: form.buoi === o.v ? `2px solid ${PRIMARY}` : `2px solid ${BORDER}`,
                      background: form.buoi === o.v ? '#FFF7F4' : '#fff',
                      color: form.buoi === o.v ? PRIMARY : TEXT1,
                    }}>{o.l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {loai === 'gio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={lbl}>Ngày</label><input type="date" style={inp} value={form.ngay} onChange={e => set('ngay', e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={lbl}>Giờ bắt đầu</label><input type="time" style={inp} value={form.gio_bat_dau} onChange={e => set('gio_bat_dau', e.target.value)} /></div>
                <div><label style={lbl}>Giờ kết thúc</label><input type="time" style={inp} value={form.gio_ket_thuc} onChange={e => set('gio_ket_thuc', e.target.value)} /></div>
              </div>
            </div>
          )}

          <div>
            <label style={lbl}>Lý do <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea rows={3} style={{ ...inp, resize: 'vertical' }} placeholder="Nhập lý do xin nghỉ..." value={form.ly_do} onChange={e => set('ly_do', e.target.value)} />
          </div>

          <div>
            <label style={lbl}>Người duyệt</label>
            <select style={{ ...inp, appearance: 'auto', cursor: 'pointer' }} value={form.nguoi_duyet_id}
              onChange={e => {
                const emp = nguoiDuyetList.find(x => x.id === e.target.value);
                set('nguoi_duyet_id', e.target.value);
                set('nguoi_duyet_ten', emp?.ho_ten || '');
              }}>
              <option value="">-- Chọn người duyệt --</option>
              {nguoiDuyetList.map(e => (
                <option key={e.id} value={e.id}>{e.ho_ten} — {e.chuc_vu || e.vai_tro || e.vaiTro || ''}</option>
              ))}
            </select>
          </div>

          {err && <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{err}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT1, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Hủy</button>
            <button onClick={handleSubmit} disabled={saving || dangGui} style={{
              padding: '9px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600',
              background: (saving || dangGui) ? '#ccc' : PRIMARY, color: '#fff',
              cursor: (saving || dangGui) ? 'not-allowed' : 'pointer',
            }}>{(saving || dangGui) ? 'Đang gửi...' : 'Gửi đơn'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal từ chối ────────────────────────────────────────────────────── */
function TuChoiModal({ onClose, onConfirm }) {
  const [lyDo, setLyDo]   = useState('');
  const [saving, setSaving] = useState(false);
  const handleConfirm = async () => {
    setSaving(true);
    try { await onConfirm(lyDo); onClose(); } finally { setSaving(false); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <p style={{ fontWeight: '700', fontSize: '16px', color: TEXT1, marginBottom: '12px' }}>Nhập lý do từ chối</p>
        <textarea rows={3} autoFocus style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '14px', color: TEXT1, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
          placeholder="Lý do từ chối (tuỳ chọn)..." value={lyDo} onChange={e => setLyDo(e.target.value)} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', color: TEXT1, fontSize: '14px', cursor: 'pointer' }}>Hủy</button>
          <button onClick={handleConfirm} disabled={saving} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast ────────────────────────────────────────────────────────────── */
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1F2937', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
      {msg}
    </div>
  );
}

/* ── LeaveRequestPage ─────────────────────────────────────────────────── */
export default function LeaveRequestPage({ currentUser, vaiTro: vaiTroRaw, employees }) {
  const role    = (vaiTroRaw || '').toLowerCase().trim();
  const isAdmin = role === 'admin';

  const myEmp    = employees.find(e => e.uid === currentUser?.uid);
  const phongBan = myEmp?.phong_ban || '';

  const { leaveRequests, loading, taoDoXinNghi, duyetDon, tuChoiDon, suaDon, xoaDon } =
    useLeaveRequests(currentUser, role, phongBan);

  // ── All hooks at top level (Rules of Hooks) ──────────────────────────
  const [showModal,    setShowModal]    = useState(false);
  const [editingDon,   setEditingDon]   = useState(null);
  const [tuChoiTarget, setTuChoiTarget] = useState(null);
  const [toast,        setToast]        = useState('');
  const [dangGui,      setDangGui]      = useState(false);
  const [statusFilter, setStatusFilter] = useState('tat_ca');

  const now      = new Date();
  const thangNay = now.getMonth() + 1;
  const namNay   = now.getFullYear();
  const [thangFilter, setThangFilter] = useState(thangNay);
  const [namFilter,   setNamFilter]   = useState(namNay);
  const thangOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const thongKeRows = useMemo(() => {
    const empByUid = new Map(employees.filter(e => e.uid).map(e => [e.uid, e]));
    const rows = buildThongKe(leaveRequests, thangFilter > 0 ? thangFilter : null, namFilter);
    return sortEmployeesByRole(rows.map(r => ({ ...r, vai_tro: empByUid.get(r.id)?.vai_tro || 'Nhân viên' })));
  }, [leaveRequests, employees, thangFilter, namFilter]);

  const myThongKeRows = useMemo(() => {
    const rows = buildThongKe(
      leaveRequests.filter(d => d.nguoi_xin_id === currentUser?.uid),
      thangFilter > 0 ? thangFilter : null,
      namFilter
    );
    return rows; // chỉ 1 nhân viên → không cần sort theo role
  }, [leaveRequests, currentUser?.uid, thangFilter, namFilter]);

  // ── Derived lists (not hooks) ────────────────────────────────────────
  const donChoDuyet = leaveRequests.filter(d => d.trang_thai === 'cho_duyet');
  const donDaXuLy   = leaveRequests.filter(d => d.trang_thai === 'da_duyet' || d.trang_thai === 'tu_choi');

  const myDonChoDuyet = leaveRequests.filter(d => d.nguoi_xin_id === currentUser?.uid && d.trang_thai === 'cho_duyet');
  const myDonDaXuLy   = leaveRequests.filter(d => d.nguoi_xin_id === currentUser?.uid && (d.trang_thai === 'da_duyet' || d.trang_thai === 'tu_choi'));

  // admin filtered list for section 2
  const adminListS1 = statusFilter === 'tat_ca' || statusFilter === 'cho_duyet' ? donChoDuyet : [];
  const adminListS2 = statusFilter === 'tat_ca' ? donDaXuLy
    : statusFilter === 'cho_duyet' ? []
    : leaveRequests.filter(d => d.trang_thai === statusFilter);

  // ── Handlers ────────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const myName = myEmp?.ho_ten || currentUser?.email || '';

  const openTao = () => { setEditingDon(null); setShowModal(true); };
  const openEdit = (don) => { setEditingDon(don); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingDon(null); };

  const handleSubmit = async (data) => {
    if (dangGui) return;
    setDangGui(true);
    try {
      if (editingDon) {
        await suaDon(editingDon.id, data);
        showToast('Đã cập nhật đơn!');
      } else {
        const ref = await taoDoXinNghi({ ...data });
        if (data.nguoi_duyet_id) {
          await addDoc(collection(db, 'notifications'), {
            type: 'leave_request', title: 'Đơn xin nghỉ mới',
            body: `${data.nguoi_xin_ten} xin nghỉ`,
            userId: data.nguoi_duyet_id, leaveRequestId: ref.id,
            read: false, created_at: serverTimestamp(),
          });
        }
        showToast('Đã gửi đơn thành công!');
      }
      closeModal();
    } catch (err) {
      console.error('[LeaveRequest] save error:', err);
      showToast('Lỗi: ' + (err.message || 'Không lưu được'));
    } finally {
      setDangGui(false);
    }
  };

  const handleDuyet = async (req) => {
    try { await duyetDon(req.id, myName, req.nguoi_xin_id); showToast('Đã duyệt đơn!'); }
    catch (e) { showToast('Lỗi: ' + e.message); }
  };

  const handleTuChoi = async (lyDo) => {
    if (!tuChoiTarget) return;
    try { await tuChoiDon(tuChoiTarget.id, lyDo, tuChoiTarget.nguoi_xin_id, myName); showToast('Đã từ chối đơn.'); }
    catch (e) { showToast('Lỗi: ' + e.message); }
  };

  const xacNhanXoa = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn xin nghỉ này? Hành động không thể hoàn tác.')) {
      try { await xoaDon(id); showToast('Đã xóa đơn.'); }
      catch (e) { showToast('Lỗi: ' + e.message); }
    }
  };

  // ── Shared styles ────────────────────────────────────────────────────
  const wrap    = { padding: '24px', fontFamily: "'Inter', system-ui, sans-serif", maxWidth: '900px', margin: '0 auto' };
  const card    = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' };
  const cardHdr = { padding: '13px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' };
  const selStyle = { padding: '5px 10px', borderRadius: '6px', border: `1px solid ${BORDER}`, fontSize: '13px', color: TEXT1, cursor: 'pointer', background: '#fff' };

  const btnDuyet  = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 11px', borderRadius: '8px', border: 'none', background: '#D1FAE5', color: '#065F46', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
  const btnTuChoi = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 11px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' };
  const btnXoa    = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 11px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B', fontSize: '12px', fontWeight: '500', cursor: 'pointer' };
  const btnSua    = { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 11px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#F9FAFB', color: TEXT2, fontSize: '12px', fontWeight: '500', cursor: 'pointer' };

  /* ══ ADMIN VIEW ══════════════════════════════════════════════════════ */
  if (isAdmin) {
    return (
      <div style={wrap}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarOff size={22} color={PRIMARY} />
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: TEXT1 }}>Quản lý nghỉ phép</h1>
            {donChoDuyet.length > 0 && (
              <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px' }}>
                {donChoDuyet.length} chờ duyệt
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selStyle}>
              <option value="tat_ca">Tất cả</option>
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
            </select>
            <select value={thangFilter} onChange={e => setThangFilter(Number(e.target.value))} style={selStyle}>
              <option value={0}>Tất cả tháng</option>
              {thangOptions.map(t => <option key={t} value={t}>Tháng {t}</option>)}
            </select>
            <select value={namFilter} onChange={e => setNamFilter(Number(e.target.value))} style={selStyle}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Section 1 — Chờ duyệt */}
        {(statusFilter === 'tat_ca' || statusFilter === 'cho_duyet') && (
          <div style={card}>
            <div style={cardHdr}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#D97706' }}>🟡 Đơn chờ duyệt ({adminListS1.length})</span>
            </div>
            {adminListS1.length === 0
              ? <div style={{ padding: '32px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Không có đơn nào chờ duyệt</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
                  {adminListS1.map(req => (
                    <DonCard key={req.id} req={req} actions={[
                      <button key="d" style={btnDuyet} onClick={() => handleDuyet(req)}><Check size={13} /> Duyệt</button>,
                      <button key="t" style={btnTuChoi} onClick={() => setTuChoiTarget({ id: req.id, nguoi_xin_id: req.nguoi_xin_id, nguoi_xin_ten: req.nguoi_xin_ten })}><X size={13} /> Từ chối</button>,
                      <button key="x" style={btnXoa} onClick={() => xacNhanXoa(req.id)}><Trash2 size={13} /> Xóa</button>,
                    ]} />
                  ))}
                </div>
            }
          </div>
        )}

        {/* Section 2 — Lịch sử */}
        {(statusFilter === 'tat_ca' || statusFilter === 'da_duyet' || statusFilter === 'tu_choi') && (
          <div style={card}>
            <div style={cardHdr}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT1 }}>📋 Lịch sử đã xử lý ({adminListS2.length})</span>
            </div>
            {adminListS2.length === 0
              ? <div style={{ padding: '32px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Chưa có đơn nào đã xử lý</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
                  {adminListS2.map(req => (
                    <DonCard key={req.id} req={req} actions={[
                      <button key="x" style={btnXoa} onClick={() => xacNhanXoa(req.id)}><Trash2 size={13} /> Xóa</button>,
                    ]} />
                  ))}
                </div>
            }
          </div>
        )}

        {/* Section 3 — Thống kê */}
        <div style={card}>
          <div style={cardHdr}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT1 }}>
              📊 Thống kê {thangFilter > 0 ? `tháng ${thangFilter}/` : 'năm '}{namFilter}
            </span>
            <span style={{ fontSize: '11px', color: TEXT2 }}>Quy đổi chỉ tính đơn đã duyệt</span>
          </div>
          <ThongKeTable rows={thongKeRows} label="Tổng công ty" />
          <div style={{ padding: '7px 16px', background: '#F0F9FF', borderTop: `1px solid ${BORDER}`, fontSize: '11px', color: TEXT2 }}>
            * Quy đổi: 1 ngày = 2 buổi = 8 giờ · Chỉ tính đơn đã được duyệt
          </div>
        </div>

        {tuChoiTarget && <TuChoiModal onClose={() => setTuChoiTarget(null)} onConfirm={handleTuChoi} />}
        <Toast msg={toast} />
      </div>
    );
  }

  /* ══ EMPLOYEE / MANAGER VIEW ════════════════════════════════════════ */
  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarOff size={22} color={PRIMARY} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: TEXT1 }}>Nghỉ phép của tôi</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={thangFilter} onChange={e => setThangFilter(Number(e.target.value))} style={selStyle}>
            <option value={0}>Tất cả tháng</option>
            {thangOptions.map(t => <option key={t} value={t}>Tháng {t}</option>)}
          </select>
          <select value={namFilter} onChange={e => setNamFilter(Number(e.target.value))} style={selStyle}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={openTao} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: PRIMARY, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={16} /> Tạo đơn xin nghỉ
          </button>
        </div>
      </div>

      {/* Section 1 — Đơn chờ duyệt của tôi */}
      <div style={card}>
        <div style={cardHdr}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#D97706' }}>🟡 Đơn chờ duyệt ({myDonChoDuyet.length})</span>
        </div>
        {loading
          ? <div style={{ padding: '24px', textAlign: 'center', color: TEXT2 }}>Đang tải...</div>
          : myDonChoDuyet.length === 0
            ? <div style={{ padding: '32px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Bạn chưa có đơn nào chờ duyệt</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
                {myDonChoDuyet.map(req => (
                  <DonCard key={req.id} req={req} actions={[
                    <button key="s" style={btnSua} onClick={() => openEdit(req)}><Pencil size={13} /> Sửa</button>,
                    <button key="x" style={btnXoa} onClick={() => xacNhanXoa(req.id)}><Trash2 size={13} /> Xóa</button>,
                  ]} />
                ))}
              </div>
        }
      </div>

      {/* Section 2 — Lịch sử đã xử lý */}
      <div style={card}>
        <div style={cardHdr}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT1 }}>📋 Đơn đã xử lý ({myDonDaXuLy.length})</span>
        </div>
        {myDonDaXuLy.length === 0
          ? <div style={{ padding: '32px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Chưa có đơn nào đã xử lý</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              {myDonDaXuLy.map(req => (
                <DonCard key={req.id} req={req} actions={null} />
              ))}
            </div>
        }
      </div>

      {/* Section 3 — Thống kê của tôi */}
      <div style={card}>
        <div style={cardHdr}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT1 }}>
            📊 Thống kê {thangFilter > 0 ? `tháng ${thangFilter}/` : 'năm '}{namFilter}
          </span>
          <span style={{ fontSize: '11px', color: TEXT2 }}>Quy đổi chỉ tính đơn đã duyệt</span>
        </div>
        <ThongKeTable rows={myThongKeRows} label="Tổng của tôi" />
        <div style={{ padding: '7px 16px', background: '#F0F9FF', borderTop: `1px solid ${BORDER}`, fontSize: '11px', color: TEXT2 }}>
          * Quy đổi: 1 ngày = 2 buổi = 8 giờ · Chỉ tính đơn đã được duyệt
        </div>
      </div>

      {showModal && (
        <DonModal onClose={closeModal} onSubmit={handleSubmit} currentUser={currentUser} employees={employees} dangGui={dangGui} editingDon={editingDon} />
      )}
      {tuChoiTarget && <TuChoiModal onClose={() => setTuChoiTarget(null)} onConfirm={handleTuChoi} />}
      <Toast msg={toast} />
    </div>
  );
}
