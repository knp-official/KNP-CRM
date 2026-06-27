import NotificationBell from './NotificationBell';

const ROLE_LABEL   = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
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
      padding: '0 16px',
      flexShrink: 0,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Left — module title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0 }}>
        <h2 style={{
          margin: 0, fontSize: '16px', fontWeight: '500', color: '#111827',
          lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {TAB_LABEL[activeTab] || 'KNP CRM'}
        </h2>
        {recordCount != null && (
          <span className="knp-header-count" style={{ fontSize: '13px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
            {recordCount} bản ghi
          </span>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Role badge — ẩn trên mobile nhỏ */}
        <span className="knp-role-badge" style={{
          fontSize: '12px', fontWeight: '500', padding: '3px 10px',
          borderRadius: '999px', backgroundColor: '#FEF2EC', color: '#F15A22',
          whiteSpace: 'nowrap',
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

        <div className="knp-header-divider" style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb' }} />

        {/* Avatar + name — text ẩn trên mobile */}
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
          <div className="knp-header-userinfo">
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#111827', lineHeight: '1.3', whiteSpace: 'nowrap' }}>
              {name}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', lineHeight: '1.3', whiteSpace: 'nowrap' }}>
              {userDoc?.phongBan || ''}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
