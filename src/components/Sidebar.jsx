import { BarChart3, Building2, Users, UserCheck, ClipboardList, FileText, Wallet, TrendingUp } from 'lucide-react';

const navGroups = [
  {
    label: 'TỔNG QUAN',
    items: [{ id: 'dashboard', label: 'Tổng quan', icon: BarChart3 }],
  },
  {
    label: 'QUAN HỆ KHÁCH HÀNG',
    items: [
      { id: 'customers', label: 'Khách hàng', icon: Building2 },
      { id: 'contacts', label: 'Liên hệ', icon: Users },
    ],
  },
  {
    label: 'VẬN HÀNH',
    items: [
      { id: 'employees', label: 'Nhân viên', icon: UserCheck },
      { id: 'tasks', label: 'Giao việc', icon: ClipboardList },
    ],
  },
  {
    label: 'KINH DOANH',
    items: [
      { id: 'quotes', label: 'Báo giá', icon: FileText },
      { id: 'debts', label: 'Công nợ', icon: Wallet },
    ],
  },
  {
    label: 'PHÂN TÍCH',
    items: [{ id: 'reports', label: 'Báo cáo', icon: TrendingUp }],
  },
];

// Items visible to 'employee' role
const EMPLOYEE_ITEM_IDS = new Set(['dashboard', 'customers', 'tasks']);

export default function Sidebar({ activeTab, onTabChange, role = 'admin' }) {
  const visibleGroups = navGroups
    .map(g => ({
      ...g,
      items: role === 'employee' ? g.items.filter(i => EMPLOYEE_ITEM_IDS.has(i.id)) : g.items,
    }))
    .filter(g => g.items.length > 0);
  return (
    <div
      className="w-56 min-h-screen flex flex-col flex-shrink-0 border-r"
      style={{ backgroundColor: '#F8F8F8', borderColor: '#E8E8E8' }}
    >
      {/* Logo */}
      <div
        className="px-4 py-5 border-b flex flex-col items-center"
        style={{ borderColor: '#E8E8E8' }}
      >
        <img src="/logo.png" alt="Kim Ngân Phát" style={{ height: '48px', width: 'auto' }} />
        <span className="text-xs mt-2 tracking-wide" style={{ color: '#999999' }}>
          Quản lý CRM
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {visibleGroups.map(group => (
          <div key={group.label}>
            <p
              className="text-xs font-semibold tracking-wider px-2 mb-1"
              style={{ color: '#999999' }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all"
                    style={
                      isActive
                        ? { backgroundColor: '#F15A22', color: '#ffffff' }
                        : { color: '#414042' }
                    }
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(241,90,34,0.08)';
                        e.currentTarget.style.color = '#F15A22';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = '#414042';
                      }
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t" style={{ borderColor: '#E8E8E8' }}>
        <div className="text-xs text-center" style={{ color: '#CCCCCC' }}>v1.0.0</div>
      </div>
    </div>
  );
}
