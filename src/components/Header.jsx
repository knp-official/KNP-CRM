import NotificationBell from './NotificationBell';

const ROLE_LABEL = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
const AVATAR_COLOR = { admin: '#534AB7', manager: '#1D9E75', employee: '#F15A22' };

const TAB_LABEL = {
  dashboard: 'Tổng quan',
  customers: 'Khách hàng',
  employees: 'Nhân sự',
  tasks:     'Giao việc',
  quotes:    'Báo giá',
  debts:     'Công nợ',
  reports:   'Báo cáo',
};

export default function Header({
  userDoc,
  activeTab = 'dashboard',
  recordCount,
  notifications = [],
  readIds = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkRead,
  onNavigate,
}) {
  const role     = userDoc?.vaiTro || 'employee';
  const name     = userDoc?.hoTen  || 'Người dùng';
  const avatarBg = AVATAR_COLOR[role] || '#F15A22';

  return (
    <header style={{
      height: '56px',
      backgroundColor: '#FFFFFF',
      borderBottom: '0.5px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Left — module title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#111827', lineHeight: 1 }}>
          {TAB_LABEL[activeTab] || 'KNP CRM'}
        </h2>
        {recordCount != null && (
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{recordCount} bản ghi</span>
        )}
      </div>

      {/* Right — role badge + bell + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          fontSize: '12px', fontWeight: '500', padding: '3px 10px',
          borderRadius: '999px', backgroundColor: '#FEF2EC', color: '#F15A22',
        }}>
          {ROLE_LABEL[role]}
        </span>

        <NotificationBell
          notifications={notifications}
          readIds={readIds}
          unreadCount={unreadCount}
          onMarkAllRead={onMarkAllRead}
          onMarkRead={onMarkRead}
          onNavigate={onNavigate}
        />

        <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px',
            backgroundColor: avatarBg,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>
              {name.charAt(0)}
            </span>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#111827', lineHeight: '1.3' }}>
              {name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', lineHeight: '1.3' }}>
              {userDoc?.phongBan || ''}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
