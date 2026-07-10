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
  X
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
    { id: "dashboard", label: "📊 แดชบอร์ดเรียลไทม์" },
    { id: "registration", label: "📝 ลงทะเบียนผู้เข้าร่วม" },
    { id: "sales", label: "🛍️ บันทึกยอดขายและบริการ" },
    { id: "negotiation", label: "🤝 เจรจาธุรกิจ (MOU)" },
    { id: "notifications", label: "📬 ประวัติส่งอีเมลแจ้งเตือน" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
      {/* Top Banner with Event Info */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-4 py-2.5 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-light">
            <span className="bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase animate-pulse">LIVE</span>
            <span className="font-medium">งานมหกรรมเมืองสมุนไพรจังหวัดสตูล ๒๕๖๙</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100 font-light text-[11px] sm:text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              ๑๖ - ๑๗ กรกฎาคม ๒๕๖๙
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Satun Geopark Gateway, ควนโดน
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Leaf className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight tracking-tight flex items-center gap-1.5">
              ระบบสารสนเทศเมืองสมุนไพรสตูล
            </h1>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium leading-none">
              Satun Herbal City Data Engine &amp; Real-time Dashboard
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-xs disabled:opacity-50"
          >
            {isSeeding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Database className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isSeeding ? "กำลังนำเข้า..." : "🌱 นำเข้าข้อมูลเริ่มต้น"}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="sm:hidden flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white"
            title="นำเข้าข้อมูลจำลอง"
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Database className="w-4 h-4 text-emerald-600" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl py-3 px-4 flex flex-col gap-1.5 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="border-t border-slate-100 pt-3 mt-1.5 flex flex-col gap-2">
            <button
              onClick={() => {
                handleSeedData();
                setMobileMenuOpen(false);
              }}
              disabled={isSeeding}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100 transition"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              {isSeeding ? "กำลังประมวลผล..." : "🌱 นำเข้าข้อมูลเริ่มต้นเพื่อทดสอบ"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
