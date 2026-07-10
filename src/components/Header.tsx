import React from "react";
import { 
  Database, 
  Leaf, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Loader2, 
  CheckCircle,
  Menu,
  X,
  UserPlus,
  Coins,
  Handshake,
  Mail,
  BarChart3
} from "lucide-react";
import { seedAllDataIfEmpty } from "../lib/dbHelper";

interface HeaderProps {
  onRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSeeding: boolean;
  setIsSeeding: (seeding: boolean) => void;
}

export default function Header({ 
  onRefresh, 
  activeTab, 
  setActiveTab, 
  isSeeding, 
  setIsSeeding 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const seeded = await seedAllDataIfEmpty();
      if (seeded) {
        alert("🌱 นำเข้าข้อมูลจำลองสำหรับงานมหกรรมเมืองสมุนไพรสตูล 2569 เรียบร้อยแล้ว!");
      } else {
        alert("ℹ️ ระบบมีข้อมูลในฐานข้อมูลอยู่แล้ว ไม่จำเป็นต้องนำเข้าซ้ำ");
      }
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setIsSeeding(false);
    }
  };

  const navItems = [
    { id: "dashboard", label: "แดชบอร์ดเรียลไทม์", icon: BarChart3 },
    { id: "registration", label: "ลงทะเบียนผู้เข้าร่วม", icon: UserPlus },
    { id: "sales", label: "บันทึกยอดขายและบริการ", icon: Coins },
    { id: "negotiation", label: "เจรจาธุรกิจ (MOU)", icon: Handshake },
    { id: "notifications", label: "ประวัติส่งอีเมลแจ้งเตือน", icon: Mail }
  ];

  return (
    <>
      {/* 1. Desktop Left Sidebar (Visible on lg and up) */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:bg-white lg:border-r lg:border-slate-200/85 lg:h-screen lg:z-30 lg:shadow-xs justify-between">
        <div className="flex flex-col flex-1">
          {/* Brand/Logo Section */}
          <div className="p-6 border-b border-slate-100 bg-emerald-50/15">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
                <Leaf className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-extrabold text-slate-800 leading-tight tracking-tight">
                  ระบบเมืองสมุนไพรสตูล
                </h1>
                <p className="text-[10px] text-emerald-700 font-bold leading-none mt-1 uppercase tracking-wide">
                  Satun Herbal City 2026
                </p>
              </div>
            </div>
          </div>

          {/* Event Status Banner inside Sidebar */}
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">LIVE EVENT</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>๑๖ - ๑๗ กรกฎาคม ๒๕๖๙</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Satun Geopark Gateway, ควนโดน</span>
              </div>
            </div>
          </div>

          {/* Navigation Items (Stacked list) */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
              เมนูหลักของระบบ
            </div>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer & Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSeeding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Database className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isSeeding ? "กำลังนำเข้า..." : "🌱 นำเข้าข้อมูลเริ่มต้นเพื่อทดสอบ"}
          </button>
          <div className="text-center text-[9px] text-slate-400 mt-3 font-medium">
            สำนักงานสาธารณสุขจังหวัดสตูล สสจ.สตูล
          </div>
        </div>
      </aside>

      {/* 2. Mobile Header (Visible on screen < lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs w-full">
        {/* Top Mini Date Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-4 py-1 text-[10px] flex justify-between items-center">
          <span className="font-semibold">มหกรรมเมืองสมุนไพรจังหวัดสตูล ๒๕๖๙</span>
          <span className="opacity-85">๑๖ - ๑๗ ก.ค. ๒๕๖๙</span>
        </div>

        {/* Mobile Nav Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-[11px] font-extrabold text-slate-800 leading-tight">
                สารสนเทศสมุนไพรสตูล
              </h1>
              <p className="text-[7px] text-emerald-700 font-bold leading-none uppercase">
                Satun Herbal City 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-800 cursor-pointer transition"
              title="นำเข้าข้อมูลจำลอง"
            >
              {isSeeding ? (
                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              ) : (
                <Database className="w-3 h-3 text-emerald-600" />
              )}
              <span>{isSeeding ? "นำเข้า..." : "ข้อมูลเริ่มต้น"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scrolling Menu Bar (Tabs on top) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 bg-slate-50 border-b border-slate-100 scrollbar-none snap-x">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold shrink-0 transition-all cursor-pointer snap-start ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60"
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
}
