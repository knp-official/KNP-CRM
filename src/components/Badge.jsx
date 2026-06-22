const colors = {
  'Đang hợp tác': 'bg-emerald-100 text-emerald-700',
  'Tiềm năng': 'bg-blue-100 text-blue-700',
  'Tạm dừng': 'bg-yellow-100 text-yellow-700',
  'Đã kết thúc': 'bg-slate-100 text-slate-600',
  'Nhà thầu M&E': 'bg-purple-100 text-purple-700',
  'Tư vấn thiết kế': 'bg-indigo-100 text-indigo-700',
  'Chủ đầu tư': 'bg-orange-100 text-orange-700',
  'Nhà phân phối': 'bg-cyan-100 text-cyan-700',
  default: 'bg-slate-100 text-slate-600',
};

export default function Badge({ label }) {
  const cls = colors[label] || colors.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
