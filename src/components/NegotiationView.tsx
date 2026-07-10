import React, { useState } from "react";
import { 
  Handshake, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Building, 
  FileText, 
  Coins, 
  Calendar, 
  Clock, 
  Printer, 
  CheckCircle,
  HelpCircle,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { BusinessNegotiation, NegotiationStatus } from "../types";
import { addNegotiation, deleteNegotiation, updateNegotiationStatus } from "../lib/dbHelper";
import { exportNegotiationsToExcel, printReportHTML } from "../lib/exportUtils";

interface NegotiationViewProps {
  negotiations: BusinessNegotiation[];
  onRefresh: () => void;
}

export default function NegotiationView({ negotiations, onRefresh }: NegotiationViewProps) {
  // Form State
  const [partnerName, setPartnerName] = useState("");
  const [partnerOrg, setPartnerOrg] = useState("");
  const [boothName, setBoothName] = useState("");
  const [productInterested, setProductInterested] = useState("");
  const [negotiationValue, setNegotiationValue] = useState("");
  const [status, setStatus] = useState<NegotiationStatus>(NegotiationStatus.IN_PROGRESS);
  const [recordDate, setRecordDate] = useState("2026-07-16");
  const [recordTime, setRecordTime] = useState("11:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("ALL");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerOrg || !boothName || !productInterested || !negotiationValue) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนเพื่อทำการบันทึกข้อมูลการเจรจาธุรกิจ");
      return;
    }

    const val = parseFloat(negotiationValue);
    if (isNaN(val) || val < 0) {
      alert("กรุณาระบุมูลค่าการเจรจาเป็นตัวเลขที่ถูกต้อง");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        partnerName,
        partnerOrg,
        boothName,
        productInterested,
        negotiationValue: val,
        status,
        recordDate,
        recordTime,
        notes: notes || "-"
      };

      const result = await addNegotiation(data);
      if (result) {
        alert("🤝 บันทึกข้อมูลการเจรจาจับคู่ค้าธุรกิจสำเร็จเรียบร้อยแล้ว!");
        // Clear Form
        setPartnerName("");
        setPartnerOrg("");
        setBoothName("");
        setProductInterested("");
        setNegotiationValue("");
        setNotes("");
        // Refresh
        onRefresh();
      } else {
        alert("ไม่สามารถบันทึกข้อมูลเจรจาธุรกิจได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: NegotiationStatus) => {
    let nextStatus = NegotiationStatus.IN_PROGRESS;
    if (currentStatus === NegotiationStatus.IN_PROGRESS) {
      nextStatus = NegotiationStatus.SUCCESS;
    } else if (currentStatus === NegotiationStatus.SUCCESS) {
      nextStatus = NegotiationStatus.FOLLOW_UP;
    } else {
      nextStatus = NegotiationStatus.IN_PROGRESS;
    }

    const success = await updateNegotiationStatus(id, nextStatus);
    if (success) {
      onRefresh();
    } else {
      alert("ไม่สามารถบันทึกสถานะได้");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบข้อมูลการเจรจากับคุณ "${name}" หรือไม่?`)) {
      const success = await deleteNegotiation(id);
      if (success) {
        onRefresh();
      } else {
        alert("ไม่สามารถลบข้อมูลเจรจาธุรกิจได้");
      }
    }
  };

  // Filters logic
  const filteredNegs = negotiations.filter(item => {
    const matchesSearch = 
      item.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partnerOrg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.boothName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productInterested.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" ? true : item.status === filterStatus;
    const matchesDate = filterDate === "ALL" ? true : item.recordDate === filterDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalFilteredValue = filteredNegs.reduce((sum, item) => sum + item.negotiationValue, 0);

  // Format currency
  const formatBaht = (num: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (filteredNegs.length === 0) {
      alert("ไม่มีข้อมูลส่งออก");
      return;
    }
    exportNegotiationsToExcel(filteredNegs);
  };

  // Print PDF
  const handlePrintPDF = () => {
    if (filteredNegs.length === 0) {
      alert("ไม่มีข้อมูลส่งออกรายงาน");
      return;
    }

    const title = "รายงานผลการเจรจาธุรกิจและการจับคู่คู่ค้าในงาน (MOU)";
    const columns = [
      "ลำดับ",
      "ผู้เจรจา (ผู้ซื้อ)",
      "บริษัท/หน่วยงานผู้ซื้อ",
      "เจรจากับบูธ (ผู้ขาย)",
      "สมุนไพร/บริการที่สนใจ",
      "มูลค่าคาดการ (บาท)",
      "สถานะดีล",
      "วันเวลา"
    ];

    const rows = filteredNegs.map((item, idx) => [
      idx + 1,
      item.partnerName,
      item.partnerOrg,
      item.boothName,
      item.productInterested,
      item.negotiationValue.toLocaleString("th-TH"),
      item.status,
      `${item.recordDate === "2026-07-16" ? "16 ก.ค." : "17 ก.ค."} (${item.recordTime} น.)`
    ]);

    const summaryText = `มูลค่าการเจรจาธุรกิจคู่ค้ารวมจากการประเมินผลสัมฤทธิ์ทั้งหมด ${formatBaht(totalFilteredValue)} จากทั้งหมด ${filteredNegs.length} ข้อตกลงร่วมทางการค้า (นับเฉพาะตัวกรองปัจจุบัน)`;

    printReportHTML(title, columns, rows, summaryText);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Column 1: Record Form */}
      <div className="xl:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit sticky top-24">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Handshake className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-base font-bold text-slate-800">บันทึกจับคู่เจรจาธุรกิจ (MOU)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Buyer/Partner Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">ชื่อผู้เจรจา (ฝ่ายผู้ซื้อ/คู่ค้า) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="เช่น คุณปิยะบุตร อัครพงศ์ไพศาล"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              required
            />
          </div>

          {/* Buyer Organization */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">บริษัท / หน่วยงานผู้ซื้อ <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Building className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={partnerOrg}
                onChange={(e) => setPartnerOrg(e.target.value)}
                placeholder="เช่น บจก. ผลิตภัณฑ์สมุนไพรกรุงเทพฯ"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          {/* Seller Booth Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">เจรจาการค้ากับบูธใดในงาน (ฝ่ายผู้ขาย) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={boothName}
              onChange={(e) => setBoothName(e.target.value)}
              placeholder="เช่น วิสาหกิจชุมชนปลูกสมุนไพรควนโดน (บูธ A01)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              required
            />
          </div>

          {/* Product Interested */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">ผลิตภัณฑ์หรือสมุนไพรที่สนใจ <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={productInterested}
                onChange={(e) => setProductInterested(e.target.value)}
                placeholder="เช่น ขมิ้นชันแห้งเกรดสกัดยา 5 ตัน/ปี"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          {/* Contract / Negotiation Value */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">มูลค่าประมาณการค้าขายสัญญา (บาท) <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Coins className="w-4 h-4 text-slate-500" />
              </span>
              <input
                type="number"
                value={negotiationValue}
                onChange={(e) => setNegotiationValue(e.target.value)}
                placeholder="เช่น 350000"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          {/* Negotiation Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">สถานะความคืบหน้าของดีล</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as NegotiationStatus)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
            >
              {Object.values(NegotiationStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">วันที่ร่วมเจรจา</label>
              <select
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              >
                <option value="2026-07-16">16 ก.ค. 2569</option>
                <option value="2026-07-17">17 ก.ค. 2569</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">เวลา</label>
              <input
                type="time"
                value={recordTime}
                onChange={(e) => setRecordTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">บันทึกรายละเอียดเพิ่มเติม / MOU</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น บรรลุข้อตกลงและลงนามเซ็นเอกสารความร่วมมือร่วมกัน..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition h-16 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm transition mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "กำลังบันทึกข้อมูล..." : (
              <>
                <Plus className="w-4 h-4" />
                บันทึกสัญญาร่วมค้าธุรกิจ
              </>
            )}
          </button>

        </form>
      </div>

      {/* Column 2 & 3: Table list and analytics */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Value metrics stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-semibold text-amber-100 uppercase">รวมมูลค่าดีลข้อตกลงธุรกิจการค้า</div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono mt-1">
              {formatBaht(negotiations.reduce((sum, n) => sum + n.negotiationValue, 0))}
            </div>
            <p className="text-[10px] text-amber-100/90 mt-2">ประเมินมูลค่าทางเศรษฐกิจสมุนไพรตามเอกสารข้อ 3</p>
          </div>
          <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-semibold text-emerald-100 uppercase">ดีลที่เซ็น MOU สำเร็จลุล่วง</div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono mt-1">
              {formatBaht(negotiations.filter(n => n.status.startsWith("เจรจาสำเร็จ")).reduce((sum, n) => sum + n.negotiationValue, 0))}
            </div>
            <p className="text-[10px] text-emerald-100/90 mt-2">
              คิดเป็นสัดส่วนความสำเร็จ {negotiations.length > 0 ? Math.round((negotiations.filter(n => n.status.startsWith("เจรจาสำเร็จ")).length / negotiations.length) * 100) : 0}% ของดีลเจรจาทั้งหมด
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              ตัวกรองการเจรจาธุรกิจ
            </h3>
            
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
                พิมพ์รายงานดีล (PDF)
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
                placeholder="ค้นผู้ซื้อ, บริษัท, ร้านขาย หรือสินค้า..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-700"
            >
              <option value="ALL">สถานะความสำเร็จทั้งหมด</option>
              {Object.values(NegotiationStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Filter by Date */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-700"
            >
              <option value="ALL">วันที่เจรจาทั้งหมด</option>
              <option value="2026-07-16">16 กรกฎาคม 2569</option>
              <option value="2026-07-17">17 กรกฎาคม 2569</option>
            </select>
          </div>
        </div>

        {/* Negotiations list table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">ฝ่ายคู่ซื้อผู้เจรจา</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">คู่สัญญาร่วม (ผู้ขาย)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">สมุนไพรและสินค้าที่ตกลง</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-right">มูลค่าประเมิน (บาท)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-center">สถานะความคืบหน้า</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-right">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNegs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-400">
                      ไม่พบข้อมูลบันทึกคู่ค้าเจรจาธุรกิจตามเงื่อนไขที่กรองไว้
                    </td>
                  </tr>
                ) : (
                  filteredNegs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition text-slate-800 text-xs">
                      
                      {/* Buyer */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-sm">{item.partnerName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          🏢 {item.partnerOrg}
                        </div>
                      </td>

                      {/* Seller Booth */}
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {item.boothName}
                      </td>

                      {/* Product details */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.productInterested}</div>
                        {item.notes && item.notes !== "-" && (
                          <div className="text-[10px] text-slate-500 mt-1 italic flex items-center gap-1 max-w-[200px] truncate" title={item.notes}>
                            <MessageSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                            {item.notes}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">
                          วันที่ {item.recordDate === "2026-07-16" ? "16" : "17"} ก.ค. เวลา {item.recordTime} น.
                        </div>
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3 text-right font-extrabold text-amber-700 font-mono text-sm">
                        {item.negotiationValue.toLocaleString("th-TH")}
                      </td>

                      {/* Status switch action */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleStatusChange(item.id, item.status)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                            item.status === NegotiationStatus.SUCCESS 
                              ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                              : item.status === NegotiationStatus.FOLLOW_UP
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                          title="คลิกเพื่อสลับเปลี่ยนสถานะของดีลการค้า"
                        >
                          {item.status}
                        </button>
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.partnerName)}
                          className="p-1 rounded-md border border-slate-100 text-rose-500 hover:bg-rose-50 transition"
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
          
          <div className="bg-slate-50 p-3 text-[11px] text-slate-500 border-t border-slate-100 flex justify-between items-center font-medium">
            <span>แสดงผลการคัดกรอง {filteredNegs.length} ดีลการค้า</span>
            <span className="text-slate-800 font-mono">
              มูลค่าดีลรวม: <span className="text-emerald-700 font-bold font-mono text-xs">{formatBaht(totalFilteredValue)}</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
