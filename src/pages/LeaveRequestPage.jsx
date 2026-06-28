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

  const isAdmin = currentUser?.vaiTro === 'Admin';

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
            {isAdmin ? (
              <select style={{ ...inp, appearance: 'none' }}
                value={form.nguoi_duyet_id}
                onChange={e => {
                  const emp = employees.find(x => x.id === e.target.value);
                  set('nguoi_duyet_id', e.target.value);
                  set('nguoi_duyet_ten', emp?.ho_ten || '');
                }}
              >
                <option value="">-- Chọn người duyệt --</option>
                {employees.filter(e => e.vai_tro === 'Admin' || e.vai_tro === 'Quản lý').map(e => (
                  <option key={e.id} value={e.id}>{e.ho_ten}</option>
                ))}
              </select>
            ) : (
              <input style={{ ...inp, background: BG, color: TEXT2 }}
                value={form.nguoi_duyet_ten || '(Chưa có quản lý)'}
                readOnly
              />
            )}
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

/* ── LeaveRequestPage ──────────────────────────────────────────────── */
export default function LeaveRequestPage({ currentUser, vaiTro, employees }) {
  const myEmp   = employees.find(e => e.uid === currentUser?.uid);
  const phongBan = myEmp?.phong_ban || '';

  const { leaveRequests, loading, taoDoXinNghi, duyetDon, tuChoiDon } = useLeaveRequests(
    currentUser, vaiTro, phongBan
  );

  const [showTaoModal, setShowTaoModal] = useState(false);
  const [tuChoiTarget, setTuChoiTarget] = useState(null); // { id, nguoi_xin_id }

  const isAdminOrManager = vaiTro === 'Admin' || vaiTro === 'Quản lý';
  const coTheeDuyetDon = (don) => {
    if (vaiTro === 'Admin') return true;
    if (vaiTro === 'Quản lý') return don.phong_ban === phongBan;
    return false;
  };

  // Filters
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [filterPhong,   setFilterPhong]   = useState('all');
  const [filterThang,   setFilterThang]   = useState('');

  const phongBanList = useMemo(() => {
    const set = new Set(leaveRequests.map(r => r.phong_ban).filter(Boolean));
    return [...set];
  }, [leaveRequests]);

  const filtered = useMemo(() => leaveRequests.filter(r => {
    if (filterStatus !== 'all' && r.trang_thai !== filterStatus) return false;
    if (vaiTro === 'Admin' && filterPhong !== 'all' && r.phong_ban !== filterPhong) return false;
    if (filterThang) {
      const ngay = r.tu_ngay || r.ngay || '';
      if (!ngay.startsWith(filterThang)) return false;
    }
    return true;
  }), [leaveRequests, filterStatus, filterPhong, filterThang, vaiTro]);

  const myEmployeeObj = employees.find(e => e.uid === currentUser?.uid);

  const handleDuyet = async (req) => {
    const myName = myEmployeeObj?.ho_ten || currentUser?.email || 'Quản lý';
    await duyetDon(req.id, myName, req.nguoi_xin_id, req.nguoi_xin_ten);
  };

  const handleTuChoi = async (lyDo) => {
    if (!tuChoiTarget) return;
    const myName = myEmployeeObj?.ho_ten || currentUser?.email || 'Quản lý';
    await tuChoiDon(tuChoiTarget.id, lyDo, tuChoiTarget.nguoi_xin_id, myName);
  };

  const selSty = {
    padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: '8px',
    fontSize: '13px', background: '#fff', color: TEXT1, cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', system-ui, sans-serif", maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarOff size={22} color={PRIMARY} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: TEXT1 }}>Xin nghỉ phép</h1>
        </div>
        <button onClick={() => setShowTaoModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 18px', borderRadius: '10px', border: 'none',
          background: PRIMARY, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        }}>
          <Plus size={16} /> Tạo đơn xin nghỉ
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select style={selSty} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="da_duyet">Đã duyệt</option>
          <option value="tu_choi">Từ chối</option>
        </select>

        {vaiTro === 'Admin' && (
          <select style={selSty} value={filterPhong} onChange={e => setFilterPhong(e.target.value)}>
            <option value="all">Tất cả phòng ban</option>
            {phongBanList.map(pb => <option key={pb} value={pb}>{pb}</option>)}
          </select>
        )}

        {isAdminOrManager && (
          <input type="month" style={selSty} value={filterThang} onChange={e => setFilterThang(e.target.value)} />
        )}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: TEXT2, textAlign: 'center', marginTop: '48px' }}>Đang tải...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '64px', color: TEXT2 }}>
          <CalendarOff size={40} color="#D1D5DB" style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0 }}>Chưa có đơn xin nghỉ nào</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(req => (
            <div key={req.id} style={{
              background: '#fff', borderRadius: '12px', border: `1px solid ${BORDER}`,
              padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Avatar name={req.nguoi_xin_ten} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: TEXT1 }}>{req.nguoi_xin_ten || '—'}</span>
                    <Badge status={req.trang_thai} />
                    <span style={{
                      fontSize: '11px', fontWeight: '500', padding: '2px 8px',
                      borderRadius: '6px', background: '#F3F4F6', color: TEXT2,
                    }}>
                      {LOAI_NGHI.find(l => l.value === req.loai_nghi)?.label || req.loai_nghi}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: TEXT2 }}>
                    {formatThoiGian(req)}
                  </p>
                  {req.ly_do && (
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: TEXT1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '480px' }}>
                      {req.ly_do.length > 60 ? req.ly_do.slice(0, 60) + '…' : req.ly_do}
                    </p>
                  )}
                  {req.trang_thai === 'tu_choi' && req.ly_do_tu_choi && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#991B1B', background: '#FEE2E2', borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>
                      Lý do từ chối: {req.ly_do_tu_choi}
                    </p>
                  )}
                  {req.nguoi_duyet_ten && req.trang_thai !== 'cho_duyet' && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: TEXT2 }}>
                      {req.trang_thai === 'da_duyet' ? 'Duyệt bởi' : 'Từ chối bởi'}: {req.nguoi_duyet_ten}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {isAdminOrManager && req.trang_thai === 'cho_duyet' && coTheeDuyetDon(req) && (
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleDuyet(req)} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 14px', borderRadius: '8px', border: 'none',
                      background: '#D1FAE5', color: '#065F46',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    }}>
                      <Check size={14} /> Duyệt
                    </button>
                    <button onClick={() => setTuChoiTarget({ id: req.id, nguoi_xin_id: req.nguoi_xin_id, nguoi_xin_ten: req.nguoi_xin_ten })} style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 14px', borderRadius: '8px', border: 'none',
                      background: '#FEE2E2', color: '#991B1B',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    }}>
                      <X size={14} /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaoModal && (
        <TaoDoModal
          onClose={() => setShowTaoModal(false)}
          onSubmit={taoDoXinNghi}
          currentUser={currentUser}
          employees={employees}
        />
      )}

      {tuChoiTarget && (
        <TuChoiModal
          onClose={() => setTuChoiTarget(null)}
          onConfirm={handleTuChoi}
        />
      )}
    </div>
  );
}
