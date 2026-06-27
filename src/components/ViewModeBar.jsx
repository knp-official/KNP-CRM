import { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

const MODES = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet',  label: 'Tablet',  icon: Tablet },
  { id: 'mobile',  label: 'Mobile',  icon: Smartphone },
];

export default function ViewModeBar({ mode, onChange }) {
  const [open, setOpen] = useState(false);
  const current = MODES.find(m => m.id === mode) || MODES[0];
  const Icon = current.icon;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Dropdown menu — hiện phía trên nút */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
          <div style={{
            position: 'absolute', bottom: 44, right: 0,
            background: '#fff', border: '0.5px solid #e5e7eb',
            borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            overflow: 'hidden', minWidth: 140,
          }}>
            {MODES.map(({ id, label, icon: MIcon }) => (
              <div
                key={id}
                onClick={() => { onChange(id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                  fontWeight: mode === id ? 600 : 400,
                  color: mode === id ? '#F15A22' : '#374151',
                  background: mode === id ? '#FEF2EC' : '#fff',
                }}
              >
                <MIcon size={14} />
                {label}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Nút chính — nhỏ gọn */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#1e1e2e', color: '#fff', border: 'none',
          borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
          fontSize: 12, fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <Icon size={14} />
        <span style={{ color: '#9ca3af', fontSize: 10 }}>▲</span>
      </button>
    </div>
  );
}
