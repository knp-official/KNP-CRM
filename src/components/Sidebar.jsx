import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { BarChart3, Building2, UserCheck, ClipboardList, FileText, Wallet, TrendingUp, LogOut } from 'lucide-react';

const NAV_GROUPS = [
  [{ id: 'dashboard', label: 'Tổng quan',  icon: BarChart3 }],
  [{ id: 'customers', label: 'Khách hàng', icon: Building2 }],
  [
    { id: 'employees', label: 'Nhân sự',   icon: UserCheck },
    { id: 'tasks',     label: 'Giao việc', icon: ClipboardList },
  ],
  [
    { id: 'quotes', label: 'Báo giá', icon: FileText },
    { id: 'debts',  label: 'Công nợ', icon: Wallet },
  ],
  [{ id: 'reports', label: 'Báo cáo', icon: TrendingUp }],
];

const ROLE_LABEL = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
const AVATAR_COLOR = { admin: '#534AB7', manager: '#1D9E75', employee: '#F15A22' };

export default function Sidebar({ activeTab, onTabChange, userDoc }) {
  const role = userDoc?.vaiTro || 'employee';
  const name = userDoc?.hoTen || 'Người dùng';
  const avatarBg = AVATAR_COLOR[role] || '#F15A22';

  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      borderRight: '0.5px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Logo area */}
      <div style={{ padding: '16px 16px 14px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', backgroundColor: '#F15A22',
          borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700', letterSpacing: '-0.5px' }}>KNP</span>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>Kim Ngân Phát</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', lineHeight: '1.3' }}>Quản lý CRM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && (
              <div style={{ borderTop: '0.5px solid #e5e7eb', margin: '6px 4px' }} />
            )}
            {group.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 10px',
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
                  }}
                  onMouseEnter={e => {
                    if (!isActive) { e.currentTarget.style.backgroundColor = '#FEF2EC'; e.currentTarget.style.color = '#F15A22'; }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — user info + logout */}
      <div style={{ padding: '12px 12px', borderTop: '0.5px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: avatarBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{name.charAt(0)}</span>
          </div>
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
        </div>
      </div>
    </div>
  );
}
