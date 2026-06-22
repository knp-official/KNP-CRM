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

export default function ReportsPage({ customers, contacts, employees, tasks, quotes, debts }) {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  // Task stats
  const taskDone = tasks.filter(t => t.trang_thai === 'Hoàn thành').length;
  const taskOverdue = tasks.filter(t => t.trang_thai === 'Quá hạn').length;
  const taskPending = tasks.filter(t => t.trang_thai === 'Chưa làm' || t.trang_thai === 'Đang làm').length;

  // Debt stats
  const totalRevenue = debts.reduce((s, d) => s + (+d.so_tien || 0), 0);
  const totalCollected = debts.reduce((s, d) => s + (+d.da_thanh_toan || 0), 0);
  const totalOwed = totalRevenue - totalCollected;
  const overdueDebt = debts.filter(d => d.ngay_den_han < today && d.trang_thai !== 'Đã thanh toán')
    .reduce((s, d) => s + ((+d.so_tien || 0) - (+d.da_thanh_toan || 0)), 0);

  // Quote stats
  const quoteWon = quotes.filter(q => q.trang_thai === 'Thắng').length;
  const quoteLost = quotes.filter(q => q.trang_thai === 'Thua').length;
  const quoteTotal = quotes.filter(q => q.trang_thai === 'Thắng' || q.trang_thai === 'Thua').length;
  const winRate = quoteTotal > 0 ? Math.round((quoteWon / quoteTotal) * 100) : 0;

  // Top customers by debt
  const custDebt = customers.map(c => {
    const total = debts.filter(d => d.khach_hang_id === c.id).reduce((s, d) => s + (+d.so_tien || 0), 0);
    const paid = debts.filter(d => d.khach_hang_id === c.id).reduce((s, d) => s + (+d.da_thanh_toan || 0), 0);
    return { ...c, total, owed: total - paid };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);

  const maxDebt = custDebt[0]?.total || 1;

  // Tasks by employee
  const empTasks = employees.map(e => ({
    ...e,
    total: tasks.filter(t => t.nhan_vien_id === e.id).length,
    done: tasks.filter(t => t.nhan_vien_id === e.id && t.trang_thai === 'Hoàn thành').length,
  })).filter(e => e.total > 0).sort((a, b) => b.total - a.total);
  const maxTasks = empTasks[0]?.total || 1;

  // Monthly debt by quote creation date (simulate monthly revenue from quotes)
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
        <p className="text-slate-500 text-sm mt-0.5">Cập nhật theo dữ liệu thực tế trong hệ thống</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Khách hàng" value={customers.length} sub={`${customers.filter(c => c.trang_thai === 'Đang hợp tác').length} đang hợp tác`} color="bg-orange-500" />
        <StatCard icon={Wallet} label="Doanh thu (BG)" value={fmt(totalRevenue) + ' đ'} sub={`Đã thu ${fmt(totalCollected)} đ`} color="bg-emerald-500" />
        <StatCard icon={AlertCircle} label="Còn phải thu" value={fmt(totalOwed) + ' đ'} sub={`Quá hạn ${fmt(overdueDebt)} đ`} color="bg-red-500" />
        <StatCard icon={CheckCircle2} label="Tỷ lệ thắng BG" value={`${winRate}%`} sub={`${quoteWon}/${quoteTotal} báo giá`} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Task overview */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Tình trạng công việc
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Hoàn thành', value: taskDone, color: 'bg-emerald-400' },
              { label: 'Đang xử lý', value: taskPending, color: 'bg-blue-400' },
              { label: 'Quá hạn', value: taskOverdue, color: 'bg-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-bold text-slate-900">{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: tasks.length ? `${(value / tasks.length) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400 text-center pt-1">Tổng {tasks.length} công việc</p>
          </div>
        </div>

        {/* Debt by status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-orange-500" /> Công nợ theo trạng thái
          </h3>
          <div className="space-y-3">
            {['Chưa thanh toán', 'Thanh toán một phần', 'Đã thanh toán', 'Quá hạn'].map(s => {
              const count = debts.filter(d => d.trang_thai === s).length;
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

      {/* Department stats */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <UserCheck size={16} className="text-orange-500" /> Nhân viên & công việc theo phòng ban
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {PHONG_BAN.map(pb => {
            const empInPB = employees.filter(e => e.phong_ban === pb && e.trang_thai === 'Đang làm việc');
            const empIds = empInPB.map(e => e.id);
            const pbTasks = tasks.filter(t => empIds.includes(t.nhan_vien_id));
            const pbDone = pbTasks.filter(t => t.trang_thai === 'Hoàn thành').length;
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

        {/* Tasks by employee */}
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
                    <span className="text-slate-500 text-xs">{e.done}/{e.total} hoàn thành</span>
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
