import { useState, useRef, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/* ── Inline style objects ─────────────────────────────────── */
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
  wrap: { width: '100%', maxWidth: '380px' },
  brand: { textAlign: 'center', marginBottom: '28px' },
  logo: { height: '80px', width: 'auto', display: 'block', margin: '0 auto 14px' },
  logoFallback: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '72px', height: '72px', backgroundColor: '#F15A22',
    borderRadius: '20px', marginBottom: '14px',
    boxShadow: '0 4px 14px rgba(241,90,34,0.35)',
  },
  logoText: { color: '#fff', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#414042', margin: '0 0 5px' },
  subtitle: { fontSize: '13px', color: '#888', margin: 0 },
  card: {
    backgroundColor: '#fff', borderRadius: '16px',
    border: '1px solid #E8E8E8',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: '28px 24px',
  },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#414042', margin: '0 0 20px' },
  field: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '5px' },
  input: {
    width: '100%', border: '1px solid #CCCCCC', borderRadius: '8px',
    padding: '10px 12px', fontSize: '14px', color: '#414042',
    backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box',
  },
  pwWrap: { position: 'relative' },
  pwInput: {
    width: '100%', border: '1px solid #CCCCCC', borderRadius: '8px',
    padding: '10px 40px 10px 12px', fontSize: '14px', color: '#414042',
    backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#AAAAAA',
    padding: '2px', display: 'flex', alignItems: 'center',
  },
  forgotLink: {
    display: 'block', textAlign: 'right', fontSize: '12px',
    color: '#F15A22', cursor: 'pointer', marginTop: '5px',
    background: 'none', border: 'none', padding: 0, textDecoration: 'underline',
  },
  error: {
    backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
    fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px',
  },
  success: {
    backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534',
    fontSize: '13px', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px',
  },
  primaryBtn: {
    width: '100%', backgroundColor: '#F15A22', color: '#fff',
    border: 'none', borderRadius: '8px', padding: '11px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', marginTop: '4px',
  },
  secondaryBtn: {
    width: '100%', backgroundColor: 'transparent', color: '#414042',
    border: '1px solid #CCCCCC', borderRadius: '8px', padding: '10px',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '10px',
    margin: '18px 0', color: '#CCCCCC', fontSize: '12px',
  },
  divLine: { flex: 1, height: '1px', backgroundColor: '#E8E8E8' },
  switchLink: {
    display: 'block', textAlign: 'center', fontSize: '13px',
    color: '#888', marginTop: '16px',
  },
  switchBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#F15A22', fontWeight: '600', fontSize: '13px',
    textDecoration: 'underline', padding: 0,
  },
  footer: { textAlign: 'center', fontSize: '11px', color: '#CCC', marginTop: '20px' },
};

/* ── SVG icons ─────────────────────────────────────────────── */
const EYE = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EYE_OFF = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const LOGIN_ICON = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="21" y1="12" x2="3" y2="12"/></svg>;
const SEND_ICON = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const USER_PLUS = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const Spinner = () => (
  <svg className="knp-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity="0.25"/>
    <path d="M3 12a9 9 0 0 1 9-9"/>
  </svg>
);

/* ── Error messages ─────────────────────────────────────────── */
const AUTH_ERRORS = {
  'auth/user-not-found': 'Email không tồn tại trong hệ thống.',
  'auth/wrong-password': 'Mật khẩu không đúng.',
  'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
  'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/email-already-in-use': 'Email này đã được sử dụng.',
  'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự).',
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng thử lại.',
};
const errMsg = code => AUTH_ERRORS[code] || 'Đã có lỗi xảy ra. Vui lòng thử lại.';

/* ── Input component ────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ type = 'text', value, onChange, placeholder, required, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      style={{ ...S.input, borderColor: focused ? '#F15A22' : '#CCCCCC', boxShadow: focused ? '0 0 0 3px rgba(241,90,34,0.12)' : 'none' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function PasswordInput({ value, onChange, placeholder = '••••••••', required }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.pwWrap}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ ...S.pwInput, borderColor: focused ? '#F15A22' : '#CCCCCC', boxShadow: focused ? '0 0 0 3px rgba(241,90,34,0.12)' : 'none' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button type="button" onClick={() => setShow(v => !v)} style={S.eyeBtn}>
        {show ? EYE : EYE_OFF}
      </button>
    </div>
  );
}

function PrimaryBtn({ loading, children, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{ ...S.primaryBtn, backgroundColor: hovered && !loading ? '#D14E1D' : '#F15A22', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

/* ── Brand logo ─────────────────────────────────────────────── */
function Brand() {
  const [logoErr, setLogoErr] = useState(false);
  const titleRef = useRef(null);
  const [logoWidth, setLogoWidth] = useState(null);

  useEffect(() => {
    if (titleRef.current) {
      setLogoWidth(titleRef.current.offsetWidth);
    }
  }, []);

  return (
    <div style={S.brand}>
      {!logoErr ? (
        <img
          src="/logo.png"
          alt="Kim Ngân Phát"
          style={{
            display: 'block',
            margin: '0 auto 14px',
            width: logoWidth ? `${logoWidth}px` : '200px',
            height: 'auto',
          }}
          onError={() => setLogoErr(true)}
        />
      ) : (
        <div style={S.logoFallback}><span style={S.logoText}>KNP</span></div>
      )}
      <h1 ref={titleRef} style={S.title}>Kim Ngân Phát CRM</h1>
      <p style={S.subtitle}>Quản lý quan hệ khách hàng</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIEW 1: Đăng nhập
══════════════════════════════════════════════════════════════ */
function LoginView({ onForgot, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Vui lòng nhập email.');
    if (!password) return setError('Vui lòng nhập mật khẩu.');
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
          <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus />
        </Field>
        <Field label="Mật khẩu">
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="button" style={S.forgotLink} onClick={onForgot}>Quên mật khẩu?</button>
        </Field>
        {error && <div style={S.error}>{error}</div>}
        <PrimaryBtn loading={loading}>{LOGIN_ICON} Đăng nhập</PrimaryBtn>
      </form>
      <div style={S.divider}><span style={S.divLine} /><span>hoặc</span><span style={S.divLine} /></div>
      <button type="button" style={S.secondaryBtn} onClick={onRegister}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5F5F5'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
        Tạo tài khoản mới
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIEW 2: Quên mật khẩu
══════════════════════════════════════════════════════════════ */
function ForgotView({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) return setError('Vui lòng nhập email.');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess('Đã gửi link đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).');
    } catch (err) {
      setError(errMsg(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.card}>
      <p style={S.sectionTitle}>Quên mật khẩu</p>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px', marginTop: '-12px' }}>
        Nhập email đã đăng ký — chúng tôi sẽ gửi link đặt lại mật khẩu.
      </p>
      <form onSubmit={handleSubmit}>
        <Field label="Email">
          <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus />
        </Field>
        {error && <div style={S.error}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}
        {!success && <PrimaryBtn loading={loading}>{SEND_ICON} Gửi link đặt lại</PrimaryBtn>}
      </form>
      <p style={S.switchLink}>
        <button type="button" style={S.switchBtn} onClick={onBack}>← Quay lại đăng nhập</button>
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VIEW 3: Đăng ký tài khoản
══════════════════════════════════════════════════════════════ */
function RegisterView({ onBack }) {
  const [form, setForm] = useState({ hoTen: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  function validate() {
    if (!form.hoTen.trim()) return 'Vui lòng nhập họ tên.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không đúng định dạng.';
    if (form.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự.';
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
      // Sign out immediately — user must login explicitly
      const { signOut } = await import('firebase/auth');
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
      <p style={{ fontSize: '12px', color: '#AAAAAA', marginTop: '-12px', marginBottom: '16px' }}>
        Tài khoản mới mặc định là Nhân viên. Admin có thể nâng cấp quyền sau.
      </p>
      <form onSubmit={handleSubmit}>
        <Field label="Họ và tên">
          <TextInput value={form.hoTen} onChange={set('hoTen')} placeholder="Nguyễn Văn A" required autoFocus />
        </Field>
        <Field label="Email">
          <TextInput type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required />
        </Field>
        <Field label="Mật khẩu">
          <PasswordInput value={form.password} onChange={set('password')} placeholder="Tối thiểu 6 ký tự" required />
        </Field>
        <Field label="Xác nhận mật khẩu">
          <PasswordInput value={form.confirm} onChange={set('confirm')} placeholder="Nhập lại mật khẩu" required />
        </Field>
        {error && <div style={S.error}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}
        {!success
          ? <PrimaryBtn loading={loading}>{USER_PLUS} Tạo tài khoản</PrimaryBtn>
          : <button type="button" style={{ ...S.primaryBtn, marginTop: '8px' }} onClick={onBack}>← Quay lại đăng nhập</button>
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

/* ══════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'register'

  return (
    <div style={S.page}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.knp-spin{animation:spin 0.7s linear infinite;display:inline-block}`}</style>
      <div style={S.wrap}>
        <Brand />
        {view === 'login'    && <LoginView    onForgot={() => setView('forgot')}   onRegister={() => setView('register')} />}
        {view === 'forgot'   && <ForgotView   onBack={() => setView('login')} />}
        {view === 'register' && <RegisterView onBack={() => setView('login')} />}
        <p style={S.footer}>© 2024 Kim Ngân Phát. All rights reserved.</p>
      </div>
    </div>
  );
}
