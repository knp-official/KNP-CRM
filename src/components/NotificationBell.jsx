import { useState, useRef, useEffect } from 'react';

const BELL_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CHECK_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TYPE_LABEL = {
  overdue: 'Quá hạn',
  deadline_soon: 'Sắp hết hạn',
  new_task: 'Mới',
  stale: 'Chưa làm',
  birthday: 'Sinh nhật',
};

export default function NotificationBell({ notifications, readIds, unreadCount, onMarkAllRead, onMarkRead, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function handleItemClick(notif) {
    onMarkRead(notif.id);
    onNavigate(notif.page);
    setOpen(false);
  }

  const [bellHover, setBellHover] = useState(false);
  const [markAllHover, setMarkAllHover] = useState(false);

  const isRead = id => readIds.includes(id);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setBellHover(true)}
        onMouseLeave={() => setBellHover(false)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: bellHover || open ? '#F5F5F5' : 'transparent',
          color: open ? '#F15A22' : '#666666',
          transition: 'all 0.15s',
        }}
        title="Thông báo"
      >
        {BELL_ICON}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '16px',
            height: '16px',
            backgroundColor: '#EF4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '700',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
            border: '1.5px solid #fff',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '340px',
          backgroundColor: '#fff',
          border: '1px solid #E8E8E8',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 1000,
          overflow: 'hidden',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 10px',
            borderBottom: '1px solid #F0F0F0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#414042' }}>Thông báo</span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: '600', color: '#F15A22',
                  backgroundColor: '#FFEDD5', padding: '1px 7px', borderRadius: '999px',
                }}>
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                onMouseEnter={() => setMarkAllHover(true)}
                onMouseLeave={() => setMarkAllHover(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: '500',
                  color: markAllHover ? '#F15A22' : '#888888',
                  padding: '3px 6px', borderRadius: '6px',
                  backgroundColor: markAllHover ? '#FFF5F0' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {CHECK_ICON} Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '32px 16px', textAlign: 'center',
                color: '#AAAAAA', fontSize: '13px',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔔</div>
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((n, idx) => {
                const read = isRead(n.id);
                return (
                  <NotifItem
                    key={n.id}
                    notif={n}
                    read={read}
                    isLast={idx === notifications.length - 1}
                    onClick={() => handleItemClick(n)}
                  />
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid #F0F0F0',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '11px', color: '#CCCCCC' }}>
                {notifications.length} thông báo · Dữ liệu realtime
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifItem({ notif, read, isLast, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '11px 16px',
        cursor: 'pointer',
        backgroundColor: hovered ? '#FAFAFA' : read ? '#fff' : notif.bgColor,
        borderBottom: isLast ? 'none' : '1px solid #F5F5F5',
        borderLeft: read ? '3px solid transparent' : `3px solid ${notif.color}`,
        transition: 'background-color 0.1s',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: notif.bgColor,
        border: `1px solid ${notif.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        flexShrink: 0,
        marginTop: '1px',
      }}>
        {notif.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: '600',
            color: notif.color,
            backgroundColor: notif.bgColor,
            border: `1px solid ${notif.borderColor}`,
            padding: '1px 6px',
            borderRadius: '999px',
            flexShrink: 0,
          }}>
            {TYPE_LABEL[notif.type] || notif.type}
          </span>
          {!read && (
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: '#F15A22', flexShrink: 0,
            }} />
          )}
        </div>
        <p style={{
          margin: '0 0 2px',
          fontSize: '13px',
          fontWeight: read ? '400' : '600',
          color: '#414042',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {notif.message}
        </p>
        {notif.sub && (
          <p style={{
            margin: 0,
            fontSize: '11px',
            color: '#888888',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {notif.sub}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '6px' }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  );
}
