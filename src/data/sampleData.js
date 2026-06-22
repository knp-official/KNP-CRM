export const SAMPLE_CUSTOMERS = [
  {
    id: 'c1',
    ngay_sinh_lien_he: '1985-06-15',
    ten: 'Công ty TNHH Cơ Điện Lạnh Minh Phú',
    loai: 'Nhà thầu M&E',
    tinh_thanh: 'TP. Hồ Chí Minh',
    dia_chi: '123 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    website: 'www.minhphu-mep.vn',
    ma_so_thue: '0312345678',
    trang_thai: 'Đang hợp tác',
    nguon: 'Giới thiệu',
    san_pham_quan_tam: ['Ống gió chống cháy', 'Phụ kiện HVAC'],
    ghi_chu: 'Khách hàng lâu năm, thanh toán đúng hạn',
    ngay_tao: '2024-01-15',
  },
  {
    id: 'c2',
    ten: 'Công ty CP Tư Vấn Xây Dựng Hưng Thịnh',
    loai: 'Tư vấn thiết kế',
    tinh_thanh: 'Hà Nội',
    dia_chi: '45 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    website: '',
    ma_so_thue: '0101234567',
    trang_thai: 'Tiềm năng',
    nguon: 'Hội chợ',
    san_pham_quan_tam: ['Thạch cao', 'Ống gió chống cháy'],
    ghi_chu: 'Đang trong giai đoạn báo giá dự án Vincom Hà Nội',
    ngay_tao: '2024-03-20',
  },
  {
    id: 'c3',
    ten: 'Tập đoàn Đầu Tư Bất Động Sản Phú Mỹ Hưng',
    loai: 'Chủ đầu tư',
    tinh_thanh: 'TP. Hồ Chí Minh',
    dia_chi: '9 Đường Hoàng Văn Thái, Phú Mỹ Hưng, Q7',
    website: 'www.phumyhung.vn',
    ma_so_thue: '0300123456',
    trang_thai: 'Đang hợp tác',
    nguon: 'Website',
    san_pham_quan_tam: ['Ống gió chống cháy', 'Thạch cao', 'Phụ kiện HVAC'],
    ghi_chu: 'Chủ đầu tư lớn, cần ưu tiên chăm sóc',
    ngay_tao: '2023-11-05',
  },
];

export const SAMPLE_CONTACTS = [
  {
    id: 'ct1',
    khach_hang_id: 'c1',
    ho_ten: 'Nguyễn Văn An',
    chuc_vu: 'Giám đốc kỹ thuật',
    phong_ban: 'Kỹ thuật',
    dien_thoai: '0901234567',
    email: 'an.nguyen@minhphu-mep.vn',
    zalo: '0901234567',
    la_nguoi_quyet_dinh: true,
    ghi_chu: 'Người ký hợp đồng chính',
    ngay_tao: '2024-01-15',
  },
  {
    id: 'ct2',
    khach_hang_id: 'c1',
    ho_ten: 'Trần Thị Bình',
    chuc_vu: 'Kế toán trưởng',
    phong_ban: 'Kế toán',
    dien_thoai: '0912345678',
    email: 'binh.tran@minhphu-mep.vn',
    zalo: '',
    la_nguoi_quyet_dinh: false,
    ghi_chu: 'Phụ trách thanh toán',
    ngay_tao: '2024-01-15',
  },
  {
    id: 'ct3',
    khach_hang_id: 'c2',
    ho_ten: 'Lê Hoàng Dũng',
    chuc_vu: 'Trưởng phòng dự án',
    phong_ban: 'Dự án',
    dien_thoai: '0923456789',
    email: 'dung.le@hungthinh.vn',
    zalo: '0923456789',
    la_nguoi_quyet_dinh: true,
    ghi_chu: '',
    ngay_tao: '2024-03-20',
  },
];

export const SAMPLE_EMPLOYEES = [
  { id: 'e1', ho_ten: 'Nguyễn Thị Lan', chuc_vu: 'Giám đốc kinh doanh', phong_ban: 'Phòng Kinh doanh', dien_thoai: '0901111111', email: 'lan.nguyen@knp.vn', ngay_vao_lam: '2020-03-01', ngay_sinh: '1990-06-22', trang_thai: 'Đang làm việc', ghi_chu: '' },
  { id: 'e2', ho_ten: 'Trần Văn Minh', chuc_vu: 'Nhân viên kinh doanh', phong_ban: 'Phòng Kinh doanh', dien_thoai: '0902222222', email: 'minh.tran@knp.vn', ngay_vao_lam: '2021-06-15', ngay_sinh: '1995-03-10', trang_thai: 'Đang làm việc', ghi_chu: '' },
  { id: 'e3', ho_ten: 'Lê Thị Hoa', chuc_vu: 'Kế toán trưởng', phong_ban: 'Phòng Tài chính & Nhân sự', dien_thoai: '0903333333', email: 'hoa.le@knp.vn', ngay_vao_lam: '2019-01-10', ngay_sinh: '1988-06-05', trang_thai: 'Đang làm việc', ghi_chu: '' },
  { id: 'e4', ho_ten: 'Phạm Quốc Tuấn', chuc_vu: 'Kỹ thuật sản xuất', phong_ban: 'Phòng Sản xuất & Cung ứng', dien_thoai: '0904444444', email: 'tuan.pham@knp.vn', ngay_vao_lam: '2022-09-01', ngay_sinh: '1998-11-20', trang_thai: 'Đang làm việc', ghi_chu: '' },
  { id: 'e5', ho_ten: 'Nguyễn Thị Mai', chuc_vu: 'Nhân sự', phong_ban: 'Phòng Tài chính & Nhân sự', dien_thoai: '0905555555', email: 'mai.nguyen@knp.vn', ngay_vao_lam: '2021-04-01', ngay_sinh: '1993-04-15', trang_thai: 'Đang làm việc', ghi_chu: '' },
  { id: 'e6', ho_ten: 'Bùi Văn Đức', chuc_vu: 'Quản lý kho', phong_ban: 'Phòng Sản xuất & Cung ứng', dien_thoai: '0906666666', email: 'duc.bui@knp.vn', ngay_vao_lam: '2020-08-15', ngay_sinh: '1991-08-30', trang_thai: 'Đang làm việc', ghi_chu: '' },
];

export const SAMPLE_TASKS = [
  { id: 't1', tieu_de: 'Gửi báo giá ống gió chống cháy', mo_ta: 'Báo giá cho dự án văn phòng tại Q1', khach_hang_id: 'c1', nhan_vien_id: 'e2', deadline: '2024-07-15', trang_thai: 'Hoàn thành', uu_tien: 'Cao', ngay_tao: '2024-07-01' },
  { id: 't2', tieu_de: 'Tư vấn kỹ thuật thạch cao', mo_ta: 'Hỗ trợ kỹ thuật cho dự án Vincom Hà Nội', khach_hang_id: 'c2', nhan_vien_id: 'e2', deadline: '2024-07-20', trang_thai: 'Đang làm', uu_tien: 'Cao', ngay_tao: '2024-07-05' },
  { id: 't3', tieu_de: 'Theo dõi đơn hàng phụ kiện HVAC', mo_ta: 'Kiểm tra tiến độ giao hàng đợt 3', khach_hang_id: 'c3', nhan_vien_id: 'e1', deadline: '2024-06-30', trang_thai: 'Quá hạn', uu_tien: 'Trung bình', ngay_tao: '2024-06-20' },
  { id: 't4', tieu_de: 'Chăm sóc khách hàng định kỳ', mo_ta: 'Gọi điện hỏi thăm tiến độ dự án', khach_hang_id: 'c1', nhan_vien_id: 'e2', deadline: '2024-08-01', trang_thai: 'Chưa làm', uu_tien: 'Thấp', ngay_tao: '2024-07-10' },
];

export const SAMPLE_QUOTES = [
  {
    id: 'q1', so_bao_gia: 'BG-2024-001', khach_hang_id: 'c1', nguoi_lam: 'e1',
    ngay_tao: '2024-06-01', ngay_het_han: '2024-07-01', trang_thai: 'Đã duyệt',
    ghi_chu: 'Báo giá dự án văn phòng tòa nhà A',
    items: [
      { san_pham: 'Ống gió chống cháy', don_vi: 'm²', so_luong: 200, don_gia: 350000, thanh_tien: 70000000 },
      { san_pham: 'Phụ kiện HVAC', don_vi: 'bộ', so_luong: 10, don_gia: 1200000, thanh_tien: 12000000 },
    ],
    tong_chua_vat: 82000000, vat: 8200000, tong_sau_vat: 90200000,
  },
  {
    id: 'q2', so_bao_gia: 'BG-2024-002', khach_hang_id: 'c2', nguoi_lam: 'e2',
    ngay_tao: '2024-06-15', ngay_het_han: '2024-07-15', trang_thai: 'Chờ duyệt',
    ghi_chu: 'Dự án Vincom Hà Nội - giai đoạn 1',
    items: [
      { san_pham: 'Thạch cao', don_vi: 'm²', so_luong: 500, don_gia: 120000, thanh_tien: 60000000 },
      { san_pham: 'Ống gió chống cháy', don_vi: 'm²', so_luong: 150, don_gia: 350000, thanh_tien: 52500000 },
    ],
    tong_chua_vat: 112500000, vat: 11250000, tong_sau_vat: 123750000,
  },
];

export const SAMPLE_DEBTS = [
  { id: 'd1', khach_hang_id: 'c1', so_hoa_don: 'HD-2024-001', mo_ta: 'Hợp đồng ống gió chống cháy đợt 1', so_tien: 90200000, da_thanh_toan: 90200000, ngay_hoa_don: '2024-04-01', ngay_den_han: '2024-05-01', trang_thai: 'Đã thanh toán', ghi_chu: '' },
  { id: 'd2', khach_hang_id: 'c3', so_hoa_don: 'HD-2024-002', mo_ta: 'Phụ kiện HVAC đợt 2', so_tien: 45000000, da_thanh_toan: 20000000, ngay_hoa_don: '2024-05-15', ngay_den_han: '2024-06-15', trang_thai: 'Thanh toán một phần', ghi_chu: 'Còn nợ 25tr, hẹn cuối tháng' },
  { id: 'd3', khach_hang_id: 'c2', so_hoa_don: 'HD-2024-003', mo_ta: 'Thạch cao dự án Vincom HN', so_tien: 123750000, da_thanh_toan: 0, ngay_hoa_don: '2024-06-01', ngay_den_han: '2024-07-01', trang_thai: 'Chưa thanh toán', ghi_chu: 'Chờ nghiệm thu' },
];

export const LOAI_KHACH_HANG = ['Nhà thầu M&E', 'Tư vấn thiết kế', 'Chủ đầu tư', 'Nhà phân phối', 'Khác'];
export const TRANG_THAI_KH = ['Tiềm năng', 'Đang hợp tác', 'Tạm dừng', 'Đã kết thúc'];
export const NGUON_KH = ['Giới thiệu', 'Website', 'Hội chợ', 'Gọi điện', 'Mạng xã hội', 'Khác'];
export const SAN_PHAM = ['Ống gió chống cháy', 'Phụ kiện HVAC', 'Thạch cao', 'Khác'];
export const PHONG_BAN = ['Ban Giám đốc', 'Phòng Tài chính & Nhân sự', 'Phòng Kinh doanh', 'Phòng Sản xuất & Cung ứng'];
export const TRANG_THAI_NV = ['Đang làm việc', 'Nghỉ phép', 'Đã nghỉ việc'];
export const VAI_TRO_NV = ['Admin', 'Quản lý', 'Nhân viên'];

export const BOOTSTRAP_CEO = {
  id: 'ceo_le_nhu_dung',
  ho_ten: 'Lê Như Dũng',
  chuc_vu: 'CEO / Founder',
  phong_ban: 'Ban Giám đốc',
  vai_tro: 'Admin',
  quan_ly_id: '',
  dien_thoai: '',
  email: '',
  ngay_vao_lam: '',
  ngay_sinh: '',
  trang_thai: 'Đang làm việc',
  ghi_chu: '',
  ngay_tao: new Date().toISOString().split('T')[0],
};
export const UU_TIEN = ['Cao', 'Trung bình', 'Thấp'];
export const TRANG_THAI_TASK = ['Chưa làm', 'Đang làm', 'Hoàn thành', 'Quá hạn'];
export const TRANG_THAI_BG = ['Nháp', 'Chờ duyệt', 'Đã duyệt', 'Đã gửi KH', 'Thắng', 'Thua'];
export const TRANG_THAI_CN = ['Chưa thanh toán', 'Thanh toán một phần', 'Đã thanh toán', 'Quá hạn'];
export const SAN_PHAM_BG = [
  { ten: 'Ống gió chống cháy', don_vi: 'm²', don_gia: 350000 },
  { ten: 'Phụ kiện HVAC', don_vi: 'bộ', don_gia: 1200000 },
  { ten: 'Thạch cao', don_vi: 'm²', don_gia: 120000 },
  { ten: 'Keo chống cháy', don_vi: 'lon', don_gia: 280000 },
  { ten: 'Ty treo ống gió', don_vi: 'cái', don_gia: 45000 },
  { ten: 'Khác', don_vi: 'cái', don_gia: 0 },
];

export const TINH_THANH = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai',
  'Long An', 'Cần Thơ', 'Hải Phòng', 'Bà Rịa - Vũng Tàu', 'Khác'
];
