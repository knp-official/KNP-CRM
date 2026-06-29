import { useState, useMemo } from 'react';
import { TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const ACCENT = '#F15A22';
const CARD_STYLE = {
  background: '#fff',
  borderRadius: 12,
  border: '0.5px solid #e5e7eb',
  padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

function getRange(period) {
  const now = new Date();
  if (period === 'this_month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (period === 'last_month') {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }
  if (period === 'this_quarter') {
    const q = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), q * 3, 1);
  }
  return null;
}

function getEnd(period) {
  const now = new Date();
  if (period === 'last_month') {
    return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  }
  return now;
}

function isOverdue(task) {
  if (task.trang_thai === 'Hoàn thành') return false;
  if (!task.deadline) return false;
  const d = task.deadline?.toDate?.() || new Date(task.deadline);
  return !isNaN(d) && d < new Date();
}

function inRange(task, since, until) {
  if (!since) return true;
  const raw = task.createdAt?.toDate?.() || (task.createdAt ? new Date(task.createdAt) : null);
  if (!raw || isNaN(raw)) return true;
  return raw >= since && raw <= until;
}

export default function PerformancePage({ tasks = [], employees = [] }) {
  const [period, setPeriod] = useState('this_month');

  const since = getRange(period);
  const until = getEnd(period);

  // ── Lọc Admin ra khỏi mọi tính toán (Rules of Hooks: top level) ──
  const nonAdminUids = useMemo(() => new Set(
    employees
      .filter(e => (e.vai_tro || e.vaiTro || '').toLowerCase().trim() !== 'admin')
      .map(e => e.id)
  ), [employees]);

  const nonAdminEmployees = useMemo(
    () => employees.filter(e => nonAdminUids.has(e.id)),
    [employees, nonAdminUids]
  );

  const nonAdminTasks = useMemo(
    () => tasks.filter(t => nonAdminUids.has(t.nhan_vien_id)),
    [tasks, nonAdminUids]
  );

  // Lọc theo kỳ — chỉ trên nonAdminTasks
  const filtered = useMemo(
    () => nonAdminTasks.filter(t => inRange(t, since, until)),
    [nonAdminTasks, period]
  );

  const total      = filtered.length;
  const completed  = filtered.filter(t => t.trang_thai === 'Hoàn thành').length;
  const overdue    = filtered.filter(isOverdue).length;
  const completedOnTime = filtered.filter(t => {
    if (t.trang_thai !== 'Hoàn thành') return false;
    if (!t.deadline) return true;
    const d = t.deadline?.toDate?.() || new Date(t.deadline);
    const done = t.completedAt?.toDate?.() || (t.completedAt ? new Date(t.completedAt) : null);
    if (!done) return true;
    return done <= d;
  }).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Bảng ranking — nonAdminEmployees × filtered (đã non-admin)
  const empStats = useMemo(() => {
    return nonAdminEmployees.map(emp => {
      const empTasks   = filtered.filter(t => t.nhan_vien_id === emp.id);
      const empTotal   = empTasks.length;
      const empDone    = empTasks.filter(t => t.trang_thai === 'Hoàn thành').length;
      const empOverdue = empTasks.filter(isOverdue).length;
      const empRate    = empTotal > 0 ? Math.round((empDone / empTotal) * 100) : 0;
      return { emp, empTotal, empDone, empOverdue, empRate };
    }).filter(s => s.empTotal > 0)
      .sort((a, b) => b.empRate - a.empRate || b.empTotal - a.empTotal);
  }, [nonAdminEmployees, filtered]);

  const PERIODS = [
    { value: 'this_month',   label: 'Tháng này' },
    { value: 'last_month',   label: 'Tháng trước' },
    { value: 'this_quarter', label: 'Quý này' },
    { value: 'all',          label: 'Tất cả' },
  ];

  const statCards = [
    { label: 'Tổng công việc',       value: total,           color: '#374151', icon: Clock },
    { label: 'Hoàn thành đúng hạn',  value: completedOnTime, color: '#059669', icon: CheckCircle2 },
    { label: 'Quá hạn',              value: overdue,         color: '#DC2626', icon: AlertCircle },
    { label: 'Tỷ lệ hoàn thành',     value: `${rate}%`,      color: ACCENT,    icon: TrendingUp },
  ];

  return (
    <div style={{ padding: 24, fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Hiệu suất nhân viên</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9CA3AF' }}>Bảng xếp hạng hiệu suất nhân viên &amp; quản lý</p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          style={{
            border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '8px 14px',
            fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer',
            outline: 'none',
          }}
        >
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Section 1 — Stat cards (tính trên nonAdminTasks → filtered) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={CARD_STYLE}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Section 2 — Bảng nhân viên (nonAdminEmployees × nonAdminTasks) */}
      <div style={CARD_STYLE}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Hiệu suất từng nhân viên</h2>
        {empStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
            <TrendingUp size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 14 }}>Không có dữ liệu trong kỳ này</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid #e5e7eb' }}>
                  {['Nhân viên', 'Phòng ban', 'Tổng việc', 'Hoàn thành', 'Quá hạn', 'Tỷ lệ'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Tỷ lệ' ? 'right' : 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {empStats.map(({ emp, empTotal, empDone, empOverdue, empRate }) => (
                  <tr key={emp.id} style={{ borderBottom: '0.5px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                            {(emp.ho_ten || emp.ten || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{emp.ho_ten || emp.ten || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#6B7280' }}>{emp.phong_ban || '—'}</td>
                    <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'left' }}>{empTotal}</td>
                    <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: '#059669', textAlign: 'left' }}>{empDone}</td>
                    <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: empOverdue > 0 ? '#DC2626' : '#9CA3AF', textAlign: 'left' }}>{empOverdue}</td>
                    <td style={{ padding: '12px 12px', minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{ width: `${empRate}%`, height: '100%', background: empRate >= 80 ? '#059669' : empRate >= 50 ? ACCENT : '#DC2626', borderRadius: 99, transition: 'width 0.4s ease' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{empRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
