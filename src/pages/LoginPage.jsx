import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  wrap: {
    width: '100%',
    maxWidth: '360px',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    height: '80px',
    width: 'auto',
    display: 'block',
    margin: '0 auto 16px',
  },
  logoFallback: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    backgroundColor: '#F15A22',
    borderRadius: '20px',
    marginBottom: '16px',
    boxShadow: '0 4px 14px rgba(241,90,34,0.35)',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#414042',
    margin: '0 0 6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888888',
    margin: '0',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #E8E8E8',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    padding: '28px 24px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555555',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    border: '1px solid #CCCCCC',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    color: '#414042',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  pwWrap: {
    position: 'relative',
  },
  pwInput: {
    width: '100%',
    border: '1px solid #CCCCCC',
    borderRadius: '8px',
    padding: '10px 40px 10px 12px',
    fontSize: '14px',
    color: '#414042',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#AAAAAA',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    fontSize: '13px',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#F15A22',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.15s',
    marginTop: '4px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#CCCCCC',
    marginTop: '24px',
  },
};

const EYE_OPEN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EYE_OFF = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const SPINNER = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity="0.3"/>
    <path d="M12 2v4" style={{transformOrigin:'center', animation:'spin 0.8s linear infinite'}}/>
  </svg>
);
const LOGIN_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

const ERROR_MAP = {
  'auth/user-not-found': 'Email không tồn tại trong hệ thống.',
  'auth/wrong-password': 'Mật khẩu không đúng.',
  'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
  'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(ERROR_MAP[err.code] || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.knp-spin{animation:spin 0.7s linear infinite}.knp-input:focus{border-color:#F15A22!important;box-shadow:0 0 0 3px rgba(241,90,34,0.15)}.knp-btn:hover{background-color:#D14E1D!important}.knp-btn:disabled{opacity:0.6;cursor:not-allowed}`}</style>

      <div style={S.wrap}>
        {/* Brand */}
        <div style={S.brand}>
          {!logoError ? (
            <img
              src="/logo.png"
              alt="Kim Ngân Phát"
              style={S.logo}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div style={S.logoFallback}>
              <span style={S.logoText}>KNP</span>
            </div>
          )}
          <h1 style={S.title}>Kim Ngân Phát CRM</h1>
          <p style={S.subtitle}>Đăng nhập để tiếp tục</p>
        </div>

        {/* Card */}
        <div style={S.card}>
          <form onSubmit={handleSubmit}>
            <div style={S.field}>
              <label style={S.label}>Email</label>
              <input
                className="knp-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={S.input}
              />
            </div>

            <div style={{ ...S.field, marginBottom: error ? '16px' : '20px' }}>
              <label style={S.label}>Mật khẩu</label>
              <div style={S.pwWrap}>
                <input
                  className="knp-input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={S.pwInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={S.eyeBtn}
                >
                  {showPwd ? EYE_OPEN : EYE_OFF}
                </button>
              </div>
            </div>

            {error && <div style={S.error}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="knp-btn"
              style={S.submitBtn}
            >
              {loading ? (
                <svg className="knp-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity="0.25"/>
                  <path d="M3 12a9 9 0 0 1 9-9"/>
                </svg>
              ) : LOGIN_ICON}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p style={S.footer}>© 2024 Kim Ngân Phát. All rights reserved.</p>
      </div>
    </div>
  );
}
