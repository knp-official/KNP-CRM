import { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle, Wallet, Building2, UserCheck } from 'lucide-react';
import { PHONG_BAN } from '../data/sampleData';

const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0);

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color, formatted }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 text-xs text-slate-600 truncate flex-shrink-0">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs font-medium text-slate-700 w-28 text-right flex-shrink-0">{formatted}</div>
    </div>
  );
}

function PersonalReportView({ customers, tasks, myEmployeeId, myUid }) {
  const myTasks = tasks.filter(t =>
    t.nhan_vien_id === myEmployeeId || (myUid && t.created_by_uid === myUid)
  );
  const total    = myTasks.length;
  const done     = myTasks.filter(t => t.trang_thai === 'Hoàn thành').length;
  const inProg   = myTasks.filter(t => t.trang_thai === 'Đang làm').length;
  const overdue  = myTasks.filter(t => t.trang_thai === 'Quá hạn' || (t.deadline && new Date(t.deadline) < new Date() && t.trang_thai !== 'Hoàn thành')).length;
  const onTime   = myTasks.filter(t => t.trang_thai === 'Hoàn thành' && (!t.deadline || new Date(t.deadline) >= new Date())).length;
  const onTimeRate = done > 0 ? Math.round((onTime / done) * 100) : 0;
  const myCustomers = customers.filter(c => c.managedBy === myUid);

  const S = { fontFamily: "'Inter', system-ui, sans-serif", padding: '24px' };
  const card = { background: '#fff', borderRadius: '12px', border: '1px solid #E8E8E8', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' };
  const statNum = { fontSize: '28px', fontWeight: '800', color: '#414042', margin: '6px 0 2px' };
  const statLabel = { fontSize: '12px', color: '#999', margin: 0 };
  const statSub = { fontSize: '11px', color: '#BBBBBB', margin: 0 };

  return (
    <div style={S}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#414042', margin: '0 0 4px' }}>Hiệu suất cá nhân</h1>
      <p style={{ fontSize: '13px', color: '#AAAAAA', margin: '0 0 24px' }}>Chỉ thống kê công việc và khách hàng của bạn</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: '📋', label: 'Tổng công việc', value: total, sub: `${done} hoàn thành`, accent: '#F15A22' },
          { icon: '✅', label: 'Đúng hạn', value: `${onTimeRate}%`, sub: `${onTime}/${done} task`, accent: '#059669' },
          { icon: '⏳', label: 'Đang xử lý', value: inProg, sub: `${overdue} quá hạn`, accent: '#2563EB' },
          { icon: '🏢', label: 'KH quản lý', value: myCustomers.length, sub: 'khách hàng của bạn', accent: '#7C3AED' },
        ].map(({ icon, label, value, sub, accent }) => (
          <div key={label} style={{ ...card, borderTop: `3px solid ${accent}` }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
            <p style={statNum}>{value}</p>
            <p style={{ ...statLabel, color: accent, fontWeight: '600' }}>{label}</p>
            <p style={statSub}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={card}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#414042', margin: '0 0 16px' }}>📊 Tình trạng công việc</p>
          {total === 0 ? (
            <p style={{ fontSize: '13px', color: '#AAAAAA', textAlign: 'center', padding: '16px 0' }}>Chưa có công việc nào</p>
          ) : (
            [
              { label: 'Hoàn thành', value: done, color: '#059669' },
              { label: 'Đang làm', value: inProg, color: '#2563EB' },
              { label: 'Quá hạn', value: overdue, color: '#DC2626' },
              { label: 'Chưa làm', value: total - done - inProg - overdue, color: '#64748B' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#555' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color }}>{value}</span>
                </div>
                <div style={{ height: '6px', background: '#F0F0F0', borderRadius: '99px' }}>
                  <div style={{ height: '6px', background: color, borderRadius: '99px', width: total > 0 ? `${(value / total) * 100}%` : '0%', transition: 'width 0.4s' }} />
                </div>
              </div>
            ))
          )}
        </div>

        <div style={card}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#414042', margin: '0 0 16px' }}>🏢 Khách hàng đang quản lý</p>
          {myCustomers.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#AAAAAA', textAlign: 'center', padding: '16px 0' }}>Chưa có khách hàng nào được giao</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myCustomers.slice(0, 6).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#FFF3EE', border: '1px solid #FED7C3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px' }}>🏢</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#414042', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ten}</p>
                    <p style={{ fontSize: '11px', color: '#AAAAAA', margin: 0 }}>{c.trang_thai || ''}</p>
                  </div>
                </div>
              ))}
              {myCustomers.length > 6 && (
                <p style={{ fontSize: '11px', color: '#AAAAAA', textAlign: 'center', margin: '4px 0 0' }}>+{myCustomers.length - 6} khách hàng khác</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage({ customers, contacts, employees, tasks, quotes, debts, isEmployeeView, myEmployeeId, myUid }) {
  // ── Lọc Admin — PHẢI ở top level trước early return (Rules of Hooks) ──
  const nonAdminUids = useMemo(() => new Set(
    employees
      .filter(e => {
        const role = (e.vai_tro || e.vaiTro || '').toLowerCase().trim();
        const phongBan = (e.phong_ban || e.phongBan || '').toLowerCase().trim();
        return role !== 'admin' && phongBan !== 'ban giám đốc';
      })
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

  if (isEmployeeView) {
    return <PersonalReportView customers={customers} tasks={tasks} myEmployeeId={myEmployeeId} myUid={myUid} />;
  }

  const today = new Date().toISOString().split('T')[0];

  // Task stats — trên nonAdminTasks
  const taskDone    = nonAdminTasks.filter(t => t.trang_thai === 'Hoàn thành').length;
  const taskOverdue = nonAdminTasks.filter(t => t.trang_thai === 'Quá hạn').length;
  const taskPending = nonAdminTasks.filter(t => t.trang_thai === 'Chưa làm' || t.trang_thai === 'Đang làm').length;

  // Debt stats (toàn công ty, không lọc theo nhân viên)
  const totalRevenue   = debts.reduce((s, d) => s + (+d.so_tien || 0), 0);
  const totalCollected = debts.reduce((s, d) => s + (+d.da_thanh_toan || 0), 0);
  const totalOwed      = totalRevenue - totalCollected;
  const overdueDebt    = debts
    .filter(d => d.ngay_den_han < today && d.trang_thai !== 'Đã thanh toán')
    .reduce((s, d) => s + ((+d.so_tien || 0) - (+d.da_thanh_toan || 0)), 0);

  // Quote stats
  const quoteWon   = quotes.filter(q => q.trang_thai === 'Thắng').length;
  const quoteLost  = quotes.filter(q => q.trang_thai === 'Thua').length;
  const quoteTotal = quotes.filter(q => q.trang_thai === 'Thắng' || q.trang_thai === 'Thua').length;
  const winRate    = quoteTotal > 0 ? Math.round((quoteWon / quoteTotal) * 100) : 0;

  // Top customers by debt (toàn công ty)
  const custDebt = customers.map(c => {
    const total = debts.filter(d => d.khach_hang_id === c.id).reduce((s, d) => s + (+d.so_tien || 0), 0);
    const paid  = debts.filter(d => d.khach_hang_id === c.id).reduce((s, d) => s + (+d.da_thanh_toan || 0), 0);
    return { ...c, total, owed: total - paid };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);
  const maxDebt = custDebt[0]?.total || 1;

  // Tasks by employee — nonAdminEmployees × nonAdminTasks
  const empTasks = nonAdminEmployees.map(e => ({
    ...e,
    total: nonAdminTasks.filter(t => t.nhan_vien_id === e.id).length,
    done:  nonAdminTasks.filter(t => t.nhan_vien_id === e.id && t.trang_thai === 'Hoàn thành').length,
  })).sort((a, b) => b.total - a.total);
  const maxTasks = Math.max(...empTasks.map(e => e.total), 1);

  // Monthly revenue from quotes
  const monthlyData = {};
  quotes.forEach(q => {
    const m = q.ngay_tao?.slice(0, 7);
    if (m) monthlyData[m] = (monthlyData[m] || 0) + (+q.tong_sau_vat || 0);
  });
  const months = Object.keys(monthlyData).sort().slice(-6);
  const maxMonthly = Math.max(...months.map(m => monthlyData[m]), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Báo cáo tổng hợp</h1>
        <p className="text-slate-500 text-sm mt-0.5">Báo cáo công việc nhân viên &amp; quản lý</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Khách hàng" value={customers.length} sub={`${customers.filter(c => c.trang_thai === 'Đang hợp tác').length} đang hợp tác`} color="bg-orange-500" />
        <StatCard icon={Wallet} label="Doanh thu (BG)" value={fmt(totalRevenue) + ' đ'} sub={`Đã thu ${fmt(totalCollected)} đ`} color="bg-emerald-500" />
        <StatCard icon={AlertCircle} label="Còn phải thu" value={fmt(totalOwed) + ' đ'} sub={`Quá hạn ${fmt(overdueDebt)} đ`} color="bg-red-500" />
        <StatCard icon={CheckCircle2} label="Tỷ lệ thắng BG" value={`${winRate}%`} sub={`${quoteWon}/${quoteTotal} báo giá`} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Task overview — nonAdminTasks */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Tình trạng công việc
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Hoàn thành', value: taskDone,    color: 'bg-emerald-400' },
              { label: 'Đang xử lý', value: taskPending, color: 'bg-blue-400' },
              { label: 'Quá hạn',    value: taskOverdue, color: 'bg-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-bold text-slate-900">{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: nonAdminTasks.length ? `${(value / nonAdminTasks.length) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400 text-center pt-1">Tổng {nonAdminTasks.length} công việc</p>
          </div>
        </div>

        {/* Debt by status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-orange-500" /> Công nợ theo trạng thái
          </h3>
          <div className="space-y-3">
            {['Chưa thanh toán', 'Thanh toán một phần', 'Đã thanh toán', 'Quá hạn'].map(s => {
              const count  = debts.filter(d => d.trang_thai === s).length;
              const amount = debts.filter(d => d.trang_thai === s).reduce((sum, d) => sum + (+d.so_tien || 0), 0);
              return (
                <div key={s} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-slate-700 font-medium">{s}</p>
                    <p className="text-xs text-slate-400">{count} hóa đơn</p>
                  </div>
                  <span className="font-bold text-slate-900">{fmt(amount)} đ</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quote funnel */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" /> Funnel báo giá
          </h3>
          <div className="space-y-3">
            {['Nháp', 'Chờ duyệt', 'Đã duyệt', 'Đã gửi KH', 'Thắng', 'Thua'].map(s => {
              const count = quotes.filter(q => q.trang_thai === s).length;
              return (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{s}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: quotes.length ? `${(count / quotes.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="font-bold text-slate-900 w-4 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue from quotes by month */}
      {months.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-500" /> Giá trị báo giá theo tháng
          </h3>
          <div className="space-y-3">
            {months.map(m => (
              <BarRow key={m} label={m} value={monthlyData[m]} max={maxMonthly} color="bg-orange-400" formatted={fmt(monthlyData[m]) + ' đ'} />
            ))}
          </div>
        </div>
      )}

      {/* Department stats — nonAdminEmployees × nonAdminTasks */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <UserCheck size={16} className="text-orange-500" /> Nhân viên &amp; công việc theo phòng ban
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {PHONG_BAN.map(pb => {
            const empInPB = nonAdminEmployees.filter(e => e.phong_ban === pb && e.trang_thai === 'Đang làm việc');
            const empIds  = empInPB.map(e => e.id);
            const pbTasks = nonAdminTasks.filter(t => empIds.includes(t.nhan_vien_id));
            const pbDone  = pbTasks.filter(t => t.trang_thai === 'Hoàn thành').length;
            return (
              <div key={pb} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-800 mb-3">{pb}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Nhân viên</span>
                    <span className="font-bold text-slate-900">{empInPB.length} người</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Công việc</span>
                    <span className="font-bold text-slate-900">{pbTasks.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Hoàn thành</span>
                    <span className="font-bold text-emerald-600">{pbDone}</span>
                  </div>
                  {pbTasks.length > 0 && (
                    <div className="h-1.5 bg-slate-200 rounded-full mt-1">
                      <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(pbDone / pbTasks.length) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top customers */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-purple-500" /> Top khách hàng (doanh thu)
          </h3>
          {custDebt.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">Chưa có dữ liệu</p> : (
            <div className="space-y-3">
              {custDebt.map(c => (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium truncate max-w-48">{c.ten}</span>
                    <span className="text-slate-500 text-xs">{fmt(c.total)} đ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${(c.total / maxDebt) * 100}%` }} />
                    </div>
                    {c.owed > 0 && <span className="text-xs text-orange-500 font-medium flex-shrink-0">Nợ {fmt(c.owed)} đ</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks by employee — nonAdminEmployees × nonAdminTasks */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> Công việc theo nhân viên
          </h3>
          {empTasks.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">Chưa có dữ liệu</p> : (
            <div className="space-y-3">
              {empTasks.map(e => (
                <div key={e.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{e.ho_ten}</span>
                    <span className="text-slate-500 text-xs">
                      {e.total === 0 ? '—' : `${e.done}/${e.total} hoàn thành`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 relative">
                      <div className="bg-blue-200 h-1.5 rounded-full" style={{ width: `${(e.total / maxTasks) * 100}%` }} />
                      <div className="bg-emerald-400 h-1.5 rounded-full absolute top-0 left-0" style={{ width: `${(e.done / maxTasks) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
