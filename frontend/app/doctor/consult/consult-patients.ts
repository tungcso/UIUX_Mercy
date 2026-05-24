export const consultPatients = [
  {
    id: "1",
    name: "Lê Thị Mai",
    note: "Cần xử trí khẩn cấp",
    urgent: true,
    unread: 1,
    online: true,
  },
  {
    id: "2",
    name: "Trần Quốc Bảo",
    note: "Đang chờ tư vấn",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    name: "Phạm Hoàng Nam",
    note: "Chuẩn bị xuất viện",
    unread: 0,
    online: true,
  },
];

export const consultUrgentCount = consultPatients.reduce(
  (count, patient) => count + (patient.urgent ? 1 : 0),
  0,
);

export const consultUnreadCount = consultPatients.reduce(
  (count, patient) => count + (patient.unread ?? 0),
  0,
);
