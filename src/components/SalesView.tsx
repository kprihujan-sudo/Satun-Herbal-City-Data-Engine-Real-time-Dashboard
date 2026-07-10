import React, { useState } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Layers, 
  Tag, 
  DollarSign, 
  Calendar, 
  Clock, 
  Printer, 
  Store,
  RefreshCw
} from "lucide-react";
import { SalesTransaction, BoothGroup, ProductCategory } from "../types";
import { addTransaction, deleteTransaction } from "../lib/dbHelper";
import { exportTransactionsToExcel, printReportHTML } from "../lib/exportUtils";

interface SalesViewProps {
  transactions: SalesTransaction[];
  onRefresh: () => void;
}

export default function SalesView({ transactions, onRefresh }: SalesViewProps) {
  // Form State
  const [boothGroup, setBoothGroup] = useState<BoothGroup>(BoothGroup.UPSTREAM);
  const [boothNumber, setBoothNumber] = useState("");
  const [boothName, setBoothName] = useState("");
  const [productCategory, setProductCategory] = useState<ProductCategory>(ProductCategory.PRODUCT);
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [ordersCount, setOrdersCount] = useState("");
  const [recordDate, setRecordDate] = useState("2026-07-16");
  const [recordTime, setRecordTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("ALL");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boothName || !productName || !amount || !ordersCount) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อบูธ, ชื่อสินค้า, ยอดจำหน่าย, จำนวนสั่งซื้อ)");
      return;
    }

    const parsedAmount = parseFloat(amount);
    const parsedOrders = parseInt(ordersCount, 10);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert("กรุณาระบุยอดขาย/บริการเป็นตัวเลขที่ถูกต้อง");
      return;
    }

    if (isNaN(parsedOrders) || parsedOrders < 1) {
      alert("กรุณาระบุจำนวนรายการสั่งซื้ออย่างน้อย 1 รายการ");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        boothGroup,
        boothNumber: boothNumber || "-",
        boothName,
        productCategory,
        productName,
        amount: parsedAmount,
        ordersCount: parsedOrders,
        recordDate,
        recordTime
      };

      const result = await addTransaction(data);
      if (result) {
        alert("🛍️ บันทึกยอดขายสำเร็จเรียบร้อยแล้ว!");
        // Clear Form fields but retain Booth Group, Booth Name and Number for faster input!
        setProductName("");
        setAmount("");
        setOrdersCount("");
        // Refresh
        onRefresh();
      } else {
        alert("ไม่สามารถบันทึกข้อมูลยอดขายได้");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบข้อมูลยอดจำหน่ายสินค้า "${name}" หรือไม่?`)) {
      const success = await deleteTransaction(id);
      if (success) {
        onRefresh();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    }
  };

  // Filters Logic
  const filteredTxs = transactions.filter(item => {
    const matchesSearch = 
      item.boothName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.boothNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGroup = filterGroup === "ALL" ? true : item.boothGroup === filterGroup;
    const matchesCategory = filterCategory === "ALL" ? true : item.productCategory === filterCategory;
    const matchesDate = filterDate === "ALL" ? true : item.recordDate === filterDate;

    return matchesSearch && matchesGroup && matchesCategory && matchesDate;
  });

  const totalFilteredAmount = filteredTxs.reduce((sum, item) => sum + item.amount, 0);
  const totalFilteredOrders = filteredTxs.reduce((sum, item) => sum + item.ordersCount, 0);

  // Format currency values
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
    if (filteredTxs.length === 0) {
      alert("ไม่มีข้อมูลที่จะส่งออก");
      return;
    }
    exportTransactionsToExcel(filteredTxs);
  };

  // Print PDF / HTML Report
  const handlePrintPDF = () => {
    if (filteredTxs.length === 0) {
      alert("ไม่มีข้อมูลส่งออกรายงาน");
      return;
    }

    const title = "รายงานยอดจำหน่ายสินค้าและรายได้จากการให้บริการ (ตามข้อ 3)";
    const columns = [
      "ลำดับ",
      "กลุ่มบูธจัดแสดง",
      "เลขบูธ",
      "ชื่อบูธ/ร้านค้า",
      "ประเภท",
      "รายการสินค้า/บริการ",
      "ยอดเงิน (บาท)",
      "จำนวนสั่งซื้อ",
      "วันเวลาที่บันทึก"
    ];

    const rows = filteredTxs.map((item, idx) => [
      idx + 1,
      item.boothGroup.split(" ")[0], // short name
      item.boothNumber,
      item.boothName,
      item.productCategory,
      item.productName,
      item.amount.toLocaleString("th-TH"),
      item.ordersCount,
      `${item.recordDate === "2026-07-16" ? "16 ก.ค. 69" : "17 ก.ค. 69"} (${item.recordTime} น.)`
    ]);

    const summaryText = `ยอดรวมสะพัดทั้งหมดจากการจำหน่ายและบริการ ${formatBaht(totalFilteredAmount)} จากจำนวนทั้งสิ้น ${totalFilteredOrders} รายการสั่งซื้อ (นับเฉพาะตัวกรองที่เลือกปัจจุบัน)`;

    printReportHTML(title, columns, rows, summaryText);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Column 1: Record Sales Form */}
      <div className="xl:col-span-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit sticky top-24">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-base font-bold text-slate-800">บันทึกข้อมูลยอดจำหน่าย (ข้อ 3)</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Booth Group */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">กลุ่มบูธตามห่วงโซ่คุณค่า</label>
            <select
              value={boothGroup}
              onChange={(e) => setBoothGroup(e.target.value as BoothGroup)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
            >
              {Object.values(BoothGroup).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Booth Number & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-slate-600 block">เลขบูธ</label>
              <input
                type="text"
                value={boothNumber}
                onChange={(e) => setBoothNumber(e.target.value)}
                placeholder="เช่น A01"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-600 block">ชื่อร้านค้า/บูธ <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Store className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={boothName}
                  onChange={(e) => setBoothName(e.target.value)}
                  placeholder="เช่น วิสาหกิจแปรรูปขมิ้นชันควนโดน"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Category (Product / Service) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">ประเภทธุรกรรม (ข้อ 3)</label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer transition has-checked:bg-emerald-50 has-checked:border-emerald-500 has-checked:text-emerald-800">
                <input
                  type="radio"
                  name="productCategory"
                  value={ProductCategory.PRODUCT}
                  checked={productCategory === ProductCategory.PRODUCT}
                  onChange={() => setProductCategory(ProductCategory.PRODUCT)}
                  className="hidden"
                />
                📦 จำหน่ายสินค้า/ผลิตภัณฑ์
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer transition has-checked:bg-emerald-50 has-checked:border-emerald-500 has-checked:text-emerald-800">
                <input
                  type="radio"
                  name="productCategory"
                  value={ProductCategory.SERVICE}
                  checked={productCategory === ProductCategory.SERVICE}
                  onChange={() => setProductCategory(ProductCategory.SERVICE)}
                  className="hidden"
                />
                💆 บริการตรวจ/นวดสุขภาพ
              </label>
            </div>
          </div>

          {/* Product/Service Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">ชื่อสินค้า หรือ รายการบริการสุขภาพ <span className="text-rose-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Tag className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="เช่น ชาสมุนไพรอัญชันพรีเมียม, นวดประคบ"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          {/* Amount and Orders Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">ยอดรวมยอดจำหน่าย (บาท) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="เช่น 1500"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">จำนวนใบสั่งซื้อ / รายการ <span className="text-rose-500">*</span></label>
              <input
                type="number"
                value={ordersCount}
                onChange={(e) => setOrdersCount(e.target.value)}
                placeholder="เช่น 10"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
                required
              />
            </div>
          </div>

          {/* Record Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">วันที่บันทึกธุรกรรม</label>
              <select
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              >
                <option value="2026-07-16">16 ก.ค. 2569 (วันแรก)</option>
                <option value="2026-07-17">17 ก.ค. 2569 (วันที่สอง)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 block">เวลาที่บันทึก</label>
              <input
                type="time"
                value={recordTime}
                onChange={(e) => setRecordTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
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
                บันทึกสถิติยอดจำหน่าย
              </>
            )}
          </button>

        </form>
      </div>

      {/* Column 2 & 3: Table and Filters */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Statistics Summary Mini Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
            <div className="text-[10px] font-semibold text-emerald-800 uppercase">ยอดจำหน่ายสินค้าสะสม</div>
            <div className="text-base sm:text-lg font-bold text-emerald-950 font-mono mt-1">
              {formatBaht(transactions.filter(t => t.productCategory === ProductCategory.PRODUCT).reduce((sum, t) => sum + t.amount, 0))}
            </div>
          </div>
          <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100/50">
            <div className="text-[10px] font-semibold text-sky-800 uppercase">รายได้การให้บริการสุขภาพ</div>
            <div className="text-base sm:text-lg font-bold text-sky-950 font-mono mt-1">
              {formatBaht(transactions.filter(t => t.productCategory === ProductCategory.SERVICE).reduce((sum, t) => sum + t.amount, 0))}
            </div>
          </div>
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
            <div className="text-[10px] font-semibold text-amber-800 uppercase">จำนวนบิลรายการรวม</div>
            <div className="text-base sm:text-lg font-bold text-amber-950 font-mono mt-1">
              {transactions.reduce((sum, t) => sum + t.ordersCount, 0).toLocaleString("th-TH")} รายการ
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              ตัวกรองยอดบันทึกจำหน่าย
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
                พิมพ์รายงานยอดขาย (PDF)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative sm:col-span-1">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นร้านค้า หรือรายการ..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden"
              />
            </div>

            {/* Filter by Group */}
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-700"
            >
              <option value="ALL">กลุ่มบูธทั้งหมด</option>
              {Object.values(BoothGroup).map((g) => (
                <option key={g} value={g}>{g.split(" ")[0]}</option>
              ))}
            </select>

            {/* Filter by Category */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-700"
            >
              <option value="ALL">ประเภทธุรกรรมทั้งหมด</option>
              <option value={ProductCategory.PRODUCT}>📦 ขายสินค้า/ผลิตภัณฑ์</option>
              <option value={ProductCategory.SERVICE}>💆 บริการสุขภาพ/นวดไทย</option>
            </select>

            {/* Filter by Date */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-700"
            >
              <option value="ALL">วันที่ทั้งหมด</option>
              <option value="2026-07-16">วันแรก: 16 ก.ค. 2569</option>
              <option value="2026-07-17">วันที่สอง: 17 ก.ค. 2569</option>
            </select>
          </div>
        </div>

        {/* Transactions Table list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">บูธ / ร้านค้า</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">กลุ่มจัดแสดง</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600">รายการสินค้าและบริการ</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-right">ยอดรวม (บาท)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-center">จำนวนบิล</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 text-right">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-400">
                      ไม่พบข้อมูลยอดจำหน่ายสินค้าตามเงื่อนไขปัจจุบัน
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition text-slate-800 text-xs">
                      
                      {/* Booth details */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-sm">{item.boothName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          หมายเลขบูธ: <span className="font-semibold text-slate-700 font-mono">{item.boothNumber}</span>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="px-4 py-3 text-slate-600">
                        <span className="inline-block truncate max-w-[150px]" title={item.boothGroup}>
                          {item.boothGroup.split(" ")[0]}
                        </span>
                      </td>

                      {/* Transaction product name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{item.productCategory === ProductCategory.PRODUCT ? "📦" : "💆"}</span>
                          <span className="font-medium text-slate-800">{item.productName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {item.recordDate === "2026-07-16" ? "16 ก.ค. 69" : "17 ก.ค. 69"} ({item.recordTime} น.)
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right font-bold text-slate-800 font-mono">
                        {item.amount.toLocaleString("th-TH")}
                      </td>

                      {/* Orders count */}
                      <td className="px-4 py-3 text-center font-bold text-emerald-800 font-mono">
                        {item.ordersCount}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id, item.productName)}
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
            <span>แสดงสถิติสะพัดจำหน่าย {filteredTxs.length} รายการ</span>
            <span className="text-slate-800 font-mono">
              ยอดรวมบิลคัดเลือก: <span className="text-emerald-700 font-bold font-mono text-xs">{formatBaht(totalFilteredAmount)}</span> ({totalFilteredOrders} ออเดอร์)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
