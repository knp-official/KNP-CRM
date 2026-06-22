import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/* ── Design tokens ─────────────────────────────────────────── */
const C = {
  accent:       '#F15A22',
  accentHover:  '#D14E1D',
  accentShadow: 'rgba(241,90,34,0.3)',
  accentGlow:   'rgba(241,90,34,0.1)',
  textPrimary:  '#1A1A1A',
  textSub:      '#888888',
  textLabel:    '#555555',
  inputBorder:  '#E8E8E8',
  inputText:    '#1A1A1A',
  placeholder:  '#BBBBBB',
  white:        '#FFFFFF',
  errorBg:      '#FEF2F2',
  errorBorder:  '#FECACA',
  errorText:    '#DC2626',
  successBg:    '#F0FDF4',
  successBorder:'#BBF7D0',
  successText:  '#166534',
};

/* ── Inline styles ─────────────────────────────────────────── */
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF5F0 0%, #FFF0E8 50%, #FFE8D6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  wrap: { width: '100%', maxWidth: '420px' },

  brand: { textAlign: 'center', marginBottom: '32px' },
  logoImg: { display: 'block', margin: '0 auto 20px', width: '160px', height: 'auto' },
  logoFallback: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '64px', height: '64px', backgroundColor: C.accent,
    borderRadius: '18px', marginBottom: '20px',
    boxShadow: '0 8px 24px rgba(241,90,34,0.35)',
  },
  logoText: { color: '#fff', fontSize: '20px', fontWeight: '800' },
  title: {
    fontSize: '28px', fontWeight: '700', color: C.textPrimary,
    margin: '0 0 8px', letterSpacing: '-0.5px', lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '14px', color: C.textSub,
    margin: 0, letterSpacing: '0.5px',
  },

  card: {
    backgroundColor: C.white,
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(241,90,34,0.12)',
    padding: '40px',
  },
  sectionTitle: {
    fontSize: '20px', fontWeight: '700', color: C.textPrimary,
    margin: '0 0 28px', letterSpacing: '-0.3px',
  },
  field: { marginBottom: '20px' },
  label: {
    display: 'block',
    fontSize: '12px', fontWeight: '600',
    color: C.textLabel,
    marginBottom: '8px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },

  forgotLink: {
    display: 'block', textAlign: 'right',
    fontSize: '13px', fontWeight: '500',
    color: C.accent, cursor: 'pointer',
    marginTop: '8px', background: 'none',
    border: 'none', padding: 0,
    fontFamily: 'inherit',
  },

  divider: {
    display: 'flex', alignItems: 'center', gap: '14px',
    margin: '24px 0',
  },
  divLine: { flex: 1, height: '1px', backgroundColor: C.inputBorder },
  divText: { fontSize: '12px', color: C.textSub, letterSpacing: '0.5px' },

  switchLink: {
    textAlign: 'center', fontSize: '14px',
    color: C.textSub, marginTop: '20px',
  },
  switchBtn: {
    background: 'none', border: 'none',
    cursor: 'pointer', color: C.accent,
    fontWeight: '600', fontSize: '14px',
    padding: 0, fontFamily: 'inherit',
  },

  error: {
    backgroundColor: C.errorBg, border: `1px solid ${C.errorBorder}`,
    color: C.errorText, fontSize: '13px', lineHeight: '1.5',
    padding: '12px 14px', borderRadius: '10px', marginBottom: '20px',
  },
  success: {
    backgroundColor: C.successBg, border: `1px solid ${C.successBorder}`,
    color: C.successText, fontSize: '13px', lineHeight: '1.5',
    padding: '12px 14px', borderRadius: '10px', marginBottom: '20px',
  },

  footer: {
    textAlign: 'center', fontSize: '12px',
    color: C.textSub, marginTop: '28px',
    opacity: 0.7,
  },
};

/* ── Auth errors ───────────────────────────────────────────── */
const AUTH_ERR = {
  'auth/user-not-found':      'Email không tồn tại trong hệ thống.',
  'auth/wrong-password':      'Mật khẩu không đúng.',
  'auth/invalid-email':       'Địa chỉ email không hợp lệ.',
  'auth/too-many-requests':   'Quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/invalid-credential':  'Email hoặc mật khẩu không đúng.',
  'auth/email-already-in-use':'Email này đã được sử dụng.',
  'auth/weak-password':       'Mật khẩu tối thiểu 6 ký tự.',
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng thử lại.',
};
const errMsg = code => AUTH_ERR[code] || 'Đã có lỗi xảy ra. Vui lòng thử lại.';

/* ── Icons ─────────────────────────────────────────────────── */
const EYE     = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EYE_OFF = <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const ICO_LOGIN  = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const ICO_SEND   = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const ICO_SIGNUP = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const Spinner = () => <svg className="knp-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity="0.2"/><path d="M3 12a9 9 0 0 1 9-9"/></svg>;

/* ── Form controls ─────────────────────────────────────────── */
function LightInput({ type = 'text', value, onChange, placeholder, required, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required} autoFocus={autoFocus}
      style={{
        width: '100%', boxSizing: 'border-box',
        border: `1.5px solid ${focused ? C.accent : C.inputBorder}`,
        borderRadius: '10px',
        padding: '14px 16px',
        fontSize: '15px', color: C.inputText,
        backgroundColor: C.white,
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: focused ? `0 0 0 3px ${C.accentGlow}` : 'none',
        fontFamily: 'inherit',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function LightPasswordInput({ value, onChange, placeholder = '••••••••', required }) {
  const [show, setShow]       = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', boxSizing: 'border-box',
          border: `1.5px solid ${focused ? C.accent : C.inputBorder}`,
          borderRadius: '10px',
          padding: '14px 48px 14px 16px',
          fontSize: '15px', color: C.inputText,
          backgroundColor: C.white,
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: focused ? `0 0 0 3px ${C.accentGlow}` : 'none',
          fontFamily: 'inherit',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        type="button" onClick={() => setShow(v => !v)}
        style={{
          position: 'absolute', right: '14px', top: '50%',
          transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textSub, padding: '2px',
          display: 'flex', alignItems: 'center',
        }}
      >
        {show ? EYE : EYE_OFF}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function AccentBtn({ loading, disabled, onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      disabled={loading || disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        backgroundColor: hovered && !loading ? C.accentHover : C.accent,
        color: C.white,
        border: 'none', borderRadius: '10px',
        padding: '14px',
        fontSize: '15px', fontWeight: '600', letterSpacing: '0.5px',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        opacity: loading ? 0.8 : 1,
        boxShadow: hovered && !loading
          ? '0 10px 28px rgba(241,90,34,0.45)'
          : '0 8px 20px rgba(241,90,34,0.3)',
        transition: 'all 0.2s',
        marginTop: '4px',
        fontFamily: 'inherit',
      }}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        backgroundColor: 'transparent',
        color: hovered ? C.accent : C.textLabel,
        border: `1.5px solid ${hovered ? C.accent : C.inputBorder}`,
        borderRadius: '10px',
        padding: '13px',
        fontSize: '14px', fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

/* ── Brand ─────────────────────────────────────────────────── */
function Brand() {
  const [logoErr, setLogoErr] = useState(false);
  return (
    <div style={S.brand}>
      {!logoErr
        ? <img src="/logo.png" alt="Kim Ngân Phát" style={S.logoImg} onError={() => setLogoErr(true)} />
        : <div style={S.logoFallback}><span style={S.logoText}>KNP</span></div>
      }
      <h1 style={S.title}>Kim Ngân Phát CRM</h1>
      <p style={S.subtitle}>Quản lý quan hệ khách hàng</p>
    </div>
  );
}

/* ══ VIEW 1: Đăng nhập ════════════════════════════════════════ */
function LoginView({ onForgot, onRegister }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Vui lòng nhập email.');
    if (!password)     return setError('Vui lòng nhập mật khẩu.');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(errMsg(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.card}>
      <p style={S.sectionTitle}>Đăng nhập</p>
      <form onSubmit={handleSubmit}>
        <Field label="Email">
          <LightInput type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required autoFocus />
        </Field>
        <Field label="Mật khẩu">
          <LightPasswordInput value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="button" style={S.forgotLink} onClick={onForgot}>Quên mật khẩu?</button>
        </Field>
        {error && <div style={S.error}>{error}</div>}
        <AccentBtn loading={loading}>{ICO_LOGIN} Đăng nhập</AccentBtn>
      </form>
      <div style={S.divider}>
        <span style={S.divLine} />
        <span style={S.divText}>hoặc</span>
        <span style={S.divLine} />
      </div>
      <GhostBtn onClick={onRegister}>Tạo tài khoản mới</GhostBtn>
    </div>
  );
}

/* ══ VIEW 2: Quên mật khẩu ════════════════════════════════════ */
function ForgotView({ onBack }) {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) return setError('Vui lòng nhập email.');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('Đã gửi link đặt lại mật khẩu về email của bạn. Kiểm tra cả thư mục Spam.');
    } catch (err) {
      setError(errMsg(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.card}>
      <p style={S.sectionTitle}>Quên mật khẩu</p>
      <p style={{ fontSize: '14px', color: C.textSub, marginBottom: '24px', marginTop: '-20px', lineHeight: '1.6' }}>
        Nhập email đã đăng ký — chúng tôi sẽ gửi link đặt lại.
      </p>
      <form onSubmit={handleSubmit}>
        <Field label="Email">
          <LightInput type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required autoFocus />
        </Field>
        {error   && <div style={S.error}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}
        {!success && <AccentBtn loading={loading}>{ICO_SEND} Gửi link đặt lại</AccentBtn>}
        {success  && <AccentBtn onClick={onBack}>← Quay lại đăng nhập</AccentBtn>}
      </form>
      {!success && (
        <p style={S.switchLink}>
          <button type="button" style={S.switchBtn} onClick={onBack}>← Quay lại đăng nhập</button>
        </p>
      )}
    </div>
  );
}

/* ══ VIEW 3: Đăng ký ═════════════════════════════════════════ */
function RegisterView({ onBack }) {
  const [form, setForm]       = useState({ hoTen: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  function validate() {
    if (!form.hoTen.trim()) return 'Vui lòng nhập họ tên.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Email không đúng định dạng.';
    if (form.password.length < 6)       return 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.password !== form.confirm) return 'Mật khẩu xác nhận không khớp.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: form.email.trim(),
        hoTen: form.hoTen.trim(),
        vaiTro: 'employee',
        phongBan: '',
      });
      await signOut(auth);
      setSuccess('Tài khoản đã được tạo thành công! Vui lòng đăng nhập để tiếp tục.');
      setForm({ hoTen: '', email: '', password: '', confirm: '' });
    } catch (err) {
      setError(errMsg(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.card}>
      <p style={S.sectionTitle}>Tạo tài khoản mới</p>
      <p style={{ fontSize: '13px', color: C.textSub, marginTop: '-20px', marginBottom: '24px' }}>
        Mặc định vai trò Nhân viên · Admin có thể nâng cấp sau
      </p>
      <form onSubmit={handleSubmit}>
        <Field label="Họ và tên">
          <LightInput value={form.hoTen} onChange={set('hoTen')} placeholder="Nguyễn Văn A" required autoFocus />
        </Field>
        <Field label="Email">
          <LightInput type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
        </Field>
        <Field label="Mật khẩu">
          <LightPasswordInput value={form.password} onChange={set('password')} placeholder="Tối thiểu 6 ký tự" required />
        </Field>
        <Field label="Xác nhận mật khẩu">
          <LightPasswordInput value={form.confirm} onChange={set('confirm')} placeholder="Nhập lại mật khẩu" required />
        </Field>
        {error   && <div style={S.error}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}
        {!success
          ? <AccentBtn loading={loading}>{ICO_SIGNUP} Tạo tài khoản</AccentBtn>
          : <AccentBtn onClick={onBack}>← Quay lại đăng nhập</AccentBtn>
        }
      </form>
      {!success && (
        <p style={S.switchLink}>
          Đã có tài khoản?{' '}
          <button type="button" style={S.switchBtn} onClick={onBack}>Đăng nhập</button>
        </p>
      )}
    </div>
  );
}

/* ══ MAIN ════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [view, setView] = useState('login');

  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .knp-spin { animation: spin 0.7s linear infinite; display: inline-block; }
        input::placeholder { color: #BBBBBB !important; }
      `}</style>
      <div style={S.wrap}>
        <Brand />
        {view === 'login'    && <LoginView    onForgot={() => setView('forgot')}   onRegister={() => setView('register')} />}
        {view === 'forgot'   && <ForgotView   onBack={() => setView('login')} />}
        {view === 'register' && <RegisterView onBack={() => setView('login')} />}
        <p style={S.footer}>© 2024 Kim Ngân Phát · All rights reserved.</p>
      </div>
    </div>
  );
}
