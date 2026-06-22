import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import NotificationBell from './NotificationBell';

const ROLE_LABEL = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
const ROLE_COLOR = {
  admin:    { bg: '#FEE2E2', color: '#B91C1C' },
  manager:  { bg: '#FFEDD5', color: '#C2410C' },
  employee: { bg: '#F1F5F9', color: '#475569' },
};

const ICON_SHIELD = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ICON_USERS  = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ICON_USER   = <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ICON_LOGOUT = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const ROLE_ICON = { admin: ICON_SHIELD, manager: ICON_USERS, employee: ICON_USER };

export default function Header({
  userDoc,
  notifications = [],
  readIds = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkRead,
  onNavigate,
}) {
  const role = userDoc?.vaiTro || 'employee';
  const rc = ROLE_COLOR[role] || ROLE_COLOR.employee;

  return (
    <header style={{
      height: '56px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #E8E8E8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 20px',
      flexShrink: 0,
      gap: '10px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Role badge */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '12px', fontWeight: '600', padding: '3px 10px',
        borderRadius: '999px', backgroundColor: rc.bg, color: rc.color,
      }}>
        {ROLE_ICON[role]}{ROLE_LABEL[role]}
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

      <div style={{ width: '1px', height: '24px', backgroundColor: '#E8E8E8' }} />

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px', height: '32px', backgroundColor: '#F15A22',
          borderRadius: '50%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>
            {(userDoc?.hoTen || '?').charAt(0)}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#414042', lineHeight: '1.2' }}>
            {userDoc?.hoTen || 'Người dùng'}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#AAAAAA', lineHeight: '1.2' }}>
            {userDoc?.phongBan || ''}
          </p>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#E8E8E8' }} />

      {/* Logout */}
      <button
        onClick={() => signOut(auth)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: '500', color: '#888888',
          padding: '6px 8px', borderRadius: '8px',
        }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888888'; }}
      >
        {ICON_LOGOUT} Đăng xuất
      </button>
    </header>
  );
}
