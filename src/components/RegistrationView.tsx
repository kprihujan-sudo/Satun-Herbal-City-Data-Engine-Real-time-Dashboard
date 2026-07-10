import React, { useState } from "react";
import { 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Mail, 
  Building, 
  Phone, 
  User, 
  Calendar, 
  Clock, 
  Printer, 
  CheckCircle, 
  X,
  RefreshCw,
  QrCode
} from "lucide-react";
import { Attendee, AttendeeType, RegistrationStatus } from "../types";
import { addAttendee, updateAttendeeStatus, deleteAttendee } from "../lib/dbHelper";
import { exportAttendeesToExcel, printReportHTML } from "../lib/exportUtils";

interface RegistrationViewProps {
  attendees: Attendee[];
  onRefresh: () => void;
}

export default function RegistrationView({ attendees, onRefresh }: RegistrationViewProps) {
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<AttendeeType>(AttendeeType.GENERAL);
  const [organization, setOrganization] = useState("");
  const [regDate, setRegDate] = useState("2026-07-16");
  const [regTime, setRegTime] = useState("09:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("ALL");

  // Success Modal State (Simulating Email Sending)
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, เบอร์โทรศัพท์) ให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name,
        phone,
        email: email.trim() || "-",
        type,
        organization: organization || "-",
        regDate,
        regTime,
        status: RegistrationStatus.SUCCESS
      };

      const result = await addAttendee(data);
      if (result) {
        setRegisteredAttendee(result);
        setShowEmailModal(true);
        // Clear form
        setName("");
        setPhone("");
        setEmail("");
        setOrganization("");
        // Refresh global state
        onRefresh();
      } else {
        alert("ไม่สามารถลงทะเบียนได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: RegistrationStatus) => {
    let nextStatus = RegistrationStatus.SUCCESS;
    if (currentStatus === RegistrationStatus.SUCCESS) {
      nextStatus = RegistrationStatus.CHECKED_IN;
    } else if (currentStatus === RegistrationStatus.CHECKED_IN) {
      nextStatus = RegistrationStatus.CANCELLED;
    } else {
      nextStatus = RegistrationStatus.SUCCESS;
    }

    const success = await updateAttendeeStatus(id, nextStatus);
    if (success) {
      onRefresh();
    } else {
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบผู้เข้าร่วมงาน "${name}" หรือไม่?`)) {
      const success = await deleteAttendee(id);
      if (success) {
        onRefresh();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    }
  };

  // Filter logic
  const filteredAttendees = attendees.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.organization && item.organization.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesType = filterType === "ALL" ? true : item.type === filterType;
    const matchesDate = filterDate === "ALL" ? true : item.regDate === filterDate;
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Handle Export Excel
  const handleExportExcel = () => {
    if (filteredAttendees.length === 0) {
      alert("ไม่มีข้อมูลส่งออก");
      return;
    }
    exportAttendeesToExcel(filteredAttendees);
  };

  // Handle Print HTML / Save PDF
  const handlePrintPDF = () => {
    if (filteredAttendees.length === 0) {
      alert("ไม่มีข้อมูลรายงาน");
      return;
    }

    const title = "รายงานรายชื่อผู้ลงทะเบียนเข้าร่วมงาน";
    const columns = [
      "ลำดับ",
      "ชื่อ-นามสกุล",
      "เบอร์โทรศัพท์",
      "อีเมล",
      "กลุ่มผู้เข้าร่วม",
      "หน่วยงาน/สังกัด",
      "วันเวลาลงทะเบียน",
      "สถานะ"
    ];

    const rows = filteredAttendees.map((item, idx) => [
      idx + 1,
      item.name,
      item.phone,
      item.email,
      item.type,
      item.organization,
      `${item.regDate === "2026-07-16" ? "16 ก.ค. 69" : "17 ก.ค. 69"} (${item.regTime} น.)`,
      item.status
    ]);

    const summaryText = `จำนวนผู้ลงทะเบียนตามเงื่อนไขตัวกรองปัจจุบันทั้งหมด ${filteredAttendees.length} คน (เช็คอินแล้ว ${filteredAttendees.filter(a => a.status === RegistrationStatus.CHECKED_IN).length} คน / ค้างลงทะเบียน ${filteredAttendees.filter(a => a.status === RegistrationStatus.SUCCESS).length} คน)`;

    printReportHTML(title, columns, rows, summaryText);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Column 1: Registration Form */}
      <div className="xl:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit sticky top-24">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserPlus className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-base font-bold text-slate-800">ลงทะเบียนผู้เข้าร่วมงานใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">ชื่อ-นามสกุลผู้เข้าร่วม <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น นายปิยะพงษ์ สุขใจ"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">เบอร์โทรศัพท์ <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">อีเมลสำหรับรับแจ้งเตือน <span className="text-slate-400 font-normal">(ไม่บังคับ - กรอกหรือข้ามก็ได้)</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น piya@gmail.com (ข้ามได้)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
            <p className="text-[10px] text-emerald-700 mt-1">📧 หากระบุ ระบบจะส่งเมลแจ้งเตือนสำเร็จและรหัสผู้เข้างานทันที</p>
          </div>

          {/* Type of Attendee */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">กลุ่มประเภทผู้เข้าร่วม (ข้อ ๔)</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AttendeeType)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
            >
              {Object.values(AttendeeType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Organization */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">หน่วยงาน / สังกัด</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Building className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="เช่น กลุ่มเกษตรอินทรีย์ควนโดน หรือ มอ.หาดใหญ่"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          {/* Reg Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">วันที่เข้างาน</label>
              <select
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              >
                <option value="2026-07-16">16 ก.ค. 2569</option>
                <option value="2026-07-17">17 ก.ค. 2569</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">เวลาลงทะเบียน</label>
              <input
                type="time"
                value={regTime}
                onChange={(e) => setRegTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm transition mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>กำลังบันทึกข้อมูล...</>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                ยืนยันลงทะเบียนเข้างาน
              </>
            )}
          </button>

        </form>
      </div>

      {/* Column 2 & 3: Filter & Attendees Table */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Table Filters Box */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              ตัวกรองข้อมูลและส่งออกรายงาน
            </h3>
            
            {/* Action Download Buttons */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={handleExportExcel}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Excel
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                พิมพ์ PDF / พิมพ์รายงาน
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นชื่อ, อีเมล, สังกัด..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden"
              />
            </div>

            {/* Filter by Category */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden"
            >
              <option value="ALL">กลุ่มเป้าหมายทั้งหมด</option>
              {Object.values(AttendeeType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Filter by Date */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden"
            >
              <option value="ALL">วันที่ทั้งหมด</option>
              <option value="2026-07-16">วันแรก: 16 ก.ค. 2569</option>
              <option value="2026-07-17">วันที่สอง: 17 ก.ค. 2569</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">ผู้เข้าร่วมงาน</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">กลุ่มประเภท</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">วันเวลา / สังกัด</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400">
                      ไม่พบข้อมูลผู้ลงทะเบียนตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Name & contact */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-col sm:flex-row sm:gap-3">
                          <span>📞 {item.phone}</span>
                          <span className="hidden sm:inline">|</span>
                          <span>✉️ {item.email}</span>
                        </div>
                      </td>

                      {/* Attendee Category */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.type === AttendeeType.VIP ? "bg-amber-100 text-amber-800" :
                          item.type === AttendeeType.GOVERNMENT ? "bg-blue-100 text-blue-800" :
                          item.type === AttendeeType.FARMER ? "bg-emerald-100 text-emerald-800" :
                          item.type === AttendeeType.ENTREPRENEUR ? "bg-purple-100 text-purple-800" :
                          item.type === AttendeeType.STUDENT ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-800"
                        }`}>
                          {item.type}
                        </span>
                      </td>

                      {/* Date & Organization */}
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <div className="font-medium text-slate-700 truncate max-w-[150px]" title={item.organization}>
                          🏢 {item.organization}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.regDate === "2026-07-16" ? "16 ก.ค. 69" : "17 ก.ค. 69"} ({item.regTime} น.)
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleStatusChange(item.id, item.status)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                            item.status === RegistrationStatus.CHECKED_IN 
                              ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                              : item.status === RegistrationStatus.CANCELLED
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                          title="คลิกเพื่อสลับสถานะผู้เข้าร่วมงาน"
                        >
                          {item.status}
                        </button>
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg border border-slate-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition"
                          title="ลบรายชื่อ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 p-3 text-[11px] text-slate-500 border-t border-slate-100 flex justify-between items-center">
            <span>แสดงผล {filteredAttendees.length} จาก {attendees.length} คน</span>
            <span className="text-emerald-700 font-semibold">💡 คลิกที่สถานะเพื่อสลับเช็คอินเข้างาน (Checked-in)</span>
          </div>
        </div>

      </div>

      {/* Simulated Email Success Notification Modal */}
      {showEmailModal && registeredAttendee && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-5 relative">
              <button 
                onClick={() => setShowEmailModal(false)}
                className="absolute top-4 right-4 text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">ระบบจัดส่งอีเมลแจ้งเตือนลงทะเบียนสำเร็จ!</h3>
                  <p className="text-[11px] text-emerald-200 font-light mt-0.5">อีเมลส่งจำลองถูกส่งไปที่ {registeredAttendee.email} เรียบร้อย</p>
                </div>
              </div>
            </div>

            {/* Email Body Sandbox Preview */}
            <div className="p-5 space-y-4">
              <div className="border border-slate-100 bg-slate-50 rounded-2xl p-4 text-xs space-y-3 font-sans">
                <div className="flex justify-between border-b border-slate-200/60 pb-2 text-slate-500">
                  <span><strong>จาก:</strong> info@satunherbalcity.com (สสจ.สตูล)</span>
                  <span><strong>สถานะ:</strong> <span className="text-emerald-600 font-bold">ส่งสำเร็จ (Delivered)</span></span>
                </div>
                
                <div className="space-y-2 text-slate-700">
                  <p className="font-semibold text-emerald-800 text-xs sm:text-sm">เรียน คุณ {registeredAttendee.name},</p>
                  <p className="leading-relaxed text-[11px] sm:text-xs">
                    ระบบได้รับการยืนยันการลงทะเบียนเข้าร่วมงาน <strong>"มหกรรมเมืองสมุนไพรจังหวัดสตูล ๒๕๖๙"</strong> (Satun Herbal City 2026) สำเร็จเรียบร้อยแล้ว!
                  </p>
                  
                  <div className="bg-white rounded-xl border border-slate-200/50 p-3 my-2 space-y-1.5 text-[11px]">
                    <div>📌 <strong>วันที่จัดงาน:</strong> 16 - 17 กรกฎาคม 2569</div>
                    <div>📍 <strong>สถานที่:</strong> ศูนย์จีโอพาร์คเกตเวย์ อ.ควนโดน จ.สตูล</div>
                    <div>🔖 <strong>กลุ่มผู้เข้าร่วม:</strong> {registeredAttendee.type}</div>
                    <div>🏢 <strong>หน่วยงาน/สังกัด:</strong> {registeredAttendee.organization}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-dashed border-emerald-200 text-center gap-2">
                    <QrCode className="w-16 h-16 text-emerald-700" />
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      REG-{registeredAttendee.id.substring(0,8).toUpperCase()}
                    </span>
                    <span className="text-[9px] text-slate-400">สแกนรหัสนี้เพื่อความรวดเร็ว ณ จุดสแกนเช็คอินเข้างาน</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-200/60 pt-2 text-[10px] text-slate-400 text-center">
                  กลุ่มงานการแพทย์แผนไทยและการแพทย์ทางเลือก สำนักงานสาธารณสุขจังหวัดสตูล
                </div>
              </div>

              {/* Confirm OK */}
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition"
              >
                เสร็จสิ้นและปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
