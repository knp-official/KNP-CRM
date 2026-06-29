import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const useLeaveRequests = (currentUser, vaiTro, phongBan) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    console.log('🔍 useLeaveRequests params:', {
      uid: currentUser?.uid,
      vaiTro: vaiTro,
      vaiTroType: typeof vaiTro,
      phongBan: phongBan,
    });

    if (!currentUser?.uid) {
      console.log('❌ Không có uid → return');
      setLoading(false);
      return;
    }

    let q;
    if (vaiTro === 'Admin') {
      console.log('✅ Vào nhánh Admin - query tất cả');
      q = query(collection(db, 'leave_requests'));
    } else if (vaiTro === 'Quản lý') {
      console.log('✅ Vào nhánh Manager - phong_ban:', phongBan);
      q = query(
        collection(db, 'leave_requests'),
        where('phong_ban', '==', phongBan || '__none__')
      );
    } else {
      console.log('⚠️ Vào nhánh Employee - lọc theo uid:', currentUser.uid);
      q = query(
        collection(db, 'leave_requests'),
        where('nguoi_xin_id', '==', currentUser.uid)
      );
    }

    const unsub = onSnapshot(
      q,
      snap => {
        console.log('📦 Snapshot nhận được:', snap.docs.length, 'documents');
        snap.docs.forEach(d => console.log('  -', d.id, d.data()));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
        setLeaveRequests(data);
        setLoading(false);
        setError(null);
      },
      err => {
        console.error('❌ onSnapshot error:', err.code, err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [currentUser?.uid, vaiTro, phongBan]);

  const taoDoXinNghi = async (data) => {
    const docRef = await addDoc(collection(db, 'leave_requests'), {
      ...data,
      nguoi_xin_id: currentUser.uid,
      trang_thai: 'cho_duyet',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    if (data.nguoi_duyet_id) {
      await addDoc(collection(db, 'notifications'), {
        type: 'leave_request',
        title: 'Đơn xin nghỉ mới',
        body: `${data.nguoi_xin_ten} xin nghỉ ${data.loai_nghi === 'ngay' ? 'theo ngày' : data.loai_nghi === 'buoi' ? 'theo buổi' : 'theo giờ'}`,
        userId: data.nguoi_duyet_id,
        leaveRequestId: docRef.id,
        read: false,
        created_at: serverTimestamp(),
      });
    }
    return docRef;
  };

  const duyetDon = async (id, nguoiDuyetTen, nguoiXinId) => {
    await updateDoc(doc(db, 'leave_requests', id), {
      trang_thai: 'da_duyet',
      nguoi_duyet_id: currentUser.uid,
      nguoi_duyet_ten: nguoiDuyetTen,
      thoi_gian_duyet: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    if (nguoiXinId) {
      await addDoc(collection(db, 'notifications'), {
        type: 'leave_approved',
        title: 'Đơn nghỉ phép được duyệt',
        body: `Đơn xin nghỉ của bạn đã được ${nguoiDuyetTen} duyệt`,
        userId: nguoiXinId,
        leaveRequestId: id,
        read: false,
        created_at: serverTimestamp(),
      });
    }
  };

  const tuChoiDon = async (id, lyDo, nguoiXinId, nguoiDuyetTen) => {
    await updateDoc(doc(db, 'leave_requests', id), {
      trang_thai: 'tu_choi',
      ly_do_tu_choi: lyDo,
      nguoi_duyet_id: currentUser.uid,
      nguoi_duyet_ten: nguoiDuyetTen,
      thoi_gian_duyet: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    if (nguoiXinId) {
      await addDoc(collection(db, 'notifications'), {
        type: 'leave_rejected',
        title: 'Đơn nghỉ phép bị từ chối',
        body: `Đơn xin nghỉ của bạn đã bị từ chối${lyDo ? ': ' + lyDo : ''}`,
        userId: nguoiXinId,
        leaveRequestId: id,
        read: false,
        created_at: serverTimestamp(),
      });
    }
  };

  return { leaveRequests, loading, error, taoDoXinNghi, duyetDon, tuChoiDon };
};

export default useLeaveRequests;
