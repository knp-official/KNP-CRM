import { useState, useMemo } from 'react';
import { FileBarChart2, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Plus, User, Calendar } from 'lucide-react';

const PRIMARY = '#F15A22';
const TEXT1   = '#1F2937';
const TEXT2   = '#6B7280';
const BORDER  = '#E5E7EB';

/* ── Helpers ──────────────────────────────────────────────────────────── */
function fmtDate(d) {
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function toDateStr(date) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function thuViet(date) {
  const DAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return DAYS[date.getDay()];
}

function toFireDate(ts) {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}

function dlDaysLate(deadlineStr, selectedDate) {
  if (!deadlineStr) return 0;
  const dl = new Date(deadlineStr);
  const sel = new Date(selectedDate);
  sel.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((sel - dl) / 86400000));
}

function fmtDl(deadlineStr) {
  if (!deadlineStr) return '';
  const d = new Date(deadlineStr);
  if (isNaN(d)) return deadlineStr;
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ── Badge ────────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    'Hoàn thành': { bg: '#D1FAE5', color: '#065F46' },
    'Đang làm':   { bg: '#DBEAFE', color: '#1E40AF' },
    'Chưa làm':   { bg: '#F3F4F6', color: '#6B7280' },
    'Quá hạn':    { bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = map[status] || map['Chưa làm'];
  return (
    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '9999px', background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

/* ── TaskCard ─────────────────────────────────────────────────────────── */
function TaskCard({ task, cardBg, cardBorder, extraBadge, employees }) {
  const emp = employees.find(e => e.id === task.nhan_vien_id);
  const mo_ta = (task.mo_ta || '').length > 80 ? task.mo_ta.slice(0, 80) + '…' : task.mo_ta;
  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '10px', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: TEXT1 }}>{task.tieu_de}</p>
          {mo_ta && <p style={{ margin: '3px 0 0', fontSize: '12px', color: TEXT2 }}>{mo_ta}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
            {emp && <span style={{ fontSize: '12px', color: TEXT2, display: 'flex', alignItems: 'center', gap: '3px' }}><User size={11} />{emp.ho_ten}</span>}
            {task.deadline && <span style={{ fontSize: '12px', color: TEXT2, display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={11} />{fmtDl(task.deadline)}</span>}
            <StatusBadge status={task.trang_thai} />
            {extraBadge}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */
function Section({ icon, title, count, accent, children }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ fontWeight: '700', fontSize: '14px', color: accent || TEXT1 }}>{title}</span>
        <span style={{ marginLeft: '4px', fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: '#F3F4F6', color: TEXT2 }}>{count}</span>
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ msg }) {
  return <p style={{ textAlign: 'center', color: TEXT2, fontSize: '13px', padding: '16px 0', margin: 0 }}>{msg}</p>;
}

/* ── Bảng tổng hợp Admin ──────────────────────────────────────────────── */
function AdminSummaryTable({ rows }) {
  const COLS = ['Nhân viên', 'Hoàn thành', 'Đang làm', 'Quá hạn', 'Mới giao', 'Tỷ lệ %'];
  if (rows.length === 0) {
    return <EmptyState msg="Không có dữ liệu công việc cho ngày này" />;
  }
  const totals = rows.reduce((a, r) => ({
    completed: a.completed + r.completed,
    inProgress: a.inProgress + r.inProgress,
    overdue: a.overdue + r.overdue,
    newToday: a.newToday + r.newToday,
  }), { completed: 0, inProgress: 0, overdue: 0, newToday: 0 });
  const totalRate = totals.completed + totals.inProgress + totals.overdue > 0
    ? Math.round(totals.completed / (totals.completed + totals.inProgress + totals.overdue) * 100) : 0;

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
          {rows.map((r, i) => {
            const rate = r.completed + r.inProgress + r.overdue > 0
              ? Math.round(r.completed / (r.completed + r.inProgress + r.overdue) * 100) : 0;
            return (
              <tr key={r.empId} style={{ borderBottom: `1px solid #F3F4F6`, background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '9px 12px', fontWeight: '500', color: TEXT1 }}>{r.empName}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: '#065F46', fontWeight: '600' }}>{r.completed || '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: '#1D4ED8' }}>{r.inProgress || '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: r.overdue > 0 ? '#DC2626' : TEXT2, fontWeight: r.overdue > 0 ? '600' : '400' }}>{r.overdue || '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center', color: TEXT2 }}>{r.newToday || '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                  <span style={{ fontWeight: '700', color: rate >= 80 ? '#065F46' : rate >= 50 ? '#D97706' : '#DC2626' }}>{rate}%</span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#F9FAFB', borderTop: `1px solid ${BORDER}` }}>
            <td style={{ padding: '9px 12px', fontWeight: '700', color: TEXT1 }}>Tổng công ty</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: '#065F46' }}>{totals.completed}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: '#1D4ED8' }}>{totals.inProgress}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: totals.overdue > 0 ? '#DC2626' : TEXT2 }}>{totals.overdue}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: TEXT1 }}>{totals.newToday}</td>
            <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: '700', color: totalRate >= 80 ? '#065F46' : totalRate >= 50 ? '#D97706' : '#DC2626' }}>{totalRate}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ══ TaskDailyReportPage ════════════════════════════════════════════════ */
export default function TaskDailyReportPage({ tasks, employees, role, myEmployeeId }) {
  const isAdmin = (role || '').toLowerCase().trim() === 'admin';

  // ── All hooks at top level ───────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(() => toDateStr(new Date()));
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const selDateObj = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d;
  }, [selectedDate]);

  const selEndObj = useMemo(() => {
    const d = new Date(selectedDate + 'T23:59:59.999');
    return d;
  }, [selectedDate]);

  const isToday = useMemo(() => toDateStr(new Date()) === selectedDate, [selectedDate]);

  // ── Derived: tasks for the selected employee (admin) or myself (employee) ──
  const baseTasks = useMemo(() => {
    if (!isAdmin) return tasks.filter(t => t.nhan_vien_id === myEmployeeId);
    if (selectedEmpId) return tasks.filter(t => t.nhan_vien_id === selectedEmpId);
    return tasks;
  }, [tasks, isAdmin, myEmployeeId, selectedEmpId]);

  // ── 4 groups ────────────────────────────────────────────────────────
  const completed = useMemo(() => baseTasks.filter(t => {
    const ca = toFireDate(t.completed_at);
    return ca && ca >= selDateObj && ca <= selEndObj;
  }), [baseTasks, selDateObj, selEndObj]);

  const inProgress = useMemo(() => baseTasks.filter(t => {
    if (t.trang_thai !== 'Đang làm') return false;
    const dl = t.deadline ? new Date(t.deadline) : null;
    return dl && dl >= selDateObj;
  }), [baseTasks, selDateObj]);

  const overdue = useMemo(() => baseTasks.filter(t => {
    if (t.trang_thai === 'Hoàn thành') return false;
    const dl = t.deadline ? new Date(t.deadline) : null;
    return dl && dl < selDateObj;
  }), [baseTasks, selDateObj]);

  const newToday = useMemo(() => baseTasks.filter(t => {
    return (t.ngay_tao || '').startsWith(selectedDate);
  }), [baseTasks, selectedDate]);

  // ── Admin summary rows ───────────────────────────────────────────────
  const adminRows = useMemo(() => {
    if (!isAdmin || selectedEmpId) return [];
    const empSet = new Set(tasks.map(t => t.nhan_vien_id).filter(Boolean));
    return [...empSet].map(empId => {
      const emp = employees.find(e => e.id === empId);
      const empTasks = tasks.filter(t => t.nhan_vien_id === empId);
      const c = empTasks.filter(t => { const ca = toFireDate(t.completed_at); return ca && ca >= selDateObj && ca <= selEndObj; }).length;
      const ip = empTasks.filter(t => { if (t.trang_thai !== 'Đang làm') return false; const dl = t.deadline ? new Date(t.deadline) : null; return dl && dl >= selDateObj; }).length;
      const od = empTasks.filter(t => { if (t.trang_thai === 'Hoàn thành') return false; const dl = t.deadline ? new Date(t.deadline) : null; return dl && dl < selDateObj; }).length;
      const nt = empTasks.filter(t => (t.ngay_tao || '').startsWith(selectedDate)).length;
      return { empId, empName: emp?.ho_ten || '?', completed: c, inProgress: ip, overdue: od, newToday: nt };
    }).filter(r => r.completed + r.inProgress + r.overdue + r.newToday > 0)
      .sort((a, b) => b.completed - a.completed);
  }, [isAdmin, selectedEmpId, tasks, employees, selDateObj, selEndObj, selectedDate]);

  // ── Nav ─────────────────────────────────────────────────────────────
  const goPrev = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateStr(d));
  };
  const goNext = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(toDateStr(d));
  };

  // ── Styles ──────────────────────────────────────────────────────────
  const wrap    = { padding: '24px', fontFamily: "'Inter', system-ui, sans-serif", maxWidth: '900px', margin: '0 auto' };
  const selStyle = { padding: '5px 10px', borderRadius: '6px', border: `1px solid ${BORDER}`, fontSize: '13px', color: TEXT1, cursor: 'pointer', background: '#fff' };
  const navBtn  = { display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#fff', fontSize: '13px', fontWeight: '500', color: TEXT1, cursor: 'pointer' };
  const todayBtn = { padding: '7px 14px', borderRadius: '8px', border: `1px solid ${PRIMARY}`, background: isToday ? PRIMARY : '#FFF7F4', color: isToday ? '#fff' : PRIMARY, fontSize: '13px', fontWeight: '600', cursor: 'pointer' };

  const undoneCnt = inProgress.length + overdue.length;

  // ── Check if admin showing single employee detail view ──────────────
  const showDetail = !isAdmin || !!selectedEmpId;

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileBarChart2 size={22} color={PRIMARY} />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: TEXT1 }}>Báo cáo công việc hàng ngày</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: TEXT2 }}>{isAdmin ? 'Toàn công ty' : 'Báo cáo của tôi'}</p>
          </div>
        </div>

        {/* Date nav */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={navBtn} onClick={goPrev}><ChevronLeft size={14} /> Hôm qua</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: '#F9FAFB', fontSize: '13px', color: TEXT1, fontWeight: '600' }}>
            📅 {thuViet(selDateObj)}, {fmtDate(selDateObj)}
          </div>
          <button style={todayBtn} onClick={() => setSelectedDate(toDateStr(new Date()))}>Hôm nay</button>
          {!isToday && <button style={navBtn} onClick={goNext}>Hôm sau <ChevronRight size={14} /></button>}
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ ...selStyle, cursor: 'pointer' }} />
        </div>
      </div>

      {/* Admin filter */}
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: TEXT2 }}>Xem theo nhân viên:</span>
          <select value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)} style={{ ...selStyle, minWidth: '180px' }}>
            <option value="">Tất cả nhân viên</option>
            {employees.filter(e => e.trang_thai === 'Đang làm việc' || !e.trang_thai).map(e => (
              <option key={e.id} value={e.id}>{e.ho_ten}</option>
            ))}
          </select>
          {selectedEmpId && (
            <button onClick={() => setSelectedEmpId('')} style={{ fontSize: '12px', color: TEXT2, background: '#F3F4F6', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer' }}>
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Stat chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { icon: '✅', label: 'Hoàn thành', val: completed.length, bg: '#ECFDF5', color: '#065F46' },
          { icon: '🔄', label: 'Đang làm',   val: inProgress.length, bg: '#EFF6FF', color: '#1D4ED8' },
          { icon: '⏰', label: 'Quá hạn',    val: overdue.length,   bg: '#FEF2F2', color: '#DC2626' },
          { icon: '📅', label: 'Mới giao',   val: newToday.length,  bg: '#F9FAFB', color: TEXT1 },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${BORDER}` }}>
            <p style={{ margin: 0, fontSize: '12px', color: TEXT2, fontWeight: '500' }}>{s.icon} {s.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '800', color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* ADMIN: summary table or detail view */}
      {isAdmin && !selectedEmpId && (
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📊</span>
            <span style={{ fontWeight: '700', fontSize: '14px', color: TEXT1 }}>Tổng quan theo nhân viên</span>
            <span style={{ fontSize: '11px', color: TEXT2, marginLeft: '4px' }}>{fmtDate(selDateObj)}</span>
          </div>
          <AdminSummaryTable rows={adminRows} />
        </div>
      )}

      {/* Detail sections — admin single employee OR employee view */}
      {showDetail && (
        <>
          <Section icon="✅" title="Đã hoàn thành" count={completed.length} accent="#065F46">
            {completed.length === 0
              ? <EmptyState msg="Không có công việc hoàn thành trong ngày này" />
              : completed.map(t => (
                  <TaskCard key={t.id} task={t} employees={employees}
                    cardBg="#ECFDF5" cardBorder="#6EE7B7" />
                ))
            }
          </Section>

          <Section icon="🔄" title="Đang làm dở" count={inProgress.length} accent="#1D4ED8">
            {inProgress.length === 0
              ? <EmptyState msg="Không có công việc đang làm dở" />
              : inProgress.map(t => {
                  const afterFive = isToday && new Date().getHours() >= 17;
                  const badge = afterFive
                    ? <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '9999px', fontWeight: '600' }}>Sẽ chuyển sang mai</span>
                    : null;
                  return <TaskCard key={t.id} task={t} employees={employees} cardBg="#EFF6FF" cardBorder="#BFDBFE" extraBadge={badge} />;
                })
            }
          </Section>

          <Section icon="⏰" title="Quá hạn chưa xong" count={overdue.length} accent="#DC2626">
            {overdue.length === 0
              ? <EmptyState msg="Không có công việc quá hạn" />
              : overdue.map(t => {
                  const late = dlDaysLate(t.deadline, selectedDate);
                  const badge = late > 0
                    ? <span style={{ fontSize: '11px', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '9999px', fontWeight: '600' }}>Trễ {late} ngày</span>
                    : null;
                  return <TaskCard key={t.id} task={t} employees={employees} cardBg="#FEF2F2" cardBorder="#FCA5A5" extraBadge={badge} />;
                })
            }
          </Section>

          <Section icon="📅" title="Mới được giao hôm nay" count={newToday.length} accent={TEXT2}>
            {newToday.length === 0
              ? <EmptyState msg="Không có công việc mới được giao trong ngày này" />
              : newToday.map(t => (
                  <TaskCard key={t.id} task={t} employees={employees}
                    cardBg="#F9FAFB" cardBorder="#E5E7EB" />
                ))
            }
          </Section>
        </>
      )}

      {/* CTA — chỉ Employee, chỉ hôm nay, và chỉ khi có task chưa xong */}
      {!isAdmin && isToday && undoneCnt > 0 && (
        <div style={{ background: '#FFF7F4', border: `1px solid #FDDCB5`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '14px', color: TEXT1 }}>
            💡 Bạn còn <strong style={{ color: PRIMARY }}>{undoneCnt} công việc</strong> chưa hoàn thành hôm nay.
          </p>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              disabled
              title="Tính năng đang phát triển (Phase 2)"
              style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid #ccc`, background: '#F3F4F6', color: '#9CA3AF', fontSize: '13px', fontWeight: '500', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Dời tất cả sang mai
              <span style={{ fontSize: '10px', background: '#E5E7EB', padding: '1px 6px', borderRadius: '4px' }}>Phase 2</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
