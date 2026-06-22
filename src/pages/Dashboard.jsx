import { Building2, Users, TrendingUp, MapPin, Cake, UserCheck } from 'lucide-react';
import Badge from '../components/Badge';
import { TRANG_THAI_KH, LOAI_KHACH_HANG, PHONG_BAN } from '../data/sampleData';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// ── Widget sinh nhật tháng này ──
function BirthdayWidget({ employees, customers }) {
  const now = new Date();
  const thisMonth = String(now.getMonth() + 1).padStart(2, '0');
  const today = String(now.getDate()).padStart(2, '0');

  // Lọc nhân viên có sinh nhật tháng này
  const empBirthdays = employees
    .filter(e => e.ngay_sinh && e.ngay_sinh.slice(5, 7) === thisMonth && e.trang_thai === 'Đang làm việc')
    .map(e => ({
      type: 'nv',
      name: e.ho_ten,
      sub: e.chuc_vu,
      day: e.ngay_sinh.slice(8, 10),
      isToday: e.ngay_sinh.slice(5) === `${thisMonth}-${today}`,
    }));

  // Lọc khách hàng có ngày sinh liên hệ chính tháng này
  const custBirthdays = customers
    .filter(c => c.ngay_sinh_lien_he && c.ngay_sinh_lien_he.slice(5, 7) === thisMonth)
    .map(c => ({
      type: 'kh',
      name: c.ten,
      sub: 'Khách hàng',
      day: c.ngay_sinh_lien_he.slice(8, 10),
      isToday: c.ngay_sinh_lien_he.slice(5) === `${thisMonth}-${today}`,
    }));

  const all = [...empBirthdays, ...custBirthdays].sort((a, b) => +a.day - +b.day);

  const thangViet = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Cake size={17} className="text-orange-500" />
        <h3 className="font-semibold text-slate-900">Sinh nhật {thangViet[+thisMonth]}</h3>
        {all.length > 0 && (
          <span className="ml-auto text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
            {all.length} người
          </span>
        )}
      </div>
      {all.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-4">Không có sinh nhật trong tháng này</p>
      ) : (
        <div className="space-y-2">
          {all.map((b, i) => (
            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${b.isToday ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${b.type === 'nv' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {b.day}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{b.name}</p>
                <p className="text-xs text-slate-500">{b.sub} · {b.type === 'nv' ? 'Nhân viên' : 'Khách hàng'}</p>
              </div>
              {b.isToday && (
                <span className="text-xs bg-orange-500 text-white font-medium px-2 py-0.5 rounded-full flex-shrink-0">
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

export default function Dashboard({ customers, contacts, employees }) {
  const byStatus = TRANG_THAI_KH.map(t => ({
    label: t,
    count: customers.filter(c => c.trang_thai === t).length,
  }));

  const byType = LOAI_KHACH_HANG.map(l => ({
    label: l,
    count: customers.filter(c => c.loai === l).length,
  })).filter(x => x.count > 0);

  const recent = [...customers].sort((a, b) => b.ngay_tao.localeCompare(a.ngay_tao)).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
        <p className="text-slate-500 text-sm mt-1">Chào mừng đến KNP CRM — Kim Ngân Phát</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Tổng khách hàng" value={customers.length} color="bg-orange-500" />
        <StatCard icon={Users} label="Tổng liên hệ" value={contacts.length} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Đang hợp tác" value={customers.filter(c => c.trang_thai === 'Đang hợp tác').length} color="bg-emerald-500" />
        <StatCard icon={UserCheck} label="Nhân viên" value={employees.filter(e => e.trang_thai === 'Đang làm việc').length} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Theo trạng thái</h3>
          <div className="space-y-3">
            {byStatus.map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <Badge label={label} />
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full"
                      style={{ width: customers.length ? `${(count / customers.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Theo loại khách hàng</h3>
          <div className="space-y-3">
            {byType.map(({ label, count }) => (
              <div key={label} className="flex items-center justify-between">
                <Badge label={label} />
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: customers.length ? `${(count / customers.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget sinh nhật */}
        <BirthdayWidget employees={employees || []} customers={customers} />
      </div>

      {/* Nhân viên theo phòng ban */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck size={17} className="text-orange-500" />
          <h3 className="font-semibold text-slate-900">Nhân viên theo phòng ban</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {PHONG_BAN.map(pb => {
            const count = employees.filter(e => e.phong_ban === pb && e.trang_thai === 'Đang làm việc').length;
            const shortName = pb.replace('Phòng ', '');
            return (
              <div key={pb} className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                <p className="text-2xl font-bold text-orange-500">{count}</p>
                <p className="text-xs text-slate-600 mt-1 leading-tight">{shortName}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Khách hàng mới nhất</h3>
        <div className="space-y-3">
          {recent.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 size={15} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.ten}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={11} /> {c.tinh_thanh}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={c.loai} />
                <Badge label={c.trang_thai} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
