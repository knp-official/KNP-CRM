import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import NotificationBell from './NotificationBell';

const ROLE_LABEL = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
const ROLE_COLOR = {
  admin:    { bg: '#FEE2E2', color: '#B91C1C' },
  manager:  { bg: '#FFEDD5', color: '#C2410C' },
  employee: { bg: '#F0FDF4', color: '#166534' },
};

const TAB_LABEL = {
  dashboard: 'Tổng quan',
  customers: 'Khách hàng',
  employees: 'Nhân sự',
  tasks:     'Giao việc',
  quotes:    'Báo giá',
  debts:     'Công nợ',
  reports:   'Báo cáo',
};

const ICON_LOGOUT = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Header({
  userDoc,
  activeTab = 'dashboard',
  notifications = [],
  readIds = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkRead,
  onNavigate,
}) {
  const role = userDoc?.vaiTro || 'employee';
  const rc   = ROLE_COLOR[role] || ROLE_COLOR.employee;
  const name = userDoc?.hoTen || 'Người dùng';

  return (
    <header style={{
      height: '60px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E8ECF0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Left — page title */}
      <div>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1A1D23', lineHeight: 1 }}>
          {TAB_LABEL[activeTab] || 'KNP CRM'}
        </h2>
      </div>

      {/* Right — controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Role badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          fontSize: '12px', fontWeight: '600', padding: '4px 12px',
          borderRadius: '999px', backgroundColor: rc.bg, color: rc.color,
          letterSpacing: '0.01em',
        }}>
          {ROLE_LABEL[role]}
        </span>

        {/* Notification bell */}
        <NotificationBell
          notifications={notifications}
          readIds={readIds}
          unreadCount={unreadCount}
          onMarkAllRead={onMarkAllRead}
          onMarkRead={onMarkRead}
          onNavigate={onNavigate}
        />

        <div style={{ width: '1px', height: '24px', backgroundColor: '#E8ECF0' }} />

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px',
            backgroundColor: '#E8500A',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>
              {name.charAt(0)}
            </span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1A1D23', lineHeight: '1.3' }}>
              {name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', lineHeight: '1.3' }}>
              {userDoc?.phongBan || ''}
            </p>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#E8ECF0' }} />

        {/* Logout */}
        <button
          onClick={() => signOut(auth)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '500', color: '#9CA3AF',
            padding: '6px 8px', borderRadius: '8px', transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
        >
          {ICON_LOGOUT} Đăng xuất
        </button>
      </div>
    </header>
  );
}
