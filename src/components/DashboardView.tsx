import React from "react";
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Handshake, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  UserCheck
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Attendee, SalesTransaction, BusinessNegotiation, AttendeeType, BoothGroup, ProductCategory } from "../types";

interface DashboardViewProps {
  attendees: Attendee[];
  transactions: SalesTransaction[];
  negotiations: BusinessNegotiation[];
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ 
  attendees, 
  transactions, 
  negotiations,
  setActiveTab 
}: DashboardViewProps) {
  
  // Calculate analytics metrics
  const totalAttendees = attendees.length;
  const checkedInAttendees = attendees.filter(a => a.status === "เช็คอินเข้างานแล้ว").length;
  
  const attendeesDay1 = attendees.filter(a => a.regDate === "2026-07-16").length;
  const attendeesDay2 = attendees.filter(a => a.regDate === "2026-07-17").length;

  const totalSalesAmount = transactions
    .filter(t => t.productCategory === ProductCategory.PRODUCT)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalServiceAmount = transactions
    .filter(t => t.productCategory === ProductCategory.SERVICE)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOrdersCount = transactions.reduce((sum, t) => sum + t.ordersCount, 0);

  const totalNegotiationValue = negotiations.reduce((sum, n) => sum + n.negotiationValue, 0);

  // Total economic value generated = Sales + Service + Negotiations
  const totalEconomicValue = totalSalesAmount + totalServiceAmount + totalNegotiationValue;

  // Format currency values
  const formatBaht = (num: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // 1. Data for Attendee Pie Chart
  const attendeeTypeCount = Object.values(AttendeeType).map(type => {
    const count = attendees.filter(a => a.type === type).length;
    return { name: type, value: count };
  }).filter(item => item.value > 0);

  const ATTENDEE_COLORS = [
    "#047857", // emerald-700
    "#10b981", // emerald-500
    "#06b6d4", // cyan-500
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#ec4899"  // pink-500
  ];

  // 2. Data for Sales by Booth Group Bar Chart
  const salesByGroup = Object.values(BoothGroup).map(group => {
    const totalGroupSales = transactions
      .filter(t => t.boothGroup === group)
      .reduce((sum, t) => sum + t.amount, 0);
    const orderCount = transactions
      .filter(t => t.boothGroup === group)
      .reduce((sum, t) => sum + t.ordersCount, 0);
    
    // Shorten the group name for chart label readability
    let displayName = group.split(" ")[0];
    return { 
      name: displayName, 
      "ยอดเงินสะพัด (บาท)": totalGroupSales,
      "จำนวนครั้งที่สั่งซื้อ": orderCount
    };
  });

  // 3. Daily Summary comparison (July 16 vs July 17)
  const getDailyMetric = (date: string) => {
    const atts = attendees.filter(a => a.regDate === date).length;
    const sales = transactions.filter(t => t.recordDate === date).reduce((sum, t) => sum + t.amount, 0);
    const negs = negotiations.filter(n => n.recordDate === date).reduce((sum, n) => sum + n.negotiationValue, 0);
    const orders = transactions.filter(t => t.recordDate === date).reduce((sum, t) => sum + t.ordersCount, 0);
    return {
      dateText: date === "2026-07-16" ? "๑๖ ก.ค. ๒๕๖๙ (วันแรก)" : "๑๗ ก.ค. ๒๕๖๙ (วันที่สอง)",
      attendeesCount: atts,
      salesVal: sales,
      negsVal: negs,
      ordersVal: orders,
      totalEco: sales + negs
    };
  };

  const dailyTrendData = [
    getDailyMetric("2026-07-16"),
    getDailyMetric("2026-07-17")
  ];

  // 4. Negotiations Status values
  const negotiationStatusData = [
    {
      name: "เจรจาสำเร็จ (MOU)",
      value: negotiations.filter(n => n.status.startsWith("เจรจาสำเร็จ")).reduce((sum, n) => sum + n.negotiationValue, 0),
      count: negotiations.filter(n => n.status.startsWith("เจรจาสำเร็จ")).length
    },
    {
      name: "อยู่ระหว่างเจรจา",
      value: negotiations.filter(n => n.status === "อยู่ระหว่างเจรจา").reduce((sum, n) => sum + n.negotiationValue, 0),
      count: negotiations.filter(n => n.status === "อยู่ระหว่างเจรจา").length
    },
    {
      name: "กำลังติดตามผล",
      value: negotiations.filter(n => n.status === "กำลังติดตามผล").reduce((sum, n) => sum + n.negotiationValue, 0),
      count: negotiations.filter(n => n.status === "กำลังติดตามผล").length
    }
  ].filter(item => item.count > 0);

  const NEG_COLORS = ["#059669", "#f59e0b", "#3b82f6"];

  return (
    <div className="space-y-6">
      
      {/* Intro Dashboard Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/60">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            📊 รายงานสถิติและมูลค่าทางเศรษฐกิจแบบเรียลไทม์
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            สรุปข้อมูลสถิติผู้เข้างาน ยอดจำหน่ายสินค้า ผลิตภัณฑ์สมุนไพร บริการสุขภาพ และมูลค่าการร่วมเจรจาธุรกิจคู่ค้า (MOU)
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-xs">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            อัปเดตล่าสุด: {new Date().toLocaleTimeString("th-TH")} น.
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Economic Value */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 rounded-2xl shadow-sm border border-emerald-700/30 relative overflow-hidden group">
          <div className="absolute right-[-15px] bottom-[-15px] opacity-15 transform group-hover:scale-110 transition duration-300">
            <TrendingUp className="w-32 h-32 text-white" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              มูลค่าทางเศรษฐกิจในงานรวม
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-100">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
              {formatBaht(totalEconomicValue)}
            </div>
            <p className="text-[11px] text-emerald-100/85 mt-2 flex items-center gap-1">
              ยอดขายสินค้าและบริการ + มูลค่าการเจรจาคู่ค้า
            </p>
          </div>
        </div>

        {/* Card 2: Total Attendees */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-emerald-200 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ผู้เข้าร่วมลงทะเบียนทั้งหมด
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-800 tracking-tight">
              {totalAttendees.toLocaleString("th-TH")} <span className="text-sm font-medium text-slate-500">คน</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              เช็คอินแล้ว <span className="font-semibold text-slate-700">{checkedInAttendees} คน</span> ({totalAttendees > 0 ? Math.round((checkedInAttendees/totalAttendees)*100) : 0}%)
            </p>
          </div>
        </div>

        {/* Card 3: Total Sales / Services */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-emerald-200 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ยอดขายและบริการ (ข้อ 3)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 tracking-tight">
              {formatBaht(totalSalesAmount + totalServiceAmount)}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              <span>สั่งซื้อสะสม <span className="font-semibold text-slate-700">{totalOrdersCount} รายการ</span></span>
            </p>
          </div>
        </div>

        {/* Card 4: Business Negotiations */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-emerald-200 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              มูลค่าเจรจาธุรกิจ (MOU)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
              <Handshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 tracking-tight">
              {formatBaht(totalNegotiationValue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              ผู้ซื้อจับคู่ค้าสะสม <span className="font-semibold text-slate-700">{negotiations.length} ดีลหลัก</span>
            </p>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Sales breakdown by Booth Group (Bento Box style) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">🛍️ ยอดจำหน่ายและจำนวนออเดอร์ จำแนกตามกลุ่มบูธ</h3>
              <p className="text-xs text-slate-500 mt-0.5">แบ่งตามห่วงโซ่คุณค่าต้นน้ำ-กลางน้ำ-ปลายน้ำ (เอกสารข้อ 3 &amp; 4)</p>
            </div>
          </div>
          <div className="h-72 w-full flex-1">
            {transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                ไม่มีข้อมูลยอดขาย กรุณากดปุ่ม "นำเข้าข้อมูลเริ่มต้น" ที่แถบเมนูด้านบน
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByGroup} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                  <Tooltip 
                    formatter={(value) => [typeof value === "number" ? formatBaht(value) : value, "ยอดขาย"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} 
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="ยอดเงินสะพัด (บาท)" fill="#059669" radius={[4, 4, 0, 0]}>
                    {salesByGroup.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ATTENDEE_COLORS[index % ATTENDEE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Daily comparison Trend (Day 1 vs Day 2) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">📈 เปรียบเทียบข้อมูลสถิติรายวัน (๑๖ vs ๑๗ กรกฎาคม)</h3>
              <p className="text-xs text-slate-500 mt-0.5">เปรียบเทียบผู้เข้าชมงาน ยอดขายสินค้า และดีลจับคู่ธุรกิจ</p>
            </div>
          </div>
          <div className="h-72 w-full flex-1">
            {attendees.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                ไม่มีข้อมูลสถิติ กรุณานำเข้าข้อมูลจำลอง
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNegs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dateText" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === "salesVal" ? formatBaht(Number(value)) : 
                      name === "negsVal" ? formatBaht(Number(value)) : value, 
                      name === "salesVal" ? "ยอดจำหน่ายสินค้า" : 
                      name === "negsVal" ? "มูลค่าเจรจาธุรกิจ" : "ผู้ลงทะเบียน"
                    ]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="salesVal" name="salesVal" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                  <Area type="monotone" dataKey="negsVal" name="negsVal" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNegs)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Attendees by Category (Pie Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">👥 สัดส่วนผู้ลงทะเบียนตามกลุ่มเป้าหมาย (จำแนกตามข้อ ๔)</h3>
              <p className="text-xs text-slate-500 mt-0.5">จำแนก เกษตรกร, ผู้ประกอบการ, บุคลากรภาครัฐ, แขกผู้มีเกียรติ, นักเรียน, ประชาชน</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center flex-1">
            <div className="h-60 col-span-1 md:col-span-2 w-full">
              {attendeeTypeCount.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  ไม่มีข้อมูลผู้ลงทะเบียน
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendeeTypeCount}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {attendeeTypeCount.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ATTENDEE_COLORS[index % ATTENDEE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} คน`, "จำนวน"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Pie Chart Custom Legend */}
            <div className="space-y-2 col-span-1">
              {attendeeTypeCount.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1">
                  <div className="flex items-center gap-2 truncate">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: ATTENDEE_COLORS[index % ATTENDEE_COLORS.length] }}
                    />
                    <span className="text-slate-600 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 font-mono">
                    {item.value} คน
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Business Negotiation Status (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">🤝 สถานะและมูลค่าการเจรจาจับคู่ค้าธุรกิจ</h3>
              <p className="text-xs text-slate-500 mt-0.5">ประเมินมูลค่าทางเศรษฐกิจตามข้อ 3 (สำเร็จสำเร็จสะสม vs รอคอย)</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center flex-1">
            <div className="h-60 col-span-1 md:col-span-2 w-full">
              {negotiationStatusData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  ไม่มีข้อมูลการเจรจาธุรกิจ
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={negotiationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {negotiationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={NEG_COLORS[index % NEG_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatBaht(Number(value)), "มูลค่าดีล"]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Custom status details */}
            <div className="space-y-2 col-span-1">
              {negotiationStatusData.map((item, index) => (
                <div key={item.name} className="flex flex-col text-xs border-b border-slate-50 pb-1.5">
                  <div className="flex items-center gap-1.5 justify-between">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: NEG_COLORS[index % NEG_COLORS.length] }}
                      />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {item.count} ดีล
                    </span>
                  </div>
                  <span className="font-extrabold text-emerald-800 font-mono text-right mt-1">
                    {formatBaht(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action & Live Feed Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Registration Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between md:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
              ลงทะเบียนด่วนพิเศษ (Fast-track)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              เพิ่มรายชื่อผู้เข้าร่วมงานด่วนเพื่ออำนวยความสะดวกที่เคาน์เตอร์จุดคัดกรองหลัก
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 mt-4 text-xs text-slate-600 flex flex-col gap-2">
            <div>📍 <strong>จุดลงทะเบียนหลัก:</strong> ศูนย์จีโอพาร์คเกตเวย์</div>
            <div>⏰ <strong>ช่วงเวลาเร่งด่วน:</strong> คาดการเวลา 09:00 - 11:30 น.</div>
          </div>
          <button 
            onClick={() => setActiveTab("registration")}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition"
          >
            ไปที่หน้าต่างลงทะเบียน
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Feed Event Feed / Activities list according to schedule in document */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs md:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-emerald-600" />
            ตารางกิจกรรมหลักตามกำหนดการ (๑๖ - ๑๗ กรกฎาคม ๒๕๖๙)
          </h3>
          <div className="space-y-3.5 max-h-[195px] overflow-y-auto pr-1">
            
            <div className="flex items-start gap-3 border-l-2 border-emerald-500 pl-3 pb-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0 font-mono">16 ก.ค. 09.00 น.</span>
              <div>
                <h4 className="text-xs font-semibold text-slate-800">พิธีลงทะเบียนเปิดนิทรรศการเครือข่ายเมืองสมุนไพร</h4>
                <p className="text-[11px] text-slate-500">ต้นน้ำ กลางน้ำ และปลายน้ำ / เปิดจุด Wellness Center</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-2 border-slate-200 pl-3 pb-1">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 font-mono">16 ก.ค. 13.00 น.</span>
              <div>
                <h4 className="text-xs font-semibold text-slate-800">เสวนาวิชาการ "จากสมุนไพรท้องถิ่นสู่เศรษฐกิจสุขภาพ"</h4>
                <p className="text-[11px] text-slate-500">โดย ผู้แทนเกษตรกร, คณะเภสัชศาสตร์ ม.สงขลานครินทร์ และหน่วยงาน</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-2 border-emerald-500 pl-3 pb-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0 font-mono">17 ก.ค. 08.30 น.</span>
              <div>
                <h4 className="text-xs font-semibold text-slate-800">ลงทะเบียนผู้เข้าร่วมงาน วันที่สอง</h4>
                <p className="text-[11px] text-slate-500">เปิดตลาดจำหน่าย บันทึกข้อมูลยอดจำหน่ายข้อ 3 แบบเรียลไทม์</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-l-2 border-slate-200 pl-3">
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 font-mono">17 ก.ค. 16.00 น.</span>
              <div>
                <h4 className="text-xs font-semibold text-slate-800">พิธีเปิดงานเป็นทางการและมอบรางวัลการแข่งขันอาหารสมุนไพร</h4>
                <p className="text-[11px] text-slate-500">มอบเกียรติบัตรรับรองมาตรฐาน Wellness Center และนวดไทยพรีเมียม</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
