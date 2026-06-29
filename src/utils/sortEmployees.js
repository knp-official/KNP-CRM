const ROLE_ORDER = {
  'admin':    1,
  'quản lý':  2,
  'quản trị': 2,
  'manager':  2,
  'nhân viên': 3,
  'employee':  3,
}

const getRolePriority = (vaiTro) => {
  const role = (vaiTro || '').toLowerCase().trim()
  return ROLE_ORDER[role] || 99
}

/**
 * Sắp xếp nhân viên: Admin → Quản lý → Nhân viên → tên cuối A-Z (tiếng Việt)
 */
export const sortEmployeesByRole = (employees) => {
  if (!Array.isArray(employees)) return []
  return [...employees].sort((a, b) => {
    const roleA = getRolePriority(a.vai_tro || a.vaiTro || a.role)
    const roleB = getRolePriority(b.vai_tro || b.vaiTro || b.role)
    if (roleA !== roleB) return roleA - roleB
    const nameA = (a.ho_ten || a.hoTen || a.ten || a.name || '').trim()
    const nameB = (b.ho_ten || b.hoTen || b.ten || b.name || '').trim()
    const lastA = nameA.split(' ').pop().toLowerCase()
    const lastB = nameB.split(' ').pop().toLowerCase()
    return lastA.localeCompare(lastB, 'vi')
  })
}

export default sortEmployeesByRole
