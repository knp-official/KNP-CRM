import { BarChart3, Building2, UserCheck, ClipboardList, FileText, Wallet, TrendingUp } from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'TỔNG QUAN',
    items: [{ id: 'dashboard', label: 'Tổng quan', icon: BarChart3 }],
  },
  {
    label: 'QUAN HỆ KHÁCH HÀNG',
    items: [{ id: 'customers', label: 'Khách hàng', icon: Building2 }],
  },
  {
    label: 'VẬN HÀNH',
    items: [
      { id: 'employees', label: 'Nhân sự',  icon: UserCheck },
      { id: 'tasks',     label: 'Giao việc', icon: ClipboardList },
    ],
  },
  {
    label: 'KINH DOANH',
    items: [
      { id: 'quotes', label: 'Báo giá', icon: FileText },
      { id: 'debts',  label: 'Công nợ', icon: Wallet },
    ],
  },
  {
    label: 'PHÂN TÍCH',
    items: [{ id: 'reports', label: 'Báo cáo', icon: TrendingUp }],
  },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      backgroundColor: '#1A1D23',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #2D3139',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img src="/logo.png" alt="Kim Ngân Phát" style={{ height: '44px', width: 'auto' }} />
        <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', letterSpacing: '0.06em' }}>
          Quản lý CRM
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} style={{ marginBottom: '2px' }}>
            <p style={{
              fontSize: '11px', fontWeight: '600', color: '#6B7280',
              padding: '14px 16px 6px', letterSpacing: '0.08em',
              textTransform: 'uppercase', margin: 0,
            }}>
              {group.label}
            </p>
            {group.items.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  style={{
                    width: 'calc(100% - 16px)',
                    margin: '1px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? '#FFFFFF' : '#A0A8B8',
                    backgroundColor: isActive ? '#E8500A' : 'transparent',
                    textAlign: 'left',
                    transition: 'background-color 0.15s, color 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#2D3139';
                    if (!isActive) e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    if (!isActive) e.currentTarget.style.color = '#A0A8B8';
                  }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #2D3139' }}>
        <p style={{ fontSize: '11px', color: '#4B5563', textAlign: 'center', margin: 0 }}>v1.0.0</p>
      </div>
    </div>
  );
}
