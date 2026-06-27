import { LayoutDashboard, Building2, Users, ClipboardList, BarChart2 } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Tổng quan',  Icon: LayoutDashboard },
  { id: 'customers', label: 'Khách hàng', Icon: Building2 },
  { id: 'employees', label: 'Nhân sự',    Icon: Users },
  { id: 'tasks',     label: 'Giao việc',  Icon: ClipboardList },
  { id: 'reports',   label: 'Báo cáo',    Icon: BarChart2 },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      display: 'flex',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      height: '60px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '6px 4px',
              color: isActive ? '#F15A22' : '#9ca3af',
              transition: 'color 0.12s',
              fontFamily: 'inherit',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.7}
              style={{ flexShrink: 0 }}
            />
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? '600' : '400',
              lineHeight: 1,
              letterSpacing: '0.01em',
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
