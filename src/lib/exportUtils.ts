import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Attendee, SalesTransaction, BusinessNegotiation } from "../types";

// EXCEL EXPORTS
export function exportAttendeesToExcel(attendees: Attendee[]) {
  const data = attendees.map((item, idx) => ({
    "ลำดับที่": idx + 1,
    "ชื่อ-นามสกุล": item.name,
    "เบอร์โทรศัพท์": item.phone,
    "อีเมล": item.email,
    "ประเภทผู้เข้าร่วม": item.type,
    "หน่วยงาน/สังกัด": item.organization || "-",
    "วันที่ลงทะเบียน": item.regDate === "2026-07-16" ? "16 ก.ค. 2569" : "17 ก.ค. 2569",
    "เวลาลงทะเบียน": item.regTime + " น.",
    "สถานะ": item.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ผู้เข้าร่วมงาน");
  
  // Auto column width adjustment
  const max_len = data.reduce((w, r) => Math.max(w, Object.values(r).join("").length), 10);
  worksheet["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

  XLSX.writeFile(workbook, `รายงานผู้เข้าร่วมงาน_เมืองสมุนไพรสตูล_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportTransactionsToExcel(txs: SalesTransaction[]) {
  const data = txs.map((item, idx) => ({
    "ลำดับที่": idx + 1,
    "กลุ่มบูธ": item.boothGroup,
    "หมายเลขบูธ": item.boothNumber,
    "ชื่อบูธ/ร้านค้า": item.boothName,
    "ประเภท": item.productCategory,
    "รายการสินค้า/บริการ": item.productName,
    "ยอดขาย/บริการ (บาท)": item.amount,
    "จำนวนรายการสั่งซื้อ": item.ordersCount,
    "วันที่บันทึก": item.recordDate === "2026-07-16" ? "16 ก.ค. 2569" : "17 ก.ค. 2569",
    "เวลาบันทึก": item.recordTime + " น."
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ยอดขายและบริการ");
  
  worksheet["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];

  XLSX.writeFile(workbook, `รายงานยอดขาย_เมืองสมุนไพรสตูล_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportNegotiationsToExcel(negs: BusinessNegotiation[]) {
  const data = negs.map((item, idx) => ({
    "ลำดับที่": idx + 1,
    "ชื่อผู้เจรจา (ผู้ซื้อ)": item.partnerName,
    "บริษัท/หน่วยงานผู้ซื้อ": item.partnerOrg,
    "เจรจากับบูธ (ผู้ขาย)": item.boothName,
    "สินค้า/สมุนไพรที่สนใจ": item.productInterested,
    "มูลค่าการค้า (บาท)": item.negotiationValue,
    "สถานะการเจรจา": item.status,
    "วันที่บันทึก": item.recordDate === "2026-07-16" ? "16 ก.ค. 2569" : "17 ก.ค. 2569",
    "เวลาบันทึก": item.recordTime + " น.",
    "บันทึกเพิ่มเติม": item.notes || "-"
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "การเจรจาธุรกิจ");
  
  worksheet["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 30 }, { wch: 35 }, { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 40 }];

  XLSX.writeFile(workbook, `รายงานเจรจาธุรกิจ_เมืองสมุนไพรสตูล_${new Date().toISOString().slice(0,10)}.xlsx`);
}


// PDF REPORT GENERATOR WITH HTML PRINT FRIENDLY FALLBACK (Ensures beautiful Thai fonts support)
export function printReportHTML(title: string, columns: string[], rows: any[][], summaryText?: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("กรุณาอนุญาตป็อปอัพ (Allow Popups) เพื่อส่งออกรายงานพิมพ์");
    return;
  }

  const currentDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Sarabun', sans-serif;
          margin: 40px;
          color: #333;
          background-color: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #059669;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          color: #047857;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        .meta-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 12px;
          color: #555;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 13px;
        }
        th {
          background-color: #047857;
          color: white;
          text-align: left;
          padding: 10px;
          font-weight: 600;
          border: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .summary-box {
          background-color: #f0fdf4;
          border-left: 4px solid #059669;
          padding: 15px;
          margin-top: 20px;
          font-size: 14px;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          font-size: 11px;
          color: #999;
          border-top: 1px dashed #ddd;
          padding-top: 15px;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background-color: #059669; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-family: 'Sarabun', sans-serif; font-weight: 600; font-size: 14px;">
          พิมพ์เอกสาร / บันทึกเป็น PDF
        </button>
      </div>

      <div class="header">
        <h1>${title}</h1>
        <p>งานมหกรรมเมืองสมุนไพรจังหวัดสตูล ๒๕๖๙ (Satun Herbal City 2026)</p>
        <p>แนวคิดหลัก: "สตูล เมืองสมุนไพร : จากสมุนไพรในครัวเรือนสู่เศรษฐกิจสุขภาพ"</p>
      </div>

      <div class="meta-info">
        <div><strong>ออกโดย:</strong> ระบบจัดการข้อมูลและแดชบอร์ด งานเมืองสมุนไพรสตูล</div>
        <div><strong>วันที่พิมพ์:</strong> ${currentDate}</div>
      </div>

      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : "-"}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>

      ${summaryText ? `<div class="summary-box"><strong>บทสรุปทางการเงิน/สถิติ:</strong><br/>${summaryText}</div>` : ""}

      <div class="footer">
        สำนักงานสาธารณสุขจังหวัดสตูล ถนนยาตราสวัสดิ์ ต.พิมาน อ.เมืองสตูล จ.สตูล ๙๑๐๐๐<br/>
        พิมพ์ผ่านเว็บแอปพลิเคชันระบบสารสนเทศ งานมหกรรมเมืองสมุนไพรสตูล 2569
      </div>

      <script>
        // Auto trigger print dialogue for user convenience
        window.onload = function() {
          // window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// STANDARD jsPDF (as an alternative backup tool)
export function exportToPDFStandard(title: string, headers: string[], bodyData: any[][], fileName: string) {
  const doc = new jsPDF("l", "pt", "a4");
  
  // Header Info
  doc.setFontSize(18);
  doc.text(title, 40, 40);
  
  doc.setFontSize(10);
  doc.text("Satun Herbal City 2026 - Data Report System", 40, 60);
  doc.text(`Exported: ${new Date().toLocaleString("th-TH")}`, 40, 75);
  
  // Create table
  (doc as any).autoTable({
    startY: 90,
    head: [headers],
    body: bodyData,
    theme: "striped",
    headStyles: { fillColor: [4, 120, 87] }, // emerald-700
    styles: { fontSize: 9 },
    margin: { left: 40, right: 40 }
  });
  
  doc.save(`${fileName}.pdf`);
}
