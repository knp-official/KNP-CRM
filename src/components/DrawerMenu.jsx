import { X, LayoutDashboard, Building2, Users, ClipboardList, TrendingUp, FileText, CreditCard, BarChart2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const TABS = [
  { id: 'dashboard',   label: 'Tổng quan',  icon: LayoutDashboard },
  { id: 'employees',   label: 'Nhân sự',    icon: Users },
  { id: 'tasks',       label: 'Giao việc',  icon: ClipboardList },
  { id: 'performance', label: 'Hiệu suất',  icon: TrendingUp },
  { id: 'customers',   label: 'Khách hàng', icon: Building2 },
  { id: 'quotes',      label: 'Báo giá',    icon: FileText },
  { id: 'debts',       label: 'Công nợ',    icon: CreditCard },
  { id: 'reports',     label: 'Báo cáo',    icon: BarChart2 },
];

const ROLE_LABEL   = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
const AVATAR_COLOR = { admin: '#534AB7', manager: '#1D9E75', employee: '#F15A22' };

export default function DrawerMenu({ isOpen, onClose, activeTab, onTabChange, userDoc }) {
  const role     = userDoc?.vaiTro || 'employee';
  const name     = userDoc?.hoTen  || 'Người dùng';
  const avatarBg = AVATAR_COLOR[role] || '#F15A22';

  const handleSelect = (id) => {
    onTabChange(id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 1000, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
        background: '#fff', zIndex: 1001,
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        fontFamily: "'Inter', system-ui, sans-serif",
        animation: 'knpSlideIn 0.2s ease',
      }}>
        {/* Drawer header */}
        <div style={{
          padding: '16px', borderBottom: '0.5px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              onClick={() => window.location.reload()}
              title="Tải lại trang"
              style={{
                width: 36, height: 36, background: '#F15A22', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                cursor: 'pointer', userSelect: 'none',
              }}>KNP</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Kim Ngân Phát</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Quản lý CRM</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, border: 'none', background: '#f3f4f6',
              borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <div
                key={id}
                onClick={() => handleSelect(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  cursor: 'pointer',
                  background: isActive ? '#FEF2EC' : 'transparent',
                  color: isActive ? '#F15A22' : '#374151',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'background 0.12s',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
                {label}
              </div>
            );
          })}
        </nav>

        {/* Footer: user info + logout */}
        <div style={{
          padding: '12px', borderTop: '0.5px solid #e5e7eb', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', backgroundColor: avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{name.charAt(0)}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{ROLE_LABEL[role]}</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: '#9CA3AF', padding: '6px 8px',
              borderRadius: 6, whiteSpace: 'nowrap',
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <style>{`
        @keyframes knpSlideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
