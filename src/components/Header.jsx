import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut, Shield, Users, User } from 'lucide-react';

const roleLabel = { admin: 'Admin', manager: 'Quản lý', employee: 'Nhân viên' };
const roleStyle = {
  admin:    'bg-red-100 text-red-700',
  manager:  'bg-orange-100 text-orange-700',
  employee: 'bg-slate-100 text-slate-600',
};
const roleIcon = { admin: Shield, manager: Users, employee: User };

export default function Header({ userDoc }) {
  const role = userDoc?.vaiTro || 'employee';
  const Icon = roleIcon[role] || User;

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${roleStyle[role]}`}>
          <Icon size={11} />
          {roleLabel[role]}
        </span>

        {/* Avatar + name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(userDoc?.hoTen || '?').charAt(0)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{userDoc?.hoTen || 'Người dùng'}</p>
            <p className="text-xs text-slate-400 leading-tight">{userDoc?.phongBan || ''}</p>
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <LogOut size={15} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
