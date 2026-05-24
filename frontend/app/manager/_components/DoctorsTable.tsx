export default function DoctorsTable() {
  const doctors = [
    {
      name: "Thầy thuốc ưu tú Nguyễn Văn A",
      spec: "Tim Mạch",
      cases: 142,
      rating: 4.9,
      status: "Đang Khám",
    },
    {
      name: "BS. Trần Thị B",
      spec: "Nội Tổng Quát",
      cases: 98,
      rating: 4.7,
      status: "Đang Khám",
    },
    {
      name: "ThS. BS. Lê Hoàng C",
      spec: "Nhi Khoa",
      cases: 215,
      rating: 4.8,
      status: "Nghỉ Cả",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">
        ĐO LƯỜNG SỐ CA HOÀN THÀNH & LƯỢT ĐÁNH GIÁ BÁC SĨ
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="px-6 py-3">Họ và tên bác sĩ</th>
              <th className="px-6 py-3">Chuyên khoa</th>
              <th className="px-6 py-3">Số ca hoàn thành</th>
              <th className="px-6 py-3">Đánh giá sao</th>
              <th className="px-6 py-3">Trạng thái trực tế</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-6 py-4">
                  <a className="text-emerald-600 hover:underline" href="#">
                    {d.name}
                  </a>
                </td>
                <td className="px-6 py-4 text-slate-500">{d.spec}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {d.cases} ca
                </td>
                <td className="px-6 py-4 text-amber-500">★ {d.rating}/5.0</td>
                <td className="px-6 py-4">
                  {(() => {
                    const base =
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";
                    let cls =
                      base +
                      " border-emerald-200 bg-emerald-50 text-emerald-700"; // default: green
                    let label = d.status;
                    if (d.status === "Nghỉ Cả") {
                      // show as 'nghỉ ca' with light gray border
                      cls = base + " border-slate-200 bg-white text-slate-700";
                      label = "nghỉ ca";
                    } else if (d.status === "Đang Khám") {
                      cls =
                        base +
                        " border-emerald-200 bg-emerald-50 text-emerald-700";
                    }

                    return <span className={cls}>{label}</span>;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
