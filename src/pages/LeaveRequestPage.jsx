import { useState, useMemo } from 'react';
import { CalendarOff, Plus, X, Check, ChevronDown } from 'lucide-react';
import useLeaveRequests from '../hooks/useLeaveRequests';

const PRIMARY = '#F15A22';
const TEXT1   = '#1F2937';
const TEXT2   = '#6B7280';
const BORDER  = '#E5E7EB';
const BG      = '#F9FAFB';

const LOAI_NGHI = [
  { value: 'ngay',  label: 'Nghỉ theo ngày' },
  { value: 'buoi',  label: 'Nghỉ theo buổi' },
  { value: 'gio',   label: 'Nghỉ theo giờ'  },
];

const STATUS_CONFIG = {
  cho_duyet: { label: 'Chờ duyệt', bg: '#FEF3C7', color: '#D97706' },
  da_duyet:  { label: 'Đã duyệt',  bg: '#D1FAE5', color: '#065F46' },
  tu_choi:   { label: 'Từ chối',   bg: '#FEE2E2', color: '#991B1B' },
};

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.cho_duyet;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '9999px',
      fontSize: '11px', fontWeight: '600',
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  );
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: PRIMARY, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: '700', flexShrink: 0,
    }}>{initials}</div>
  );
}

function formatThoiGian(req) {
  if (req.loai_nghi === 'ngay') {
    if (req.tu_ngay === req.den_ngay) return req.tu_ngay;
    return `${req.tu_ngay} → ${req.den_ngay}`;
  }
  if (req.loai_nghi === 'buoi') {
    const buoi = req.buoi === 'sang' ? 'Sáng' : req.buoi === 'chieu' ? 'Chiều' : 'Cả ngày';
    return `${req.ngay} (${buoi})`;
  }
  if (req.loai_nghi === 'gio') {
    return `${req.ngay} ${req.gio_bat_dau} – ${req.gio_ket_thuc}`;
  }
  return '';
}

/* ── Modal tạo đơn ────────────────────────────────────────────────── */
function TaoDoModal({ onClose, onSubmit, currentUser, employees }) {
  const myEmp = employees.find(e => e.uid === currentUser?.uid);
  const manager = myEmp?.quan_ly_id
    ? employees.find(e => e.id === myEmp.quan_ly_id)
    : null;

  const nguoiDuyetList = (employees || []).filter(emp => {
    const vt = (emp.vaiTro || emp.vai_tro || emp.role || '').toLowerCase().trim();
    return vt === 'admin';
  });

  const [loai, setLoai]   = useState('ngay');
  const [form, setForm]   = useState({
    tu_ngay: '', den_ngay: '', ngay: '', buoi: 'ca_ngay',
    gio_bat_dau: '08:00', gio_ket_thuc: '09:00',
    ly_do: '',
    nguoi_duyet_id: manager?.id || '',
    nguoi_duyet_ten: manager?.ho_ten || '',
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
        loai_nghi: loai,
        nguoi_xin_ten: myEmp?.ho_ten || currentUser?.email || '',
        phong_ban: myEmp?.phong_ban || '',
        ...form,
      });
      onClose();
    } catch (e) {
      setErr(e.message || 'Lỗi khi gửi đơn');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`,
    borderRadius: '8px', fontSize: '14px', color: TEXT1,
    background: '#fff', boxSizing: 'border-box', outline: 'none',
  };
  const lbl = { fontSize: '12px', fontWeight: '600', color: TEXT2, marginBottom: '4px', display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarOff size={20} color={PRIMARY} />
            <span style={{ fontWeight: '700', fontSize: '16px', color: TEXT1 }}>Tạo đơn xin nghỉ</span>
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
                  padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                  border: loai === o.value ? `2px solid ${PRIMARY}` : `2px solid ${BORDER}`,
                  background: loai === o.value ? '#FFF7F4' : '#fff',
                  color: loai === o.value ? PRIMARY : TEXT1, cursor: 'pointer',
                }}>{o.label}</button>
              ))}
            </div>
          </div>

          {/* Thời gian theo loại */}
          {loai === 'ngay' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={lbl}>Từ ngày</label>
                <input type="date" style={inp} value={form.tu_ngay} onChange={e => set('tu_ngay', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Đến ngày</label>
                <input type="date" style={inp} value={form.den_ngay} min={form.tu_ngay} onChange={e => set('den_ngay', e.target.value)} />
              </div>
            </div>
          )}

          {loai === 'buoi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={lbl}>Ngày</label>
                <input type="date" style={inp} value={form.ngay} onChange={e => set('ngay', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Buổi</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[{ v: 'sang', l: 'Sáng' }, { v: 'chieu', l: 'Chiều' }, { v: 'ca_ngay', l: 'Cả ngày' }].map(o => (
                    <button key={o.v} onClick={() => set('buoi', o.v)} style={{
                      padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                      border: form.buoi === o.v ? `2px solid ${PRIMARY}` : `2px solid ${BORDER}`,
                      background: form.buoi === o.v ? '#FFF7F4' : '#fff',
                      color: form.buoi === o.v ? PRIMARY : TEXT1, cursor: 'pointer',
                    }}>{o.l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loai === 'gio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={lbl}>Ngày</label>
                <input type="date" style={inp} value={form.ngay} onChange={e => set('ngay', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Giờ bắt đầu</label>
                  <input type="time" style={inp} value={form.gio_bat_dau} onChange={e => set('gio_bat_dau', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Giờ kết thúc</label>
                  <input type="time" style={inp} value={form.gio_ket_thuc} onChange={e => set('gio_ket_thuc', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Lý do */}
          <div>
            <label style={lbl}>Lý do <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea
              rows={3} style={{ ...inp, resize: 'vertical' }}
              placeholder="Nhập lý do xin nghỉ..."
              value={form.ly_do}
              onChange={e => set('ly_do', e.target.value)}
            />
          </div>

          {/* Người duyệt */}
          <div>
            <label style={lbl}>Người duyệt</label>
            <select style={{ ...inp, appearance: 'auto', cursor: 'pointer' }}
              value={form.nguoi_duyet_id}
              onChange={e => {
                const emp = nguoiDuyetList.find(x => x.id === e.target.value);
                set('nguoi_duyet_id', e.target.value);
                set('nguoi_duyet_ten', emp?.ho_ten || '');
              }}
            >
              <option value="">-- Chọn người duyệt --</option>
              {nguoiDuyetList.map(e => (
                <option key={e.id} value={e.id}>
                  {e.ho_ten} — {e.chuc_vu || e.vai_tro || e.vaiTro || ''}
                </option>
              ))}
            </select>
          </div>

          {err && <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{err}</p>}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button onClick={onClose} style={{
              padding: '9px 20px', borderRadius: '8px', border: `1px solid ${BORDER}`,
              background: '#fff', color: TEXT1, fontSize: '14px', fontWeight: '500', cursor: 'pointer',
            }}>Hủy</button>
            <button onClick={handleSubmit} disabled={saving} style={{
              padding: '9px 20px', borderRadius: '8px', border: 'none',
              background: saving ? '#ccc' : PRIMARY, color: '#fff',
              fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer',
            }}>{saving ? 'Đang gửi...' : 'Gửi đơn'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal từ chối ─────────────────────────────────────────────────── */
function TuChoiModal({ onClose, onConfirm }) {
  const [lyDo, setLyDo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try { await onConfirm(lyDo); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <p style={{ fontWeight: '700', fontSize: '16px', color: TEXT1, marginBottom: '12px' }}>Nhập lý do từ chối</p>
        <textarea
          rows={3} autoFocus
          style={{
            width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`,
            borderRadius: '8px', fontSize: '14px', color: TEXT1, resize: 'vertical',
            boxSizing: 'border-box', outline: 'none',
          }}
          placeholder="Lý do từ chối (tuỳ chọn)..."
          value={lyDo}
          onChange={e => setLyDo(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: '8px', border: `1px solid ${BORDER}`,
            background: '#fff', color: TEXT1, fontSize: '14px', cursor: 'pointer',
          }}>Hủy</button>
          <button onClick={handleConfirm} disabled={saving} style={{
            padding: '9px 20px', borderRadius: '8px', border: 'none',
            background: '#EF4444', color: '#fff', fontSize: '14px', fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}>{saving ? 'Đang xử lý...' : 'Xác nhận từ chối'}</button>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ────────────────────────────────────────────────────────── */
function tinhThoiGianNghi(don) {
  if (don.trang_thai !== 'da_duyet') return { ngay: 0, buoi: 0, gio: 0 };
  if (don.loai_nghi === 'ngay') {
    const start = new Date((don.tu_ngay || don.ngay_bat_dau || '') + 'T00:00:00');
    const end   = new Date((don.den_ngay || don.ngay_ket_thuc || don.tu_ngay || '') + 'T00:00:00');
    return { ngay: Math.max(1, Math.ceil((end - start) / 86400000) + 1), buoi: 0, gio: 0 };
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
  const filtered = donList.filter(don => {
    const ngay = don.tu_ngay || don.ngay || don.ngay_bat_dau || '';
    if (!ngay) return false;
    const d = new Date(ngay + 'T00:00:00');
    return d.getMonth() + 1 === thangF && d.getFullYear() === namF;
  });
  const map = {};
  filtered.forEach(don => {
    const id = don.nguoi_xin_id;
    if (!map[id]) map[id] = { ten: don.nguoi_xin_ten || '?', tongNgay: 0, tongBuoi: 0, tongGio: 0, donList: [] };
    const tg = tinhThoiGianNghi(don);
    map[id].tongNgay += tg.ngay; map[id].tongBuoi += tg.buoi; map[id].tongGio += tg.gio;
    map[id].donList.push(don);
  });
  return Object.entries(map)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => (b.tongNgay + b.tongBuoi / 2 + b.tongGio / 8) - (a.tongNgay + a.tongBuoi / 2 + a.tongGio / 8));
}

/* ── ThongKeTable ────────────────────────────────────────────────────── */
function ThongKeTable({ rows, label = 'Tổng cộng' }) {
  if (rows.length === 0) return null;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {['Nhân viên', 'Nghỉ ngày', 'Nghỉ buổi', 'Nghỉ giờ', 'Quy đổi', 'Số đơn'].map(h => (
              <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Nhân viên' ? 'left' : 'center', fontWeight: '600', color: TEXT2, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((nv, idx) => {
            const q = nv.tongNgay + nv.tongBuoi / 2 + nv.tongGio / 8;
            return (
              <tr key={nv.id} style={{ borderBottom: `1px solid #F3F4F6`, background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '9px 14px', fontWeight: '500', color: TEXT1 }}>{nv.ten}</td>
                <td style={{ padding: '9px 14px', textAlign: 'center', color: nv.tongNgay > 0 ? '#DC2626' : TEXT2 }}>{nv.tongNgay > 0 ? `${nv.tongNgay} ngày` : '—'}</td>
                <td style={{ padding: '9px 14px', textAlign: 'center', color: nv.tongBuoi > 0 ? '#D97706' : TEXT2 }}>{nv.tongBuoi > 0 ? `${nv.tongBuoi} buổi` : '—'}</td>
                <td style={{ padding: '9px 14px', textAlign: 'center', color: nv.tongGio > 0 ? '#2563EB' : TEXT2 }}>{nv.tongGio > 0 ? `${nv.tongGio.toFixed(1)} giờ` : '—'}</td>
                <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                  <span style={{ background: q >= 3 ? '#FEE2E2' : q >= 1 ? '#FEF3C7' : '#F0FDF4', color: q >= 3 ? '#DC2626' : q >= 1 ? '#D97706' : '#16A34A', padding: '2px 9px', borderRadius: '10px', fontWeight: '600', fontSize: '12px' }}>
                    {q % 1 === 0 ? q : q.toFixed(1)} ngày
                  </span>
                </td>
                <td style={{ padding: '9px 14px', textAlign: 'center', color: TEXT2 }}>{nv.donList.length}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#F9FAFB', borderTop: `1px solid ${BORDER}` }}>
            <td style={{ padding: '9px 14px', fontWeight: '700', color: TEXT1 }}>{label}</td>
            <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongNgay, 0)} ngày</td>
            <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongBuoi, 0)} buổi</td>
            <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongGio, 0).toFixed(1)} giờ</td>
            <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.tongNgay + r.tongBuoi / 2 + r.tongGio / 8, 0).toFixed(1)} ngày</td>
            <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: '600', color: TEXT1 }}>{rows.reduce((s, r) => s + r.donList.length, 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── DonCard ─────────────────────────────────────────────────────────── */
function DonCard({ req, canApprove, onDuyet, onTuChoi }) {
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
              {req.ly_do.length > 70 ? req.ly_do.slice(0, 70) + '…' : req.ly_do}
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
        {canApprove && req.trang_thai === 'cho_duyet' && (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button onClick={() => onDuyet(req)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#D1FAE5', color: '#065F46', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              <Check size={14} /> Duyệt
            </button>
            <button onClick={() => onTuChoi(req)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#991B1B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              <X size={14} /> Từ chối
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────────────── */
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1F2937', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
      {msg}
    </div>
  );
}

/* ── LeaveRequestPage ──────────────────────────────────────────────── */
export default function LeaveRequestPage({ currentUser, vaiTro, employees }) {
  const myEmp    = employees.find(e => e.uid === currentUser?.uid);
  const phongBan = myEmp?.phong_ban || '';

  const { leaveRequests, loading, taoDoXinNghi, duyetDon, tuChoiDon } = useLeaveRequests(
    currentUser, vaiTro, phongBan
  );

  const [showTaoModal, setShowTaoModal] = useState(false);
  const [tuChoiTarget, setTuChoiTarget] = useState(null);
  const [toast, setToast]               = useState('');

  const now        = new Date();
  const thangNay   = now.getMonth() + 1;
  const namNay     = now.getFullYear();
  const [thangFilter, setThangFilter] = useState(thangNay);
  const [namFilter,   setNamFilter]   = useState(namNay);
  const thangOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const myName = myEmp?.ho_ten || currentUser?.email || '';

  const handleSubmit = async (data) => {
    await taoDoXinNghi(data);
    setShowTaoModal(false);
    showToast('Đã gửi đơn thành công!');
  };

  const handleDuyet = async (req) => {
    await duyetDon(req.id, myName, req.nguoi_xin_id, req.nguoi_xin_ten);
    showToast('Đã duyệt đơn!');
  };

  const handleTuChoi = async (lyDo) => {
    if (!tuChoiTarget) return;
    await tuChoiDon(tuChoiTarget.id, lyDo, tuChoiTarget.nguoi_xin_id, myName);
    showToast('Đã từ chối đơn.');
  };

  const wrap = { padding: '24px', fontFamily: "'Inter', system-ui, sans-serif", maxWidth: '900px', margin: '0 auto' };
  const card = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' };
  const cardHdr = { padding: '13px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' };

  /* ── ADMIN VIEW ── chỉ thống kê toàn công ty ─────────────────────── */
  if (vaiTro === 'Admin') {
    const rows = useMemo(() => buildThongKe(leaveRequests, thangFilter, namFilter), [leaveRequests, thangFilter, namFilter]);

    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <CalendarOff size={22} color={PRIMARY} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: TEXT1 }}>Thống kê nghỉ phép</h1>
        </div>

        <div style={card}>
          <div style={cardHdr}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px' }}>📅</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT1 }}>Toàn công ty</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={thangFilter} onChange={e => setThangFilter(Number(e.target.value))}
                style={{ padding: '5px 10px', borderRadius: '6px', border: `1px solid ${BORDER}`, fontSize: '13px', color: TEXT1, cursor: 'pointer' }}>
                {thangOptions.map(t => <option key={t} value={t}>Tháng {t}</option>)}
              </select>
              <select value={namFilter} onChange={e => setNamFilter(Number(e.target.value))}
                style={{ padding: '5px 10px', borderRadius: '6px', border: `1px solid ${BORDER}`, fontSize: '13px', color: TEXT1, cursor: 'pointer' }}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {rows.length === 0
            ? <div style={{ padding: '32px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Không có dữ liệu tháng {thangFilter}/{namFilter}</div>
            : <ThongKeTable rows={rows} label="Tổng công ty" />
          }
          <div style={{ padding: '7px 16px', background: '#F0F9FF', borderTop: `1px solid ${BORDER}`, fontSize: '11px', color: TEXT2 }}>
            * Quy đổi: 1 ngày = 2 buổi = 8 giờ · Chỉ tính đơn đã được duyệt
          </div>
        </div>
        <Toast msg={toast} />
      </div>
    );
  }

  /* ── QUẢN LÝ / NHÂN VIÊN VIEW ───────────────────────────────────── */
  const donCuaToi = leaveRequests.filter(d => d.nguoi_xin_id === currentUser?.uid);

  const donThangNay = donCuaToi.filter(d => {
    const ngay = d.tu_ngay || d.ngay_bat_dau || d.ngay || '';
    if (!ngay) return false;
    const dt = new Date(ngay + 'T00:00:00');
    return dt.getMonth() + 1 === thangNay && dt.getFullYear() === namNay;
  });

  const tongNghi = donThangNay.filter(d => d.trang_thai === 'da_duyet').reduce((acc, don) => {
    const tg = tinhThoiGianNghi(don);
    return { ngay: acc.ngay + tg.ngay, buoi: acc.buoi + tg.buoi, gio: acc.gio + tg.gio };
  }, { ngay: 0, buoi: 0, gio: 0 });

  const statCards = [
    { label: 'Tổng đơn',   val: donThangNay.length,                                   color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Chờ duyệt',  val: donThangNay.filter(d => d.trang_thai === 'cho_duyet').length, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Đã duyệt',   val: donThangNay.filter(d => d.trang_thai === 'da_duyet').length,  color: '#059669', bg: '#D1FAE5' },
    { label: 'Từ chối',    val: donThangNay.filter(d => d.trang_thai === 'tu_choi').length,   color: '#DC2626', bg: '#FEE2E2' },
  ];

  // Đơn chờ duyệt của phòng ban (chỉ Quản lý)
  const donChoPhongBan = vaiTro === 'Quản lý'
    ? leaveRequests.filter(d =>
        d.trang_thai === 'cho_duyet' &&
        d.nguoi_xin_id !== currentUser?.uid &&
        d.phong_ban === phongBan &&
        // không duyệt đơn của Admin
        !employees.find(e => e.uid === d.nguoi_xin_id && (e.vai_tro === 'Admin' || e.vaiTro === 'Admin'))
      )
    : [];

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarOff size={22} color={PRIMARY} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: TEXT1 }}>Xin nghỉ phép</h1>
        </div>
        <button onClick={() => setShowTaoModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: PRIMARY, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={16} /> Tạo đơn xin nghỉ
        </button>
      </div>

      {/* Stat cards tháng hiện tại */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '12px', color: s.color, fontWeight: '500', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Banner thời gian nghỉ đã duyệt */}
      <div style={{ background: '#FEF2EC', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: TEXT2, marginBottom: '5px' }}>Thời gian nghỉ tháng {thangNay}/{namNay} (đã duyệt)</div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: TEXT1 }}>
          {tongNghi.ngay > 0 && <span><b>{tongNghi.ngay}</b> ngày</span>}
          {tongNghi.buoi > 0 && <span><b>{tongNghi.buoi}</b> buổi</span>}
          {tongNghi.gio > 0  && <span><b>{tongNghi.gio.toFixed(1)}</b> giờ</span>}
          {tongNghi.ngay + tongNghi.buoi + tongNghi.gio === 0 && (
            <span style={{ color: TEXT2 }}>Chưa có nghỉ phép nào được duyệt tháng này</span>
          )}
        </div>
      </div>

      {/* Danh sách đơn của mình */}
      <div style={{ ...card }}>
        <div style={cardHdr}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT1 }}>Đơn của tôi</span>
          <span style={{ fontSize: '12px', color: TEXT2 }}>{donCuaToi.length} đơn</span>
        </div>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: TEXT2 }}>Đang tải...</div>
        ) : donCuaToi.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Chưa có đơn xin nghỉ nào</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
            {donCuaToi.map(req => (
              <DonCard key={req.id} req={req} canApprove={false} onDuyet={() => {}} onTuChoi={() => {}} />
            ))}
          </div>
        )}
      </div>

      {/* Đơn chờ duyệt của phòng ban — chỉ Quản lý */}
      {vaiTro === 'Quản lý' && (
        <div style={card}>
          <div style={cardHdr}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT1 }}>Đơn chờ duyệt — {phongBan || 'Phòng ban'}</span>
              {donChoPhongBan.length > 0 && (
                <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px' }}>{donChoPhongBan.length} chờ duyệt</span>
              )}
            </div>
          </div>
          {donChoPhongBan.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: TEXT2, fontSize: '13px' }}>Không có đơn nào chờ duyệt</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              {donChoPhongBan.map(req => (
                <DonCard key={req.id} req={req} canApprove={true}
                  onDuyet={handleDuyet}
                  onTuChoi={r => setTuChoiTarget({ id: r.id, nguoi_xin_id: r.nguoi_xin_id, nguoi_xin_ten: r.nguoi_xin_ten })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showTaoModal && (
        <TaoDoModal onClose={() => setShowTaoModal(false)} onSubmit={handleSubmit} currentUser={currentUser} employees={employees} />
      )}
      {tuChoiTarget && (
        <TuChoiModal onClose={() => setTuChoiTarget(null)} onConfirm={handleTuChoi} />
      )}
      <Toast msg={toast} />
    </div>
  );
}
