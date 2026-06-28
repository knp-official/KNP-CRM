import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, UserCheck, Shield, Cake, MapPin, AlertCircle, Clock, ClipboardList } from 'lucide-react';
import { TRANG_THAI_KH, LOAI_KHACH_HANG, PHONG_BAN } from '../data/sampleData';

function isOverdue(task) {
  const done = ['Hoàn thành', 'done', 'completed'];
  if (done.includes(task.trang_thai || '')) return false;
  const dl = task.deadline || task.han_chot || task.due_date;
  if (!dl) return false;
  let d;
  if (dl?.toDate) d = dl.toDate();
  else if (dl?.seconds) d = new Date(dl.seconds * 1000);
  else d = new Date(dl);
  return !isNaN(d) && d < new Date();
}

function fmtDeadline(dl) {
  if (!dl) return '';
  let d;
  if (dl?.toDate) d = dl.toDate();
  else if (dl?.seconds) d = new Date(dl.seconds * 1000);
  else d = new Date(dl);
  if (isNaN(d)) return '';
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function daysLeft(dl) {
  if (!dl) return null;
  let d;
  if (dl?.toDate) d = dl.toDate();
  else if (dl?.seconds) d = new Date(dl.seconds * 1000);
  else d = new Date(dl);
  if (isNaN(d)) return null;
  return Math.round((d - Date.now()) / 86400000);
}

/* ── Design tokens ────────────────────────────────────────────────────── */
const DS = {
  primary:      '#E8500A',
  primaryLight: '#FFF3EE',
  text1:        '#1A1D23',
  text2:        '#6B7280',
  border:       '#E8ECF0',
  bg:           '#F5F6FA',
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  blue:         '#3B82F6',
  purple:       '#8B5CF6',
};

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  padding: '20px',
};

const sectionIcon = (bg, icon) => (
  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {icon}
  </div>
);

/* ── StatCard ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '500', color: DS.text2, margin: '0 0 10px' }}>{label}</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: DS.text1, margin: 0, lineHeight: 1 }}>{value}</p>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

/* ── BirthdayWidget ───────────────────────────────────────────────────── */
function BirthdayWidget({ employees, customers }) {
  const now      = new Date();
  const mm       = String(now.getMonth() + 1).padStart(2, '0');
  const dd       = String(now.getDate()).padStart(2, '0');
  const monthVi  = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const empB = employees
    .filter(e => e.ngay_sinh && e.ngay_sinh.slice(5, 7) === mm && e.trang_thai === 'Đang làm việc')
    .map(e => ({ type: 'nv', name: e.ho_ten, sub: e.chuc_vu, day: e.ngay_sinh.slice(8, 10), isToday: e.ngay_sinh.slice(5) === `${mm}-${dd}` }));

  const custB = customers
    .filter(c => c.ngay_sinh_lien_he && c.ngay_sinh_lien_he.slice(5, 7) === mm)
    .map(c => ({ type: 'kh', name: c.ten, sub: 'Khách hàng', day: c.ngay_sinh_lien_he.slice(8, 10), isToday: c.ngay_sinh_lien_he.slice(5) === `${mm}-${dd}` }));

  const all = [...empB, ...custB].sort((a, b) => +a.day - +b.day);

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        {sectionIcon(DS.primaryLight, <Cake size={16} style={{ color: DS.primary }} />)}
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: DS.text1, margin: 0 }}>
          Sinh nhật {monthVi[+mm]}
        </h3>
        {all.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px', backgroundColor: DS.primaryLight, color: DS.primary }}>
            {all.length} người
          </span>
        )}
      </div>
      {all.length === 0 ? (
        <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px 0', margin: 0 }}>
          Không có sinh nhật trong tháng này
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {all.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '8px',
              backgroundColor: b.isToday ? '#FFF3EE' : '#F9FAFB',
              border: b.isToday ? '1px solid #FDDCCA' : '1px solid transparent',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700',
                backgroundColor: b.type === 'nv' ? '#FFF3EE' : '#EFF6FF',
                color: b.type === 'nv' ? DS.primary : DS.blue,
              }}>
                {b.day}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: DS.text1, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</p>
                <p style={{ fontSize: '12px', color: DS.text2, margin: 0 }}>{b.sub} · {b.type === 'nv' ? 'Nhân viên' : 'Khách hàng'}</p>
              </div>
              {b.isToday && (
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '999px', backgroundColor: DS.primary, color: '#fff', flexShrink: 0 }}>
                  Hôm nay 🎂
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────────────── */
const STATUS_COLOR = {
  'Đang hợp tác':  { bg: '#ECFDF5', color: '#059669', bar: '#10B981' },
  'Tiềm năng':     { bg: '#EFF6FF', color: '#1D4ED8', bar: '#3B82F6' },
  'Ngừng hợp tác': { bg: '#FEF2F2', color: '#DC2626', bar: '#EF4444' },
  'Mới':           { bg: '#F5F3FF', color: '#6D28D9', bar: '#8B5CF6' },
};

export default function Dashboard({ customers, contacts, employees, tasks = [], role = 'admin', myEmployeeId, myEmployee, mySubordinateIds = [], onNavigate }) {
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const isMobile = winWidth < 768;
  const isTablet = winWidth >= 768 && winWidth < 1024;

  const byStatus = TRANG_THAI_KH.map(t => ({ label: t, count: customers.filter(c => c.trang_thai === t).length }));
  const byType   = LOAI_KHACH_HANG.map(l => ({ label: l, count: customers.filter(c => c.loai === l).length })).filter(x => x.count > 0);
  const recent   = [...customers].sort((a, b) => b.ngay_tao.localeCompare(a.ngay_tao)).slice(0, 5);
  const leaders  = employees.filter(e => (e.vai_tro === 'Admin' || e.vai_tro === 'Quản lý') && e.trang_thai === 'Đang làm việc');

  const TYPE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

  const pad = isMobile ? '12px' : '28px';
  const gap = isMobile ? '12px' : '24px';

  return (
    <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Page heading */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: DS.text1, margin: '0 0 4px' }}>Tổng quan</h1>
        <p style={{ fontSize: '14px', color: DS.text2, margin: 0 }}>Chào mừng đến KNP CRM — Kim Ngân Phát</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '8px' : '16px' }}>
        <StatCard icon={Building2} label="Tổng khách hàng"  value={customers.length}                                              iconBg="#FFF3EE"  iconColor={DS.primary}  />
        <StatCard icon={Users}     label="Tổng liên hệ"     value={contacts.length}                                               iconBg="#EFF6FF"  iconColor={DS.blue}     />
        <StatCard icon={TrendingUp} label="Đang hợp tác"    value={customers.filter(c => c.trang_thai === 'Đang hợp tác').length} iconBg="#ECFDF5"  iconColor={DS.success}  />
        <StatCard icon={UserCheck} label="Nhân viên"        value={employees.filter(e => e.trang_thai === 'Đang làm việc').length} iconBg="#F5F3FF" iconColor={DS.purple}  />
      </div>

      {/* ── NHẮC VIỆC ─────────────────────────────────────────────────── */}
      {(() => {
        const now = new Date();
        const in3days = new Date(now.getTime() + 3 * 86400000);
        const overdue  = tasks.filter(isOverdue).slice(0, 5);
        const upcoming = tasks.filter(t => {
          if (t.trang_thai === 'Hoàn thành') return false;
          const dl = t.deadline || t.han_chot;
          if (!dl) return false;
          let d;
          if (dl?.toDate) d = dl.toDate();
          else if (dl?.seconds) d = new Date(dl.seconds * 1000);
          else d = new Date(dl);
          return !isNaN(d) && d >= now && d <= in3days;
        }).slice(0, 5);

        if (overdue.length === 0 && upcoming.length === 0) return null;

        const TaskRow = ({ task, isOv }) => {
          const emp = employees.find(e => e.id === task.nhan_vien_id);
          const dl  = daysLeft(task.deadline || task.han_chot);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid #f3f4f6' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: isOv ? '#FEF2F2' : '#FEF2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isOv ? <AlertCircle size={15} color="#ef4444" /> : <Clock size={15} color="#F15A22" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.tieu_de}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{emp?.ho_ten || '—'} · {fmtDeadline(task.deadline || task.han_chot)}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, flexShrink: 0, background: isOv ? '#FEF2F2' : '#FEF2EC', color: isOv ? '#ef4444' : '#F15A22' }}>
                {isOv ? 'Quá hạn' : dl === 0 ? 'Hôm nay' : dl === 1 ? 'Ngày mai' : `Còn ${dl} ngày`}
              </span>
            </div>
          );
        };

        return (
          <div style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {sectionIcon('#FEF2F2', <AlertCircle size={16} color="#ef4444" />)}
              <h3 style={{ fontSize: 15, fontWeight: 600, color: DS.text1, margin: 0 }}>Nhắc việc</h3>
              {onNavigate && (
                <button onClick={() => onNavigate('tasks')} style={{ marginLeft: 'auto', fontSize: 12, color: '#F15A22', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                  Xem tất cả →
                </button>
              )}
            </div>
            {overdue.length > 0 && (
              <div style={{ marginBottom: upcoming.length ? 16 : 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quá hạn ({overdue.length})</p>
                {overdue.map(t => <TaskRow key={t.id} task={t} isOv={true} />)}
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#F15A22', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sắp đến hạn ({upcoming.length})</p>
                {upcoming.map(t => <TaskRow key={t.id} task={t} isOv={false} />)}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── HIỆU SUẤT NHÂN VIÊN (chỉ admin + manager) ────────────────── */}
      {role !== 'employee' && tasks.length > 0 && (() => {
        const visibleEmpIds = role === 'admin'
          ? employees.map(e => e.id)
          : [myEmployeeId, ...mySubordinateIds].filter(Boolean);

        const rows = visibleEmpIds.map(eid => {
          const emp      = employees.find(e => e.id === eid);
          if (!emp) return null;
          const empTasks = tasks.filter(t => t.nhan_vien_id === eid);
          const total    = empTasks.length;
          if (total === 0) return null;
          const done     = empTasks.filter(t => t.trang_thai === 'Hoàn thành').length;
          const ovd      = empTasks.filter(isOverdue).length;
          const rate     = Math.round((done / total) * 100);
          return { emp, total, done, ovd, rate };
        }).filter(Boolean).sort((a, b) => a.rate - b.rate).slice(0, 8);

        if (rows.length === 0) return null;

        return (
          <div style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {sectionIcon('#F0FDF4', <ClipboardList size={16} color="#059669" />)}
              <h3 style={{ fontSize: 15, fontWeight: 600, color: DS.text1, margin: 0 }}>Hiệu suất nhân viên</h3>
              {onNavigate && (
                <button onClick={() => onNavigate('performance')} style={{ marginLeft: 'auto', fontSize: 12, color: '#F15A22', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                  Xem chi tiết →
                </button>
              )}
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid #e5e7eb' }}>
                    {['Nhân viên', 'Tổng', 'Hoàn thành', 'Quá hạn', 'Tỷ lệ'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ emp, total, done, ovd, rate }) => {
                    const barColor = rate >= 80 ? '#059669' : rate >= 50 ? '#F15A22' : '#ef4444';
                    return (
                      <tr key={emp.id} style={{ borderBottom: '0.5px solid #f9fafb' }}>
                        <td style={{ padding: '9px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F15A22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{(emp.ho_ten || '?').charAt(0)}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>{emp.ho_ten}</span>
                          </div>
                        </td>
                        <td style={{ padding: '9px 10px', fontSize: 13, color: '#374151', fontWeight: 500 }}>{total}</td>
                        <td style={{ padding: '9px 10px', fontSize: 13, color: '#059669', fontWeight: 600 }}>{done}</td>
                        <td style={{ padding: '9px 10px', fontSize: 13, color: ovd > 0 ? '#ef4444' : '#9CA3AF', fontWeight: ovd > 0 ? 600 : 400 }}>{ovd > 0 ? ovd : '—'}</td>
                        <td style={{ padding: '9px 10px', minWidth: 110 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ flex: 1, height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ width: `${rate}%`, height: '100%', background: barColor, borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr', gap: isMobile ? '12px' : '16px' }}>

        {/* By status */}
        <div style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: DS.text1, margin: '0 0 18px' }}>Theo trạng thái</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {byStatus.map(({ label, count }) => {
              const pct = customers.length ? Math.round((count / customers.length) * 100) : 0;
              const sc  = STATUS_COLOR[label] || { bg: '#F5F6FA', color: DS.text2, bar: '#9CA3AF' };
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '999px', backgroundColor: sc.bg, color: sc.color }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: DS.text1 }}>{count}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#F0F2F5', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: sc.bar, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By type */}
        <div style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: DS.text1, margin: '0 0 18px' }}>Theo loại khách hàng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {byType.map(({ label, count }, i) => {
              const pct   = customers.length ? Math.round((count / customers.length) * 100) : 0;
              const color = TYPE_COLORS[i % TYPE_COLORS.length];
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: DS.text1 }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: DS.text1 }}>{count}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#F0F2F5', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <BirthdayWidget employees={employees || []} customers={customers} />
      </div>

      {/* Leadership */}
      {leaders.length > 0 && (
        <div style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            {sectionIcon('#FEE2E2', <Shield size={16} style={{ color: '#DC2626' }} />)}
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: DS.text1, margin: 0 }}>Ban lãnh đạo</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {leaders.sort((a, b) => a.vai_tro === 'Admin' ? -1 : 1).map(e => {
              const isAdmin = e.vai_tro === 'Admin';
              return (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', backgroundColor: '#F9FAFB',
                  borderRadius: '10px', border: '1px solid #E8ECF0', minWidth: '200px',
                }}>
                  <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg,#E8500A,#C2440E)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontWeight: '700', fontSize: '17px' }}>{e.ho_ten.charAt(0)}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: DS.text1, margin: '0 0 2px' }}>{e.ho_ten}</p>
                    <p style={{ fontSize: '12px', color: DS.text2, margin: '0 0 6px' }}>{e.chuc_vu}</p>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '2px 9px', borderRadius: '999px',
                      backgroundColor: isAdmin ? '#FEE2E2' : '#FFEDD5',
                      color: isAdmin ? '#B91C1C' : '#C2410C',
                    }}>
                      {e.vai_tro}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Employees by dept */}
      <div style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          {sectionIcon(DS.primaryLight, <UserCheck size={16} style={{ color: DS.primary }} />)}
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: DS.text1, margin: 0 }}>Nhân viên theo phòng ban</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
          {PHONG_BAN.map(pb => {
            const count     = employees.filter(e => e.phong_ban === pb && e.trang_thai === 'Đang làm việc').length;
            const shortName = pb.replace('Phòng ', '');
            return (
              <div key={pb} style={{ textAlign: 'center', padding: '16px 8px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E8ECF0' }}>
                <p style={{ fontSize: '26px', fontWeight: '700', color: DS.primary, margin: '0 0 6px' }}>{count}</p>
                <p style={{ fontSize: '12px', fontWeight: '500', color: DS.text2, margin: 0, lineHeight: '1.4' }}>{shortName}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent customers */}
      <div style={{ ...card, padding: isMobile ? '14px' : '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: DS.text1, margin: '0 0 16px' }}>Khách hàng mới nhất</h3>
        <div>
          {recent.map((c, i) => {
            const sc = STATUS_COLOR[c.trang_thai] || { bg: '#F5F6FA', color: DS.text2 };
            return (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < recent.length - 1 ? '1px solid #F0F2F5' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: DS.primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={16} style={{ color: DS.primary }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: DS.text1, margin: '0 0 2px' }}>{c.ten}</p>
                    <p style={{ fontSize: '12px', color: DS.text2, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {c.tinh_thanh}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '999px', backgroundColor: '#F5F6FA', color: DS.text2 }}>
                    {c.loai}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '999px', backgroundColor: sc.bg, color: sc.color }}>
                    {c.trang_thai}
                  </span>
                </div>
              </div>
            );
          })}
          {recent.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', padding: '24px 0', margin: 0 }}>Chưa có khách hàng nào</p>
          )}
        </div>
      </div>
    </div>
  );
}
