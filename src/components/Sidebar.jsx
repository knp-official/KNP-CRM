import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { BarChart3, Building2, UserCheck, ClipboardList, TrendingUp, FileText, Wallet, BarChart2, LogOut, CalendarOff } from 'lucide-react';

const NAV_GROUPS = [
  [{ id: 'dashboard', label: 'Tổng quan', icon: BarChart3 }],
  [
    { id: 'employees',   label: 'Nhân sự',     icon: UserCheck },
    { id: 'tasks',       label: 'Giao việc',   icon: ClipboardList },
    { id: 'leave',       label: 'Xin nghỉ phép', icon: CalendarOff },
    { id: 'performance', label: 'Hiệu suất',   icon: TrendingUp },
  ],
  [
    { id: 'customers', label: 'Khách hàng', icon: Building2 },
    { id: 'quotes',    label: 'Báo giá',    icon: FileText },
    { id: 'debts',     label: 'Công nợ',    icon: Wallet },
  ],
  [{ id: 'reports', label: 'Báo cáo', icon: BarChart2 }],
];

const ROLE_LABEL  = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
const AVATAR_COLOR = { admin: '#534AB7', manager: '#1D9E75', employee: '#F15A22' };

export default function Sidebar({ activeTab, onTabChange, userDoc, simulatedWidth }) {
  const role     = userDoc?.vaiTro || 'employee';
  const name     = userDoc?.hoTen  || 'Người dùng';
  const avatarBg = AVATAR_COLOR[role] || '#F15A22';

  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Khi có simulatedWidth (từ ViewModeBar) dùng nó, ngược lại dùng window width thật
  const width     = simulatedWidth ?? winWidth;
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const collapsed = isTablet;

  if (isMobile) return null;

  return (
    <div
      className={collapsed ? 'knp-sidebar-collapsed' : ''}
      style={{
        width: collapsed ? '60px' : '220px',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '0.5px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo area */}
      <div
        onClick={() => window.location.reload()}
        title="Tải lại trang"
        style={{
          padding: collapsed ? '16px 12px' : '16px 16px 14px',
          borderBottom: '0.5px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          cursor: 'pointer',
          userSelect: 'none',
        }}>
        <div style={{
          width: '36px', height: '36px', backgroundColor: '#F15A22',
          borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700', letterSpacing: '-0.5px' }}>KNP</span>
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827', lineHeight: '1.3', whiteSpace: 'nowrap' }}>Kim Ngân Phát</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', lineHeight: '1.3', whiteSpace: 'nowrap' }}>Quản lý CRM</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && (
              <div style={{ borderTop: '0.5px solid #e5e7eb', margin: '6px 4px' }} />
            )}
            {group.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <div key={id} style={{ position: 'relative' }} className="knp-nav-item-wrap">
                  <button
                    onClick={() => onTabChange(id)}
                    title={collapsed ? label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? 0 : '9px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '10px 0' : '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? '500' : '400',
                      color: isActive ? '#F15A22' : '#374151',
                      backgroundColor: isActive ? '#FEF2EC' : 'transparent',
                      textAlign: 'left',
                      transition: 'background-color 0.12s, color 0.12s',
                      fontFamily: 'inherit',
                      marginBottom: '1px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#FEF2EC';
                        e.currentTarget.style.color = '#F15A22';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                    {!collapsed && label}
                  </button>

                  {/* Tooltip cho collapsed mode */}
                  {collapsed && (
                    <div className="knp-tooltip" style={{
                      position: 'absolute',
                      left: '68px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      opacity: 0,
                      transition: 'opacity 0.15s',
                      zIndex: 300,
                    }}>
                      {label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '0.5px solid #e5e7eb', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '10px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{
            width: '32px', height: '32px', backgroundColor: avatarBg,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{name.charAt(0)}</span>
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#111827', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', lineHeight: '1.3' }}>{ROLE_LABEL[role]}</p>
              </div>
              <button
                onClick={() => signOut(auth)}
                title="Đăng xuất"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', borderRadius: '6px', display: 'flex', flexShrink: 0, transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
