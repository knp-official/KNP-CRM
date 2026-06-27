import { Monitor, Tablet, Smartphone } from 'lucide-react';

const BUTTONS = [
  { id: 'desktop', Icon: Monitor,    label: 'Desktop (full width)' },
  { id: 'tablet',  Icon: Tablet,     label: 'Tablet (768px)'       },
  { id: 'mobile',  Icon: Smartphone, label: 'Mobile (375px)'       },
];

export default function ViewModeBar({ mode, onChange }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '4px',
      background: '#1e1e2e', borderRadius: '10px', padding: '6px 8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <span style={{ color: '#6b7280', fontSize: '10px', fontWeight: '500', marginRight: '4px', paddingLeft: '2px', whiteSpace: 'nowrap' }}>
        Chế độ xem
      </span>
      {BUTTONS.map(({ id, Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={label}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '7px',
            border: 'none', cursor: 'pointer',
            background: mode === id ? '#F15A22' : 'transparent',
            color: mode === id ? '#fff' : '#9ca3af',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (mode !== id) e.currentTarget.style.background = '#2d2d40'; }}
          onMouseLeave={e => { if (mode !== id) e.currentTarget.style.background = 'transparent'; }}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
